import os
import shutil
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\SUMIT\.gemini\antigravity-ide\brain\c2c30b95-856e-4b15-a55b-b571bbf91e66"
BEFORE_DIR = os.path.join("screenshots", "phase8", "before")
BEFORE_ARTIFACT_DIR = os.path.join(ARTIFACT_DIR, "screenshots_phase8_before")

os.makedirs(BEFORE_DIR, exist_ok=True)
os.makedirs(BEFORE_ARTIFACT_DIR, exist_ok=True)

def capture_phase8_before():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        configs = [
            {"name": "desktop-dark", "width": 1280, "height": 900, "is_mobile": False, "theme": "dark"},
            {"name": "desktop-light", "width": 1280, "height": 900, "is_mobile": False, "theme": "light"},
            {"name": "mobile-dark", "width": 375, "height": 812, "is_mobile": True, "theme": "dark"},
            {"name": "mobile-light", "width": 375, "height": 812, "is_mobile": True, "theme": "light"},
        ]

        for cfg in configs:
            context = browser.new_context(
                viewport={"width": cfg["width"], "height": cfg["height"]},
                is_mobile=cfg["is_mobile"],
                has_touch=cfg["is_mobile"],
                color_scheme=cfg["theme"],
                device_scale_factor=2
            )
            context.add_init_script(f"""
                localStorage.setItem('daily-dive-theme', '{cfg["theme"]}');
            """)
            page = context.new_page()
            
            page.goto("http://localhost:5173", wait_until="networkidle")
            time.sleep(1)

            # Ensure HTML dark class matches
            page.evaluate(f"""() => {{
                if ('{cfg["theme"]}' === 'dark') {{
                    document.documentElement.classList.add('dark');
                }} else {{
                    document.documentElement.classList.remove('dark');
                }}
            }}""")
            time.sleep(0.5)

            # Scroll to extract section and capture dropzone
            extract_el = page.locator("#extract")
            if extract_el.count() > 0:
                extract_el.scroll_into_view_if_needed()
                time.sleep(0.6)
                extract_path = os.path.join(BEFORE_DIR, f"{cfg['name']}-extract.png")
                page.screenshot(path=extract_path, full_page=False)
                shutil.copy(extract_path, os.path.join(BEFORE_ARTIFACT_DIR, f"{cfg['name']}-extract.png"))
                print(f"Captured {extract_path}", flush=True)

            # Scroll to filter section and capture filter
            filter_el = page.locator("#filter")
            if filter_el.count() > 0:
                filter_el.scroll_into_view_if_needed()
                time.sleep(0.6)
                filter_path = os.path.join(BEFORE_DIR, f"{cfg['name']}-filter.png")
                page.screenshot(path=filter_path, full_page=False)
                shutil.copy(filter_path, os.path.join(BEFORE_ARTIFACT_DIR, f"{cfg['name']}-filter.png"))
                print(f"Captured {filter_path}", flush=True)

            context.close()

        browser.close()

if __name__ == "__main__":
    capture_phase8_before()
