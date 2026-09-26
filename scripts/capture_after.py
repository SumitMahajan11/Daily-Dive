import os
import shutil
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\SUMIT\.gemini\antigravity-ide\brain\07982283-117c-4e55-9142-5d40ce7542d3"
AFTER_DIR = os.path.join("screenshots", "after")
AFTER_ARTIFACT_DIR = os.path.join(ARTIFACT_DIR, "screenshots_after")

os.makedirs(AFTER_DIR, exist_ok=True)
os.makedirs(AFTER_ARTIFACT_DIR, exist_ok=True)

def capture_after():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        configs = [
            {"name": "desktop-dark", "width": 1280, "height": 800, "is_mobile": False, "theme": "dark"},
            {"name": "desktop-light", "width": 1280, "height": 800, "is_mobile": False, "theme": "light"},
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
            
            # Go to app
            page.goto("http://localhost:5173", wait_until="networkidle")
            time.sleep(1)

            # Ensure HTML class
            page.evaluate(f"""() => {{
                if ('{cfg["theme"]}' === 'dark') {{
                    document.documentElement.classList.add('dark');
                }} else {{
                    document.documentElement.classList.remove('dark');
                }}
            }}""")
            time.sleep(0.5)

            # Scroll cleanly to #spin start
            page.evaluate("""() => {
                const el = document.getElementById('spin');
                if (el) el.scrollIntoView({ block: 'start' });
            }""")
            time.sleep(0.6)

            # Capture spin view
            spin_path = os.path.join(AFTER_DIR, f"{cfg['name']}-spin.png")
            page.screenshot(path=spin_path, full_page=False)
            shutil.copy(spin_path, os.path.join(AFTER_ARTIFACT_DIR, f"{cfg['name']}-spin.png"))
            print(f"Captured {spin_path}", flush=True)

            # Target the button inside #spin specifically
            spin_btn = page.locator('#spin button:has-text("Spin Roulette")')
            if spin_btn.count() > 0:
                spin_btn.click(force=True)
                time.sleep(3.6) # wait for spin animation to finish (2800ms + confetti)

                # Scroll to reveal the topic card cleanly in the viewport
                page.evaluate("""() => {
                    const card = document.querySelector('article');
                    if (card) {
                        card.scrollIntoView({ block: 'start' });
                        window.scrollBy(0, -70); // leave breathing room under navbar
                    }
                }""")
                time.sleep(0.6)

                card_path = os.path.join(AFTER_DIR, f"{cfg['name']}-card.png")
                page.screenshot(path=card_path, full_page=False)
                shutil.copy(card_path, os.path.join(AFTER_ARTIFACT_DIR, f"{cfg['name']}-card.png"))
                print(f"Captured {card_path}", flush=True)

            # Also scroll to filter section start and capture
            page.evaluate("""() => {
                const el = document.getElementById('filter');
                if (el) {
                    el.scrollIntoView({ block: 'start' });
                    window.scrollBy(0, -65);
                }
            }""")
            time.sleep(0.6)
            filter_path = os.path.join(AFTER_DIR, f"{cfg['name']}-filter.png")
            page.screenshot(path=filter_path, full_page=False)
            shutil.copy(filter_path, os.path.join(AFTER_ARTIFACT_DIR, f"{cfg['name']}-filter.png"))
            print(f"Captured {filter_path}", flush=True)

            context.close()

        browser.close()

if __name__ == "__main__":
    capture_after()
