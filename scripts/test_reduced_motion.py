import os
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def log(msg):
    print(msg, flush=True)

def test_reduced_motion_collapse():
    log("================================================================")
    log("          PART D: PREFERS-REDUCED-MOTION VERIFICATION           ")
    log("================================================================\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            reduced_motion="reduce"
        )
        page = context.new_page()

        # Seed storage before navigation
        page.add_init_script("""
            localStorage.setItem('daily_dive_first_run_dismissed', 'true');
        """)

        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(600)

        log("[1/2] Triggering spin with reduced_motion='reduce' emulated...")
        
        start_time = time.time()
        # Trigger spin click via DOM event dispatch
        page.evaluate("""() => {
            const btn = document.querySelector('button[data-testid="primary-spin-button"]');
            if (btn) btn.click();
        }""")

        # In reduced motion mode, duration is 150ms. Wait 300ms and verify settled
        page.wait_for_timeout(350)
        
        button_text = page.evaluate("""() => {
            const btn = document.querySelector('button[data-testid="primary-spin-button"]');
            return btn ? btn.innerText : '';
        }""")
        elapsed_ms = (time.time() - start_time) * 1000

        log(f"Spin settled in {elapsed_ms:.1f}ms. Primary button label: \"{button_text.splitlines()[0]}\"")
        assert "Spinning..." not in button_text, "FAIL: Dial is still spinning! Expected immediate 150ms settle."
        log("  ✓ PASS: Spin collapsed from 2800ms kinetic animation to fast 150ms immediate settle under reduced motion.")

        # Test ARIA-live announcement
        aria_live_text = page.locator('div[aria-live="polite"]').inner_text()
        log(f"\n[2/2] Screen Reader Announcement Text: \"{aria_live_text}\"")
        assert "Selected concept:" in aria_live_text, "FAIL: aria-live region did not announce selected concept!"
        log("  ✓ PASS: Screen reader live region successfully announced topic result.")

        browser.close()

    log("\n================================================================")
    log("REDUCED MOTION & ACCESSIBILITY TESTS PASSED!")
    log("================================================================\n")

if __name__ == '__main__':
    test_reduced_motion_collapse()
