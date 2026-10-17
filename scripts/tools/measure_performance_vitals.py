import os
import sys
import subprocess
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def measure_production_metrics():
    print("================================================================")
    print("      PART E: PRODUCTION CHUNKS & CORE WEB VITALS AUDIT        ")
    print("================================================================\n")

    # 1. Build Chunk Analysis
    dist_assets_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'dist', 'assets'))
    print("--- PRODUCTION BUILD CHUNK SIZES ---")
    total_size = 0
    if os.path.exists(dist_assets_dir):
        files = sorted(os.listdir(dist_assets_dir))
        for f in files:
            size_kb = os.path.getsize(os.path.join(dist_assets_dir, f)) / 1024
            total_size += size_kb
            print(f"  - {f:<40}: {size_kb:>8.2f} kB")
        print(f"Total Assets Size: {total_size:.2f} kB\n")

    # Start preview server on port 4174
    print("[1/2] Launching preview server on port 4174...")
    proc = subprocess.Popen(
        ["npm", "run", "preview", "--", "--port", "4174"],
        cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(3)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            # Mobile emulation: Moto G4 / Pixel style viewport
            context = browser.new_context(
                viewport={"width": 390, "height": 844},
                is_mobile=True,
                device_scale_factor=2
            )
            page = context.new_page()

            page.add_init_script("""
                localStorage.setItem('daily_dive_first_run_dismissed', 'true');
            """)

            t0 = time.time()
            page.goto("http://localhost:4174", wait_until="networkidle")
            load_time_ms = (time.time() - t0) * 1000

            # Measure performance timings via Navigation & Resource Timing API
            perf_metrics = page.evaluate("""() => {
                const nav = performance.getEntriesByType('navigation')[0] || {};
                const paint = performance.getEntriesByType('paint') || [];
                const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
                
                // Calculate LCP from performance entries if available
                let lcp = fcp;
                try {
                    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
                    if (lcpEntries.length > 0) {
                        lcp = lcpEntries[lcpEntries.length - 1].startTime;
                    }
                } catch(e) {}

                return {
                    domInteractive: nav.domInteractive || 0,
                    domContentLoaded: nav.domContentLoadedEventEnd || 0,
                    loadComplete: nav.loadEventEnd || 0,
                    fcp: fcp,
                    lcp: lcp,
                    transferSize: nav.transferSize || 0
                };
            }""")

            print("[2/2] Core Web Vitals & Load Performance (Mobile Preset):")
            print(f"  ✓ First Contentful Paint (FCP) : {perf_metrics['fcp']:.1f} ms")
            print(f"  ✓ Largest Contentful Paint (LCP): {perf_metrics['lcp']:.1f} ms")
            print(f"  ✓ DOM Interactive              : {perf_metrics['domInteractive']:.1f} ms")
            print(f"  ✓ Total Load Time              : {load_time_ms:.1f} ms")
            print(f"  ✓ Total Over-the-Wire Transfer : {perf_metrics['transferSize'] / 1024:.2f} kB")

            browser.close()

        print("\n================================================================")
        print("PERFORMANCE BENCHMARKING COMPLETE!")
        print("================================================================\n")
    finally:
        proc.terminate()
        try:
            proc.kill()
        except Exception:
            pass

if __name__ == '__main__':
    measure_production_metrics()
