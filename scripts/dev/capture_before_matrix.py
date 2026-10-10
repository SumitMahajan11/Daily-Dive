import os
import time
import json
from playwright.sync_api import sync_playwright

OUT_DIR = os.path.join("evidence", "round-1", "before")
os.makedirs(OUT_DIR, exist_ok=True)

CONFIGS = [
    {"name": "mobile-dark", "width": 390, "height": 844, "is_mobile": True, "theme": "dark"},
    {"name": "mobile-light", "width": 390, "height": 844, "is_mobile": True, "theme": "light"},
    {"name": "desktop-dark", "width": 1440, "height": 900, "is_mobile": False, "theme": "dark"},
    {"name": "desktop-light", "width": 1440, "height": 900, "is_mobile": False, "theme": "light"},
]

SEEDED_HISTORY = [
    {
        "topic_id": "seed-1",
        "title": "Zero-Knowledge Rollups",
        "category": "distributed-systems",
        "timestamp": "2026-10-09T08:00:00.000Z",
        "source": "curated",
        "action": "completed"
    },
    {
        "topic_id": "seed-2",
        "title": "Attention Mechanism in Transformers",
        "category": "ai-ml",
        "timestamp": "2026-10-10T08:00:00.000Z",
        "source": "curated",
        "action": "completed"
    }
]

SEEDED_STREAK = {
    "current_streak": 3,
    "longest_streak": 5,
    "last_active_date": "2026-10-10",
    "activity_dates": ["2026-10-08", "2026-10-09", "2026-10-10"]
}

def capture_matrix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        for cfg in CONFIGS:
            print(f"--- Capturing matrix for {cfg['name']} ---", flush=True)
            
            # 1. First-run Spin (cleared storage)
            context = browser.new_context(
                viewport={"width": cfg["width"], "height": cfg["height"]},
                is_mobile=cfg["is_mobile"],
                has_touch=cfg["is_mobile"],
                color_scheme=cfg["theme"],
                device_scale_factor=2
            )
            context.add_init_script(f"""
                localStorage.clear();
                localStorage.setItem('daily-dive-theme', '{cfg["theme"]}');
            """)
            page = context.new_page()
            page.goto("http://localhost:5173", wait_until="networkidle")
            time.sleep(1)
            page.evaluate(f"""() => {{
                if ('{cfg["theme"]}' === 'dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
            }}""")
            time.sleep(0.5)
            
            # Capture first-run spin
            spin_el = page.locator("#spin")
            if spin_el.count() > 0:
                spin_el.scroll_into_view_if_needed()
                time.sleep(0.5)
            page.screenshot(path=os.path.join(OUT_DIR, f"{cfg['name']}_spin_first_run.png"))
            context.close()
            
            # 2. Returning User Spin + Post-Spin Card + Other Screens
            context = browser.new_context(
                viewport={"width": cfg["width"], "height": cfg["height"]},
                is_mobile=cfg["is_mobile"],
                has_touch=cfg["is_mobile"],
                color_scheme=cfg["theme"],
                device_scale_factor=2
            )
            history_json = json.dumps(SEEDED_HISTORY)
            streak_json = json.dumps(SEEDED_STREAK)
            context.add_init_script(f"""
                localStorage.clear();
                localStorage.setItem('daily-dive-theme', '{cfg["theme"]}');
                localStorage.setItem('daily-dive-history', '{history_json}');
                localStorage.setItem('daily-dive-streak', '{streak_json}');
                localStorage.setItem('daily-dive-first-run-complete', 'true');
            """)
            page = context.new_page()
            page.goto("http://localhost:5173", wait_until="networkidle")
            time.sleep(1)
            page.evaluate(f"""() => {{
                if ('{cfg["theme"]}' === 'dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
            }}""")
            time.sleep(0.5)
            
            # Returning user spin view
            spin_el = page.locator("#spin")
            if spin_el.count() > 0:
                spin_el.scroll_into_view_if_needed()
                time.sleep(0.5)
            page.screenshot(path=os.path.join(OUT_DIR, f"{cfg['name']}_spin_returning.png"))
            
            # Post-spin topic card
            spin_btn = page.locator('#spin button:has-text("Spin Roulette")')
            if spin_btn.count() > 0:
                spin_btn.scroll_into_view_if_needed()
                spin_btn.click(force=True)
                time.sleep(3.2) # wait for spin animation
                card_el = page.locator('#spin')
                page.screenshot(path=os.path.join(OUT_DIR, f"{cfg['name']}_post_spin_card.png"))
            
            # Extract screen
            extract_el = page.locator("#extract")
            if extract_el.count() > 0:
                extract_el.scroll_into_view_if_needed()
                time.sleep(0.5)
                page.screenshot(path=os.path.join(OUT_DIR, f"{cfg['name']}_extract.png"))
                
            # Filter screen
            filter_el = page.locator("#filter")
            if filter_el.count() > 0:
                filter_el.scroll_into_view_if_needed()
                time.sleep(0.5)
                page.screenshot(path=os.path.join(OUT_DIR, f"{cfg['name']}_filter.png"))
                
            # Progress screen
            progress_el = page.locator("#progress")
            if progress_el.count() > 0:
                progress_el.scroll_into_view_if_needed()
                time.sleep(0.5)
                page.screenshot(path=os.path.join(OUT_DIR, f"{cfg['name']}_progress.png"))
                
            # Settings screen
            settings_el = page.locator("#settings")
            if settings_el.count() > 0:
                settings_el.scroll_into_view_if_needed()
                time.sleep(0.5)
                page.screenshot(path=os.path.join(OUT_DIR, f"{cfg['name']}_settings.png"))
                
            context.close()
            
        browser.close()
        print("BEFORE matrix screenshots captured successfully!", flush=True)

if __name__ == "__main__":
    capture_matrix()
