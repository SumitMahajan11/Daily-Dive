import os
import sys
import subprocess
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def log(msg):
    print(msg, flush=True)

def test_pwa_offline():
    log("================================================================")
    log("          PART E: PWA OFFLINE RELOAD & MANIFEST TEST            ")
    log("================================================================\n")

    # Start preview server on production build
    log("[1/4] Starting Vite production preview server on port 4173...")
    proc = subprocess.Popen(
        ["npm", "run", "preview", "--", "--port", "4173"],
        cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), "..")),
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

            # First Visit - Online
            log("[2/4] First visit online at http://localhost:4173 (registering service worker)...")
            page.goto("http://localhost:4173", wait_until="networkidle")
            page.wait_for_timeout(2000)

            # Check Service Worker registration
            sw_registered = page.evaluate("""async () => {
                if (!('serviceWorker' in navigator)) return false;
                const reg = await navigator.serviceWorker.getRegistration();
                return !!reg;
            }""")
            log(f"  ✓ Service Worker registered: {sw_registered}")
            assert sw_registered, "FAIL: Service Worker failed to register!"

            # Check manifest
            manifest_ok = page.evaluate("""async () => {
                try {
                    const res = await fetch('/manifest.webmanifest');
                    if (!res.ok) return false;
                    const json = await res.json();
                    return json.name === 'Daily Dive' && json.display === 'standalone';
                } catch (e) {
                    return false;
                }
            }""")
            log(f"  ✓ Web App Manifest verified: {manifest_ok}")
            assert manifest_ok, "FAIL: Web App Manifest is missing or invalid!"

            # Simulate Network Offline
            log("\n[3/4] Emulating offline mode (context.set_offline(True))...")
            context.set_offline(True)
            page.wait_for_timeout(500)

            # Reload Offline
            log("[4/4] Reloading page while fully OFFLINE...")
            page.reload(wait_until="domcontentloaded")
            page.wait_for_timeout(1500)

            # Verify UI is intact and functional
            brand_title = page.locator('text="Daily Dive"').first.inner_text()
            spin_btn_visible = page.locator('button[data-testid="primary-spin-button"]').is_visible()
            
            log(f"  ✓ Offline Brand Title Loaded: \"{brand_title}\"")
            log(f"  ✓ Spin Button Present and Interactive Offline: {spin_btn_visible}")

            assert "Daily Dive" in brand_title, "FAIL: Daily Dive title did not render offline!"
            assert spin_btn_visible, "FAIL: Spin button is not visible offline!"

            # Test offline spin execution
            page.locator('button[data-testid="primary-spin-button"]').click()
            page.wait_for_timeout(400)
            log("  ✓ Offline Spin successfully executed!")

            browser.close()

        log("\n================================================================")
        log("PWA OFFLINE RELOAD & SERVICE WORKER TESTS PASSED!")
        log("================================================================\n")
    finally:
        proc.terminate()
        try:
            proc.kill()
        except Exception:
            pass

if __name__ == '__main__':
    test_pwa_offline()
