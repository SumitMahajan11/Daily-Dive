import os
import sys
import subprocess
import time
from urllib.parse import urlparse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def test_zero_third_party_requests():
    print("================================================================")
    print("      C.1 ZERO THIRD-PARTY / SAME-ORIGIN NETWORK AUDIT         ")
    print("================================================================\n")

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    # 1. Build project
    print("[1/4] Running npm run build...")
    build_res = subprocess.run(["npm", "run", "build"], cwd=root_dir, shell=True, capture_output=True, text=True)
    if build_res.returncode != 0:
        print("Build failed:", build_res.stderr)
        sys.exit(1)
    print("  ✓ Build complete.")

    # 2. Launch preview
    print("[2/4] Starting Vite preview server on port 4173...")
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
            context = browser.new_context()
            page = context.new_page()

            network_requests = []
            page.on("request", lambda req: network_requests.append(req.url))

            print("[3/4] Navigating to http://localhost:4173 with cold cache...")
            page.goto("http://localhost:4173", wait_until="networkidle")
            page.wait_for_timeout(2000)

            print(f"\n[4/4] Analyzing {len(network_requests)} network requests recorded on first-load:")
            third_party_requests = []
            for url in network_requests:
                parsed = urlparse(url)
                is_same_origin = (parsed.hostname == "localhost" and parsed.port == 4173) or url.startswith("data:")
                status = "SAME-ORIGIN" if is_same_origin else "EXTERNAL / 3RD-PARTY"
                print(f"  [{status}] {url}")
                if not is_same_origin:
                    third_party_requests.append(url)

            print("\n----------------------------------------------------------------")
            print(f"Total Requests: {len(network_requests)}")
            print(f"Same-Origin Requests: {len(network_requests) - len(third_party_requests)}")
            print(f"Non-Same-Origin (3rd-party) Requests: {len(third_party_requests)}")
            print("----------------------------------------------------------------")

            assert len(third_party_requests) == 0, f"FAIL: Found {len(third_party_requests)} third-party requests: {third_party_requests}"
            print("✓ PASS: First-load network log contains ZERO non-same-origin requests!")

            browser.close()
    finally:
        proc.terminate()
        try:
            proc.kill()
        except Exception:
            pass

if __name__ == '__main__':
    test_zero_third_party_requests()
