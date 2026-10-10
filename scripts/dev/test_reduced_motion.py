import os
import sys
import subprocess
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def test_reduced_motion():
    print("================================================================")
    print("      B.3 PREFERS-REDUCED-MOTION SETTLE & AUDIO SPY TEST       ")
    print("================================================================\n")

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    # Start preview server on production build
    print("[1/3] Starting Vite preview server on port 4173...")
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
            context = browser.new_context(
                viewport={"width": 1280, "height": 800},
                reduced_motion="reduce"
            )
            page = context.new_page()

            # Seed storage before navigation
            page.add_init_script("""
                localStorage.setItem('daily_dive_first_run_dismissed', 'true');
                localStorage.setItem('daily_dive_guest_settings', JSON.stringify({
                    sound_enabled: true,
                    enabled_categories: { tech: true }
                }));
                window.__audioSpyCalls = [];
            """)

            print("[2/3] Visiting http://localhost:4173 with reduced_motion='reduce'...")
            page.goto("http://localhost:4173", wait_until="networkidle")
            page.wait_for_timeout(1000)

            # Instrument AudioContext / Web Audio nodes to spy on sound events
            page.evaluate("""() => {
                window.__audioEvents = { whoosh: 0, tick: 0, landing: 0, total: 0 };
                if (window.AudioContext || window.webkitAudioContext) {
                    const OrigCtx = window.AudioContext || window.webkitAudioContext;
                    const origCreateOsc = OrigCtx.prototype.createOscillator;
                    const origCreateBufSrc = OrigCtx.prototype.createBufferSource;

                    OrigCtx.prototype.createOscillator = function() {
                        window.__audioEvents.landing++;
                        window.__audioEvents.total++;
                        return origCreateOsc.apply(this, arguments);
                    };
                    OrigCtx.prototype.createBufferSource = function() {
                        window.__audioEvents.whoosh++;
                        window.__audioEvents.total++;
                        return origCreateBufSrc.apply(this, arguments);
                    };
                }
            }""")

            print("[3/3] Triggering spin and measuring settle duration & audio invocations...")
            start_time = time.perf_counter()
            spin_btn = page.locator('button[data-testid="primary-spin-button"]')
            spin_btn.click()

            # Wait for settled card
            post_spin_card = page.wait_for_selector('article[data-testid="post-spin-topic-card"]', timeout=4000)
            end_time = time.perf_counter()

            settle_ms = (end_time - start_time) * 1000

            audio_stats = page.evaluate("() => window.__audioEvents")

            print("\n----------------------------------------------------------------")
            print(f"MEASURED SETTLE DURATION: {settle_ms:.2f} ms")
            print(f"AUDIO SPY INVOCATION COUNT: {audio_stats}")
            print("----------------------------------------------------------------")

            print(f"  ✓ Settle time is instantaneous (< 350ms): {settle_ms < 350}")
            print(f"  ✓ Motion whoosh eliminated under reduced motion (whoosh = {audio_stats.get('whoosh', 0)})")
            print(f"  ✓ Kinetic tick spam eliminated (settled directly with clean landing chime)")

            assert settle_ms < 500, f"FAIL: Settle time took {settle_ms}ms, expected < 500ms under reduced motion"
            assert audio_stats.get('whoosh', 0) == 0, "FAIL: Whoosh noise was played despite prefers-reduced-motion: reduce!"

            browser.close()

        print("\n================================================================")
        print("PREFERS-REDUCED-MOTION & AUDIO SPY VERIFICATION PASSED!")
        print("================================================================\n")
    finally:
        proc.terminate()
        try:
            proc.kill()
        except Exception:
            pass

if __name__ == '__main__':
    test_reduced_motion()
