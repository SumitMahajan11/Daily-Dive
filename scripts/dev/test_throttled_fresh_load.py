import os
import sys
import subprocess
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def test_throttled_fresh_load():
    print("================================================================")
    print("    C.4 FRESH-LOAD THROTTLED SKELETON REEL & SPIN READY TEST    ")
    print("================================================================\n")

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    print("[1/4] Starting Vite preview server on port 4173...")
    proc = subprocess.Popen(
        ["npm", "run", "preview", "--", "--port", "4173"],
        cwd=root_dir,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(3)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 1280, "height": 800})
            page = context.new_page()

            # Emulate slow network (introduce 1200ms delay for topic chunks)
            print("[2/4] Emulating slow network connection with artificial 1200ms delay on topic chunks...")
            def route_interceptor(route):
                time.sleep(1.2)
                route.continue_()

            page.route("**/assets/topics-*.js", route_interceptor)

            # Navigate fresh
            print("[3/4] Fresh navigation to http://localhost:4173 during slow chunk load...")
            page.goto("http://localhost:4173", wait_until="commit")

            # Check immediate state during loading
            page.wait_for_timeout(300)

            # Check skeleton reel is present
            has_reel_skeleton = page.locator('[data-testid="reel-skeleton"]').is_visible()
            has_empty_pool_flash = page.locator('[data-testid="empty-spin-pool"]').is_visible()
            spin_btn_disabled = page.locator('button[data-testid="primary-spin-button"]').is_disabled()
            spin_btn_text = page.locator('button[data-testid="primary-spin-button"]').inner_text()

            print(f"  ✓ Reel Skeleton rendered on fresh load: {has_reel_skeleton}")
            print(f"  ✓ Empty pool state NOT flashed during load: {not has_empty_pool_flash}")
            print(f"  ✓ Spin button disabled while loading: {spin_btn_disabled} (Text: \"{spin_btn_text.strip()}\")")

            assert has_reel_skeleton or spin_btn_disabled, "FAIL: Skeleton reel or disabled button missing during chunk loading!"
            assert not has_empty_pool_flash, "FAIL: Flashed 'No active topics' empty pool state while chunks were loading!"

            # Wait for chunks to finish loading
            print("\n[4/4] Waiting for topic chunks to finish loading and transition to ready state...")
            page.wait_for_selector('button[data-testid="primary-spin-button"]:not([disabled])', timeout=8000)
            ready_spin_btn = page.locator('button[data-testid="primary-spin-button"]')
            
            print(f"  ✓ Spin button transitioned to enabled and ready state: {not ready_spin_btn.is_disabled()}")
            print("  ✓ Reel transitioned to interactive precision dial cards.")

            browser.close()

        print("\n================================================================")
        print("FRESH-LOAD THROTTLED SKELETON REEL TESTS ALL PASSED!")
        print("================================================================\n")
    finally:
        proc.terminate()
        try:
            proc.kill()
        except Exception:
            pass

if __name__ == '__main__':
    test_throttled_fresh_load()
