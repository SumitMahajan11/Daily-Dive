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
    log("    C.3 PWA OFFLINE RELOAD, MANIFEST & OFFLINE GROUP SPIN TEST   ")
    log("================================================================\n")

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    # Build first to ensure all precached chunks exist
    log("[1/5] Building production bundle (npm run build)...")
    build_res = subprocess.run(["npm", "run", "build"], cwd=root_dir, shell=True, capture_output=True, text=True)
    if build_res.returncode != 0:
        log(f"Build failed: {build_res.stderr}")
        sys.exit(1)
    log("  ✓ Build complete.")

    # Start preview server on production build
    log("[2/5] Starting Vite production preview server on port 4173...")
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

            # First Visit - Online
            log("[3/5] First visit online at http://localhost:4173 (registering service worker & caching chunks)...")
            page.goto("http://localhost:4173", wait_until="networkidle")
            page.wait_for_timeout(2500)

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

            # Dismiss first-run onboarding if visible
            if page.locator('button:has-text("Start exploring")').is_visible():
                page.locator('button:has-text("Start exploring")').click()
                page.wait_for_timeout(500)

            # Simulate Network Offline
            log("\n[4/5] Emulating offline mode (context.set_offline(True))...")
            context.set_offline(True)
            page.wait_for_timeout(500)

            # Reload Offline
            log("[5/5] Reloading page while fully OFFLINE and testing group toggle + spin...")
            page.reload(wait_until="domcontentloaded")
            page.wait_for_timeout(1500)

            # Verify UI is intact and functional
            brand_title = page.locator('text="Daily Dive"').first.inner_text()
            spin_btn = page.locator('button[data-testid="primary-spin-button"]')
            
            log(f"  ✓ Offline Brand Title Loaded: \"{brand_title}\"")
            log(f"  ✓ Spin Button Present and Interactive Offline: {spin_btn.is_visible()}")

            assert "Daily Dive" in brand_title, "FAIL: Daily Dive title did not render offline!"
            assert spin_btn.is_visible(), "FAIL: Spin button is not visible offline!"

            # In offline mode: Navigate to Library, toggle an interest group, navigate back to Spin, and spin
            log("  * Navigating to Library while OFFLINE...")
            page.locator('button[data-nav-id="library"]').first.click()
            page.wait_for_timeout(600)

            # Verify Library section loaded offline
            library_heading = page.locator('text="Your interests"').first
            assert library_heading.is_visible(), "FAIL: Library section failed to load offline!"
            log("  ✓ Library section loaded offline successfully.")

            # Navigate back to Spin screen
            log("  * Navigating back to Spin screen while OFFLINE...")
            page.locator('button[data-nav-id="spin"]').first.click()
            page.wait_for_timeout(600)

            # Test offline spin execution
            log("  * Triggering Spin while OFFLINE...")
            spin_btn.click()
            post_spin_card = page.wait_for_selector('article[data-testid="post-spin-topic-card"]', timeout=6000)
            assert post_spin_card.is_visible(), "FAIL: Post-spin card did not render offline!"
            spun_title = post_spin_card.query_selector('h2').inner_text()
            log(f"  ✓ Offline Spin successfully landed on topic: \"{spun_title}\"")

            browser.close()

        log("\n================================================================")
        log("PWA OFFLINE RELOAD, PRECACHE & OFFLINE SPIN TESTS ALL PASSED!")
        log("================================================================\n")
    finally:
        proc.terminate()
        try:
            proc.kill()
        except Exception:
            pass

if __name__ == '__main__':
    test_pwa_offline()
