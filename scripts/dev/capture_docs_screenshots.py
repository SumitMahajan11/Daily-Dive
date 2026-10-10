import os
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

DOCS_SCREENSHOTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs', 'screenshots'))
os.makedirs(DOCS_SCREENSHOTS_DIR, exist_ok=True)

def capture_screenshots():
    print("================================================================")
    print("          CAPTURING REAL PRODUCT SCREENSHOTS FOR DOCS           ")
    print("================================================================\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Desktop Spin Screen
        print("[1/4] Capturing Desktop Spin Screen...")
        ctx_desktop = browser.new_context(viewport={"width": 1280, "height": 800})
        page_d = ctx_desktop.new_page()
        page_d.add_init_script("""
            localStorage.setItem('daily_dive_first_run_dismissed', 'true');
        """)
        page_d.goto("http://localhost:5173", wait_until="networkidle")
        page_d.wait_for_timeout(800)
        
        # Trigger spin to show card
        page_d.locator('button[data-testid="primary-spin-button"]').click()
        page_d.wait_for_timeout(1000)
        
        path1 = os.path.join(DOCS_SCREENSHOTS_DIR, 'spin_screen_desktop.png')
        page_d.screenshot(path=path1)
        print(f"  ✓ Saved {path1}")

        # 2. Mobile Spin Screen
        print("\n[2/4] Capturing Mobile Spin Screen...")
        ctx_mobile = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
        page_m = ctx_mobile.new_page()
        page_m.add_init_script("""
            localStorage.setItem('daily_dive_first_run_dismissed', 'true');
        """)
        page_m.goto("http://localhost:5173", wait_until="networkidle")
        page_m.wait_for_timeout(800)
        page_m.locator('button[data-testid="primary-spin-button"]').click()
        page_m.wait_for_timeout(1000)
        
        path2 = os.path.join(DOCS_SCREENSHOTS_DIR, 'spin_screen_mobile.png')
        page_m.screenshot(path=path2)
        print(f"  ✓ Saved {path2}")
        ctx_mobile.close()

        # 3. Desktop Library Screen
        print("\n[3/4] Capturing Desktop Library Screen...")
        page_d.locator('button[data-nav-id="library"]').or_(page_d.locator('button:has-text("Library")')).first.click()
        page_d.wait_for_timeout(800)
        path3 = os.path.join(DOCS_SCREENSHOTS_DIR, 'library_screen_desktop.png')
        page_d.screenshot(path=path3)
        print(f"  ✓ Saved {path3}")

        # 4. Desktop Progress Screen
        print("\n[4/4] Capturing Desktop Progress Screen...")
        page_d.locator('button[data-nav-id="progress"]').or_(page_d.locator('button:has-text("Progress")')).first.click()
        page_d.wait_for_timeout(800)
        path4 = os.path.join(DOCS_SCREENSHOTS_DIR, 'progress_screen_desktop.png')
        page_d.screenshot(path=path4)
        print(f"  ✓ Saved {path4}")

        ctx_desktop.close()
        browser.close()

    print("\n================================================================")
    print("ALL SCREENSHOTS CAPTURED SUCCESSFULLY IN docs/screenshots/")
    print("================================================================\n")

if __name__ == '__main__':
    capture_screenshots()
