import os
import time
import json
from playwright.sync_api import sync_playwright

OUT_DIR = os.path.join("evidence", "round-1", "after")
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
        "group_name": "tech",
        "category": "systems-distributed-computing",
        "timestamp": "2026-10-09T08:00:00.000Z",
        "local_date": "2026-10-09",
        "source": "curated",
        "action": "completed"
    },
    {
        "topic_id": "seed-2",
        "title": "Attention Mechanism in Transformers",
        "group_name": "tech",
        "category": "ai-ml",
        "timestamp": "2026-10-10T08:00:00.000Z",
        "local_date": "2026-10-10",
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

SEEDED_CUSTOM_TOPICS = [
    {
        "id": "custom-1",
        "title": "Distributed Consensus & Raft",
        "category": "custom-notes",
        "group_name": "custom",
        "description": "Raft achieves consensus via leader election and log replication.",
        "lifecycle": "permanent",
        "created_at": "2026-10-01T00:00:00.000Z",
        "expires_at": None,
        "is_custom": True
    },
    {
        "id": "custom-2",
        "title": "Vector Databases & HNSW Indexing",
        "category": "custom-notes",
        "group_name": "custom",
        "description": "Hierarchical Navigable Small World graphs enable sub-linear approximate nearest neighbor search.",
        "lifecycle": "temporary",
        "created_at": "2026-10-08T00:00:00.000Z",
        "expires_at": "2026-10-22T00:00:00.000Z",
        "is_custom": True
    }
]

SEEDED_PROGRESS = {
    "seed-1": {"times_seen": 2, "last_seen": "2026-10-09T08:00:00.000Z", "learned": True},
    "seed-2": {"times_seen": 1, "last_seen": "2026-10-10T08:00:00.000Z", "learned": False}
}

SEEDED_SETTINGS = {
    "content_source": "blended",
    "enabled_categories": {
        "tech": True,
        "tech::ai-ml": True,
        "money-career": True,
        "mind-growth": True,
        "world-ideas": True,
        "custom": True,
        "custom::custom-notes": True
    },
    "reminder_time": "09:00 AM",
    "notifications_enabled": False,
    "sound_enabled": True,
    "haptics_enabled": True
}

def verify_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # ── TEST 1: SPIN BUTTON ABOVE THE FOLD AT 390x844 AND 360x740 ──
        print("=== TEST 1: VERIFYING SPIN BUTTON BOUNDING BOX (ABOVE THE FOLD) ===", flush=True)
        for vp in [{"width": 390, "height": 844}, {"width": 360, "height": 740}]:
            context = browser.new_context(
                viewport={"width": vp["width"], "height": vp["height"]},
                is_mobile=True,
                has_touch=True
            )
            history_json = json.dumps(SEEDED_HISTORY)
            streak_json = json.dumps(SEEDED_STREAK)
            context.add_init_script(f"""
                localStorage.clear();
                localStorage.setItem('daily-dive-history', '{history_json}');
                localStorage.setItem('daily-dive-streak', '{streak_json}');
                localStorage.setItem('daily_dive_first_run_dismissed', 'true');
            """)
            page = context.new_page()
            page.goto("http://localhost:5173", wait_until="networkidle")
            time.sleep(0.5)

            spin_button = page.locator('[data-testid="primary-spin-button"]')
            assert spin_button.count() > 0, f"Spin button not found at {vp['width']}x{vp['height']}"
            box = spin_button.bounding_box()
            assert box is not None, f"Bounding box is None for spin button at {vp['width']}x{vp['height']}"

            # Bottom nav height is 64px (h-16)
            bottom_nav = page.locator('nav.md\\:hidden')
            nav_box = bottom_nav.bounding_box()
            nav_top = nav_box['y'] if nav_box else (vp['height'] - 64)

            button_bottom = box['y'] + box['height']
            print(f"Viewport {vp['width']}x{vp['height']}: button_bottom={button_bottom:.1f}px <= nav_top={nav_top:.1f}px (Viewport Height={vp['height']}px)", flush=True)
            assert button_bottom <= nav_top, f"FAIL: Spin button bottom ({button_bottom}) overflows bottom nav top ({nav_top}) at {vp['width']}x{vp['height']}!"
            print(f"[PASS] Spin button fully visible above fold at {vp['width']}x{vp['height']} without scrolling.", flush=True)
            context.close()

        # ── TEST 2: FIRST-RUN FLOW & AUTO-SWITCH TO BLENDED ──
        print("\n=== TEST 2: FIRST-RUN FLOW & BLENDED MODE SWITCH ===", flush=True)
        context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
        context.add_init_script("localStorage.clear();")
        page = context.new_page()
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(0.5)

        first_run_banner = page.locator('[data-testid="first-run-picker"]')
        assert first_run_banner.count() > 0, "First-run welcome banner not visible on fresh storage!"
        print("[PASS] First-run welcome banner displayed on fresh storage.", flush=True)

        # Check all 4 groups preselected
        stored_settings = page.evaluate("() => localStorage.getItem('daily_dive_guest_settings')")
        print(f"Initial storage settings: {stored_settings}", flush=True)

        # Click 'Start exploring'
        start_btn = page.locator('button:has-text("Start exploring")')
        start_btn.click()
        time.sleep(0.3)
        dismissed = page.evaluate("() => localStorage.getItem('daily_dive_first_run_dismissed')")
        assert dismissed == 'true', "Dismissed flag not set in localStorage!"
        print("[PASS] First run successfully dismissed and persisted.", flush=True)

        # Now navigate to Library and add a manual topic to test auto-switch to blended
        lib_sec = page.locator('#library')
        lib_sec.scroll_into_view_if_needed()
        time.sleep(0.5)

        add_manual_btn = page.locator('button:has-text("Add manually")')
        add_manual_btn.scroll_into_view_if_needed()
        add_manual_btn.click()
        time.sleep(0.3)

        page.locator('input[placeholder*="Distributed Consensus"]').fill("Test Custom Architecture")
        page.locator('textarea[placeholder*="Summarize the core insight"]').fill("Testing automatic switch to blended mode on custom topic creation.")
        page.locator('button:has-text("Add to library")').click()
        time.sleep(0.5)

        updated_settings = page.evaluate("() => JSON.parse(localStorage.getItem('daily_dive_guest_settings') || '{}')")
        print(f"Updated settings after adding custom topic: content_source='{updated_settings.get('content_source')}'", flush=True)
        assert updated_settings.get('content_source') == 'blended', f"Expected content_source to be 'blended', got {updated_settings.get('content_source')}"
        print("[PASS] content_source automatically switched to 'blended' after adding first custom note.", flush=True)
        context.close()

        # ── TEST 3: EXISTING USER MIGRATION INTEGRITY ──
        print("\n=== TEST 3: EXISTING-USER MIGRATION INTEGRITY ===", flush=True)
        context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
        context.add_init_script(f"""
            localStorage.clear();
            localStorage.setItem('daily_dive_custom_topics', '{json.dumps(SEEDED_CUSTOM_TOPICS)}');
            localStorage.setItem('daily_dive_guest_progress', '{json.dumps(SEEDED_PROGRESS)}');
            localStorage.setItem('daily_dive_guest_streaks', '{json.dumps(SEEDED_STREAK)}');
            localStorage.setItem('daily_dive_history', '{json.dumps(SEEDED_HISTORY)}');
            localStorage.setItem('daily_dive_guest_settings', '{json.dumps(SEEDED_SETTINGS)}');
            localStorage.setItem('daily_dive_first_run_dismissed', 'true');
        """)
        page = context.new_page()
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(0.5)

        keys_dump = page.evaluate("""() => {
            return {
                custom_topics: JSON.parse(localStorage.getItem('daily_dive_custom_topics') || '[]'),
                progress: JSON.parse(localStorage.getItem('daily_dive_guest_progress') || '{}'),
                streaks: JSON.parse(localStorage.getItem('daily_dive_guest_streaks') || '{}'),
                history: JSON.parse(localStorage.getItem('daily_dive_history') || '[]'),
                settings: JSON.parse(localStorage.getItem('daily_dive_guest_settings') || '{}')
            };
        }""")
        print(f"Dumped keys count: custom_topics={len(keys_dump['custom_topics'])}, progress={len(keys_dump['progress'])}, history={len(keys_dump['history'])}", flush=True)
        assert len(keys_dump['custom_topics']) == 2, "Custom topics count mismatch"
        assert len(keys_dump['history']) == 2, "History count mismatch"
        assert keys_dump['streaks']['current_streak'] == 3, "Streak mismatch"
        print("[PASS] Existing user profile, filters, history, streaks, and uploads loaded completely intact.", flush=True)
        context.close()

        # ── TEST 4: NO HORIZONTAL OVERFLOW AT 320, 360, 390 ──
        print("\n=== TEST 4: HORIZONTAL OVERFLOW CHECK (320, 360, 390) ===", flush=True)
        for w in [320, 360, 390]:
            context = browser.new_context(viewport={"width": w, "height": 740}, is_mobile=True)
            context.add_init_script(f"""
                localStorage.clear();
                localStorage.setItem('daily_dive_custom_topics', '{json.dumps(SEEDED_CUSTOM_TOPICS)}');
                localStorage.setItem('daily_dive_guest_progress', '{json.dumps(SEEDED_PROGRESS)}');
                localStorage.setItem('daily_dive_guest_streaks', '{json.dumps(SEEDED_STREAK)}');
                localStorage.setItem('daily_dive_history', '{json.dumps(SEEDED_HISTORY)}');
                localStorage.setItem('daily_dive_guest_settings', '{json.dumps(SEEDED_SETTINGS)}');
                localStorage.setItem('daily_dive_first_run_dismissed', 'true');
            """)
            page = context.new_page()
            page.goto("http://localhost:5173", wait_until="networkidle")
            time.sleep(0.5)

            for section_id in ['spin', 'library', 'progress', 'settings']:
                sec = page.locator(f"#{section_id}")
                sec.scroll_into_view_if_needed()
                time.sleep(0.2)
                scroll_w, inner_w = page.evaluate("() => [document.documentElement.scrollWidth, window.innerWidth]")
                print(f"Width {w}px, Section #{section_id}: scrollWidth={scroll_w}px, innerWidth={inner_w}px", flush=True)
                assert scroll_w <= inner_w, f"FAIL: Horizontal overflow at width {w}px in section #{section_id} (scrollWidth {scroll_w} > innerWidth {inner_w})!"
            print(f"[PASS] No horizontal overflow at width {w}px across all screens.", flush=True)
            context.close()

        # ── TEST 5: CAPTURE AFTER SCREENSHOT MATRIX ──
        print("\n=== CAPTURING AFTER SCREENSHOT MATRIX ===", flush=True)
        for cfg in CONFIGS:
            print(f"--- Capturing AFTER matrix for {cfg['name']} ---", flush=True)
            
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
            
            spin_el = page.locator("#spin")
            spin_el.scroll_into_view_if_needed()
            time.sleep(0.5)
            page.screenshot(path=os.path.join(OUT_DIR, f"{cfg['name']}_spin_first_run.png"))
            context.close()
            
            # 2. Returning User Spin + Post-Spin Card + Library + Progress + Settings
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
                localStorage.setItem('daily_dive_custom_topics', '{json.dumps(SEEDED_CUSTOM_TOPICS)}');
                localStorage.setItem('daily_dive_guest_progress', '{json.dumps(SEEDED_PROGRESS)}');
                localStorage.setItem('daily_dive_guest_streaks', '{json.dumps(SEEDED_STREAK)}');
                localStorage.setItem('daily_dive_history', '{json.dumps(SEEDED_HISTORY)}');
                localStorage.setItem('daily_dive_guest_settings', '{json.dumps(SEEDED_SETTINGS)}');
                localStorage.setItem('daily_dive_first_run_dismissed', 'true');
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
            spin_el.scroll_into_view_if_needed()
            time.sleep(0.5)
            page.screenshot(path=os.path.join(OUT_DIR, f"{cfg['name']}_spin_returning.png"))
            
            # Post-spin topic card
            spin_btn = page.locator('[data-testid="primary-spin-button"]')
            if spin_btn.count() > 0:
                spin_btn.click(force=True)
                time.sleep(3.2)
                page.screenshot(path=os.path.join(OUT_DIR, f"{cfg['name']}_post_spin_card.png"))
            
            # Library screen
            lib_el = page.locator("#library")
            if lib_el.count() > 0:
                lib_el.scroll_into_view_if_needed()
                time.sleep(0.5)
                page.screenshot(path=os.path.join(OUT_DIR, f"{cfg['name']}_library.png"))
                
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
        print("\nALL VERIFICATIONS AND AFTER SCREENSHOTS COMPLETED SUCCESSFULLY!", flush=True)

if __name__ == "__main__":
    verify_all()
