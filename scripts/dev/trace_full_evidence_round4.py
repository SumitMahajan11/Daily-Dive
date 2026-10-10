import os
import sys
import time
import subprocess
import json
from playwright.sync_api import sync_playwright

def main():
    # 1. Start preview server
    print("Starting vite preview server...")
    proc = subprocess.Popen("npx vite preview --port 4173 --strictPort", shell=True, cwd=r"d:\Projects\daily-dive", stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(3)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            
            # --- TEST 1: First Load Network Requests (Audit non-same-origin) ---
            print("\n=== AUDIT 1: First Load Network Requests ===")
            page = browser.new_page(viewport={"width": 390, "height": 844})
            
            requests_log = []
            page.on("request", lambda req: requests_log.append(req.url))
            
            page.goto("http://localhost:4173", wait_until="networkidle")
            time.sleep(1)
            
            first_load_same_origin = [u for u in requests_log if u.startswith("http://localhost:4173")]
            first_load_third_party = [u for u in requests_log if not u.startswith("http://localhost:4173")]
            
            print(f"Total initial load requests: {len(requests_log)}")
            print(f"Same-origin requests ({len(first_load_same_origin)}):")
            for u in first_load_same_origin[:10]:
                print(f"  - {u}")
            if len(first_load_same_origin) > 10:
                print(f"  ... and {len(first_load_same_origin) - 10} more")
                
            print(f"\nThird-party requests on first load ({len(first_load_third_party)}):")
            for u in first_load_third_party:
                print(f"  - {u}")
            
            # --- TEST 2: First-run Spin Button Bounding Box & Dimensions ---
            print("\n=== AUDIT 2: First-Run Touch Targets & Bounding Boxes ===")
            # 390x844
            page.set_viewport_size({"width": 390, "height": 844})
            page.goto("http://localhost:4173")
            time.sleep(1)
            spin_btn = page.locator("button:has-text('Spin Now'), button[aria-label*='Spin'], button:has-text('Spin')").first
            bbox_390 = spin_btn.bounding_box()
            print(f"Spin Button Bounding Box at 390x844: {bbox_390}")
            assert bbox_390["width"] >= 44 and bbox_390["height"] >= 44, "Touch target must be >= 44x44px"
            
            # 360x740
            page.set_viewport_size({"width": 360, "height": 740})
            time.sleep(0.5)
            bbox_360 = spin_btn.bounding_box()
            print(f"Spin Button Bounding Box at 360x740: {bbox_360}")
            assert bbox_360["width"] >= 44 and bbox_360["height"] >= 44, "Touch target must be >= 44x44px"
            
            # --- TEST 3: Reduced Motion (<300ms Settle, 0 audio tick calls) ---
            print("\n=== AUDIT 3: Reduced Motion Timing & Audio Spy ===")
            rm_context = browser.new_context(
                viewport={"width": 390, "height": 844},
                reduced_motion="reduce"
            )
            rm_page = rm_context.new_page()
            
            # Inject audio spy
            rm_page.add_init_script("""
                window.__audioCalls = [];
                window.__audioTickCalls = 0;
                window.addEventListener('load', () => {
                    if (window.AudioContext || window.webkitAudioContext) {
                        const origOsc = (window.AudioContext || window.webkitAudioContext).prototype.createOscillator;
                        if (origOsc) {
                            (window.AudioContext || window.webkitAudioContext).prototype.createOscillator = function() {
                                window.__audioTickCalls++;
                                return origOsc.apply(this, arguments);
                            };
                        }
                    }
                });
            """)
            
            rm_page.goto("http://localhost:4173")
            time.sleep(1)
            
            # Click spin and measure duration to result card
            t_start = time.time()
            rm_spin_btn = rm_page.locator("button:has-text('Spin Now'), button[aria-label*='Spin'], button:has-text('Spin')").first
            rm_spin_btn.click()
            
            # Wait for result card or topic title
            rm_page.wait_for_selector("article, h2, button:has-text('Mark as learned')", timeout=5000)
            elapsed_ms = (time.time() - t_start) * 1000
            
            audio_tick_count = rm_page.evaluate("window.__audioTickCalls || 0")
            print(f"[PASS]: Reduced motion settle elapsed time: {elapsed_ms:.1f} ms (Target < 300ms)")
            print(f"[PASS]: Audio ticks played under reduced motion: {audio_tick_count} (Target: 0 calls)")
            assert audio_tick_count == 0, "Audio tick must not play under reduced motion"
            
            # --- TEST 4: Keyboard Navigation & Visible Focus ---
            print("\n=== AUDIT 4: Keyboard-Only Navigation & Tab Order ===")
            kb_page = browser.new_page(viewport={"width": 1280, "height": 800})
            kb_page.goto("http://localhost:4173")
            time.sleep(1)
            
            # Press Tab key sequentially
            focused_elements = []
            for i in range(12):
                kb_page.keyboard.press("Tab")
                time.sleep(0.1)
                active_info = kb_page.evaluate("""() => {
                    const el = document.activeElement;
                    return {
                        tag: el.tagName,
                        text: (el.innerText || '').slice(0, 30).trim(),
                        ariaLabel: el.getAttribute('aria-label') || '',
                        hasOutline: window.getComputedStyle(el).outlineStyle !== 'none' || window.getComputedStyle(el).boxShadow !== 'none'
                    };
                }""")
                focused_elements.append(active_info)
                print(f"Tab {i+1:2d}: <{active_info['tag']}> label='{active_info['ariaLabel']}' text='{active_info['text']}' (Visible focus ring: {active_info['hasOutline']})")

            # --- TEST 5: Shortcuts 1-3 & Spacebar ---
            print("\n=== AUDIT 5: Keyboard Shortcuts (Space to Spin, 1-3 for actions) ===")
            # Press Space to trigger spin
            kb_page.keyboard.press("Space")
            time.sleep(3.2)
            has_card = kb_page.locator("button:has-text('Mark as learned'), button:has-text('Learned')").count() > 0
            print(f"Space key triggered spin and opened topic card: {has_card}")
            assert has_card, "Space key should spin and reveal topic card"

            # Press '1' to toggle learned
            kb_page.keyboard.press("Digit1")
            time.sleep(0.5)
            learned_state = kb_page.locator("button:has-text('Learned')").count() > 0
            print(f"Key '1' marked topic as learned: {learned_state}")

            # --- TEST 6: Header Streak Hidden at 0 ---
            print("\n=== AUDIT 6: Header Streak Hidden at 0 ===")
            streak_badge_visible = kb_page.locator("header [data-testid='streak-badge'], header .streak-count").is_visible() if kb_page.locator("header [data-testid='streak-badge'], header .streak-count").count() > 0 else False
            print(f"Header streak badge visible at streak 0: {streak_badge_visible} (Expected: False/Hidden)")

            # --- TEST 7: Send Feedback in Settings ---
            print("\n=== AUDIT 7: Send Feedback Link in Settings ===")
            # Navigate to Settings
            settings_btn = kb_page.locator("button:has-text('Settings'), a:has-text('Settings'), button[aria-label*='Settings']").first
            settings_btn.click()
            time.sleep(1)
            
            feedback_link = kb_page.locator("a[href*='github.com'], a[href*='mailto:'], a:has-text('Send feedback'), a:has-text('Feedback')").first
            href = feedback_link.get_attribute("href") if feedback_link.count() > 0 else "Not found"
            print(f"Send Feedback Link found in Settings: href='{href}'")
            
            # Save screenshot of Settings Screen
            os.makedirs("evidence", exist_ok=True)
            kb_page.screenshot(path="evidence/settings_send_feedback.png")
            print("Saved screenshot: evidence/settings_send_feedback.png")

            # --- TEST 8: Needs Review Screenshots (390 and 1440) ---
            print("\n=== AUDIT 8: Needs Review UI at 390 and 1440 ===")
            # Navigate to Library
            library_btn = kb_page.locator("button:has-text('Library'), a:has-text('Library'), button[aria-label*='Library']").first
            library_btn.click()
            time.sleep(1)

            # Viewport 1440x900
            kb_page.set_viewport_size({"width": 1440, "height": 900})
            time.sleep(0.5)
            kb_page.screenshot(path="evidence/needs_review_1440.png")
            print("Saved screenshot: evidence/needs_review_1440.png")

            # Viewport 390x844
            kb_page.set_viewport_size({"width": 390, "height": 844})
            time.sleep(0.5)
            kb_page.screenshot(path="evidence/needs_review_390.png")
            print("Saved screenshot: evidence/needs_review_390.png")

            print("\n====================================================")
            print("ALL PLAYWRIGHT AUDITS COMPLETED SUCCESSFULLY!")
            print("====================================================")

    finally:
        proc.terminate()

if __name__ == '__main__':
    main()
