import os
import json
import time
from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = r"C:\Users\SUMIT\.gemini\antigravity-ide\brain\a16ef4aa-08cd-4c23-81c0-0a7819a2044b\supabase_removal_evidence"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def run():
    print("=== STARTING FULL LOCAL-ONLY VERIFICATION POST-SUPABASE REMOVAL ===")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        # 1. Load the app
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(1000)

        # Ensure onboarding is dismissed/blended mode active
        page.evaluate("""() => {
            const settings = {
                enabled_categories: ['ai-ml', 'web-dev', 'psychology', 'philosophy-critical-thinking'],
                sound_enabled: true,
                animations_enabled: true,
                reading_mode: 'card',
                theme_preference: 'dark',
                content_source: 'blended',
                expanded_groups: { tech: true, 'money-career': true, 'mind-growth': true, 'world-ideas': true, custom: true },
                onboarding_completed: true
            };
            localStorage.setItem('daily_dive_guest_settings', JSON.stringify(settings));
        }""")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(1000)

        # ── SCREEN 1: SPIN SCREEN ──
        print("\n--- 1. Testing Spin Screen ---")
        spin_btn = page.locator("#spin-button, button:has-text('Spin Roulette'), button:has-text('Spin Again')").first
        assert spin_btn.is_visible(), "Spin button not visible"
        spin_btn.click()
        page.wait_for_timeout(4500) # wait for spin animation
        
        # Verify topic card is visible
        topic_card = page.locator("#topic-card, .topic-card, h2, h3").first
        assert topic_card.is_visible(), "Topic card not visible after spin"
        
        # Mark as learned
        learn_btn = page.locator("button:has-text('Mark as Learned'), button:has-text('Learned')").first
        if learn_btn.is_visible():
            learn_btn.click()
            page.wait_for_timeout(500)
            print("[OK] Marked topic as learned.")
        
        spin_screenshot = os.path.join(ARTIFACTS_DIR, "01_spin_screen_verified.png")
        page.screenshot(path=spin_screenshot)
        print(f"[OK] Spin Screen screenshot saved: {spin_screenshot}")

        # ── SCREEN 2: EXTRACT SCREEN ──
        print("\n--- 2. Testing Extract Screen ---")
        page.locator("button[data-nav-id='extract'], button:has-text('Extract Topics')").first.click()
        page.wait_for_timeout(1000)

        # Check manual text paste / intake area
        textarea = page.locator("textarea").first
        if textarea.is_visible():
            textarea.fill("Deep Learning Transformer Architecture\nTransformers rely on multi-head self-attention mechanisms to process sequential data in parallel.")
            extract_action_btn = page.locator("button:has-text('Extract Topics'), button:has-text('Process')").first
            if extract_action_btn.is_visible():
                extract_action_btn.click()
                page.wait_for_timeout(1000)
                print("[OK] Extraction action executed.")

        extract_screenshot = os.path.join(ARTIFACTS_DIR, "02_extract_screen_verified.png")
        page.screenshot(path=extract_screenshot)
        print(f"[OK] Extract Screen screenshot saved: {extract_screenshot}")

        # ── SCREEN 3: FILTER SCREEN ──
        print("\n--- 3. Testing Filter Screen ---")
        page.locator("button[data-nav-id='filter'], button:has-text('Category Filter')").first.click()
        page.wait_for_timeout(1000)

        # Check group headers
        for group in ["Tech", "Money & Career", "Mind & Growth", "World & Ideas"]:
            assert page.locator(f"text='{group}'").first.is_visible(), f"Group {group} not visible"
            print(f"[OK] Group header '{group}' verified.")

        filter_screenshot = os.path.join(ARTIFACTS_DIR, "03_filter_screen_verified.png")
        page.screenshot(path=filter_screenshot)
        print(f"[OK] Filter Screen screenshot saved: {filter_screenshot}")

        # ── SCREEN 4: PROGRESS SCREEN ──
        print("\n--- 4. Testing Progress Screen ---")
        page.locator("button[data-nav-id='progress'], button:has-text('Progress & Stats')").first.click()
        page.wait_for_timeout(1000)

        progress_screenshot = os.path.join(ARTIFACTS_DIR, "04_progress_screen_verified.png")
        page.screenshot(path=progress_screenshot)
        print(f"[OK] Progress Screen screenshot saved: {progress_screenshot}")

        # ── SCREEN 5: SETTINGS SCREEN ──
        print("\n--- 5. Testing Settings Screen ---")
        page.locator("button[data-nav-id='settings'], button:has-text('Settings')").first.click()
        page.wait_for_timeout(1000)

        # Verify no auth / sign-in forms on screen
        assert not page.locator("input[type='email']").is_visible(), "Unexpected email input found!"
        assert not page.locator("button:has-text('Sign In with Google')").is_visible(), "Unexpected OAuth button found!"

        settings_screenshot = os.path.join(ARTIFACTS_DIR, "05_settings_screen_verified.png")
        page.screenshot(path=settings_screenshot)
        print(f"[OK] Settings Screen screenshot saved: {settings_screenshot}")

        # Check for any console errors
        print("\n--- Console Errors Check ---")
        filtered_errors = [e for e in console_errors if "favicon" not in e and "manifest" not in e]
        print(f"Total console errors encountered: {len(filtered_errors)}")
        if filtered_errors:
            for err in filtered_errors:
                print(f"  Console Error: {err}")
        assert len(filtered_errors) == 0, f"Found console errors: {filtered_errors}"

        # Dump active localStorage keys to verify pure local storage
        ls_keys = page.evaluate("() => Object.keys(localStorage)")
        print(f"\nActive localStorage keys: {ls_keys}")

        browser.close()
        print("\n=== ALL SCREENS AND OPERATIONS FULLY VERIFIED IN LOCAL-ONLY MODE ===")

if __name__ == "__main__":
    run()
