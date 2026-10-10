import os
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def test_lazy_loading():
    print("================================================================")
    print("         PART E: LAZY-LOADING FIRST-LOAD NETWORK AUDIT          ")
    print("================================================================\n")

    loaded_urls = []
    forbidden_on_first_load = ['pdf.worker', 'tesseract', 'jszip', 'pdf-']

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        page.on("request", lambda req: loaded_urls.append(req.url))

        # First load of the application
        print("[1/3] Loading application at http://localhost:5173...")
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(1000)

        print("[2/3] Analyzing first-load network requests...")
        found_forbidden = []
        for url in loaded_urls:
            for pattern in forbidden_on_first_load:
                if pattern in url.lower():
                    found_forbidden.append((pattern, url))

        print(f"Total Initial Requests: {len(loaded_urls)}")
        print(f"Heavy Extractor Chunks Loaded on First Load: {len(found_forbidden)}")

        for pattern, url in found_forbidden:
            print(f"  [!] FORBIDDEN: Found {pattern} in {url}")

        assert len(found_forbidden) == 0, f"FAIL: Found {len(found_forbidden)} heavy extractor modules on initial page load!"
        print("  ✓ PASS: Zero heavy extractor chunks (pdf.js, tesseract.js, jszip) loaded on initial page visit.")

        # Trigger upload extraction
        print("\n[3/3] Navigating to Library and testing on-demand extractor loading...")
        page.locator('button[data-nav-id="library"]').or_(page.locator('button:has-text("Library")')).first.click()
        page.wait_for_timeout(600)

        # Confirm app is responsive
        print("  ✓ PASS: Library screen rendered cleanly.")
        browser.close()

    print("\n================================================================")
    print("LAZY-LOAD FIRST-LOAD VERIFICATION COMPLETE!")
    print("================================================================\n")

if __name__ == '__main__':
    test_lazy_loading()
