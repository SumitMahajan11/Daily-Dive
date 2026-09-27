import os
import sys
import json
import time

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = r"C:\Users\SUMIT\.gemini\antigravity-ide\brain\a16ef4aa-08cd-4c23-81c0-0a7819a2044b\supabase_removal_evidence"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def run():
    print("=== STARTING DEEP PROGRESS SCREEN & STREAK/MATRIX RECONCILIATION VERIFICATION ===")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 950})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        # ── SCENARIO A: 3-Day Consecutive Streak Verified on Progress Screen ──
        print("\n--- SCENARIO A: 3-Day Consecutive Active Streak Setup & Verification ---")
        
        # Seed 3 days of activity (today, yesterday, day before yesterday)
        page.goto("http://localhost:5173", wait_until="networkidle")
        
        setup_data = page.evaluate("""() => {
            const today = new Date();
            const yest = new Date(today); yest.setDate(today.getDate() - 1);
            const dayBefore = new Date(today); dayBefore.setDate(today.getDate() - 2);

            const pad = (n) => String(n).padStart(2, '0');
            const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

            const d0 = fmt(today);
            const d1 = fmt(yest);
            const d2 = fmt(dayBefore);

            const streaks = {
                current_streak: 3,
                longest_streak: 5,
                last_active_date: d0,
                is_active_today: true,
                is_broken: false
            };
            const history = [
                { id: 'h1', topic_id: 't1', topic_title: 'Transformer Attention', category_name: 'AI & Machine Learning', action: 'spin', timestamp: `${d2}T10:00:00Z`, local_date: d2 },
                { id: 'h2', topic_id: 't2', topic_title: 'Event Loops in JS', category_name: 'Web Architecture', action: 'spin', timestamp: `${d1}T11:00:00Z`, local_date: d1 },
                { id: 'h3', topic_id: 't3', topic_title: 'Cognitive Biases', category_name: 'Psychology & Mental Models', action: 'spin', timestamp: `${d0}T12:00:00Z`, local_date: d0 }
            ];
            const progress = {
                't1': { times_seen: 1, last_seen: `${d2}T10:00:00Z`, learned: true, learned_at: `${d2}T10:05:00Z` },
                't2': { times_seen: 1, last_seen: `${d1}T11:00:00Z`, learned: false },
                't3': { times_seen: 1, last_seen: `${d0}T12:00:00Z`, learned: true, learned_at: `${d0}T12:05:00Z` }
            };
            const starterCategories = {
                tech: true, 'ai-ml': true, 'web-dev': true,
                'mind-growth': true, psychology: true, 'philosophy-critical-thinking': true,
                'money-career': true, finance: true, 'career-strategy': true,
                'world-ideas': true, 'science-nature': true, 'history-innovation': true,
                custom: true
            };
            const settings = {
                enabled_categories: starterCategories,
                sound_enabled: true,
                animations_enabled: true,
                reading_mode: 'card',
                theme_preference: 'dark',
                content_source: 'blended',
                expanded_groups: { tech: true, 'money-career': true, 'mind-growth': true, 'world-ideas': true, custom: true },
                onboarding_completed: true
            };

            localStorage.setItem('daily_dive_guest_streaks', JSON.stringify(streaks));
            localStorage.setItem('daily_dive_history', JSON.stringify(history));
            localStorage.setItem('daily_dive_guest_progress', JSON.stringify(progress));
            localStorage.setItem('daily_dive_guest_settings', JSON.stringify(settings));

            return { d0, d1, d2, streaks };
        }""")
        
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(1000)

        # 1. Verify Header Streak Pill
        header_streak_text = page.locator("header .font-mono.font-medium").inner_text().strip()
        print(f"[CHECK 1] Header Streak Pill Text: '{header_streak_text}'")
        assert header_streak_text == "3d streak", f"Expected '3d streak', got '{header_streak_text}'"

        # 2. Navigate to Progress Screen
        page.evaluate("() => document.getElementById('progress').scrollIntoView({ behavior: 'auto', block: 'start' })")
        page.wait_for_timeout(1000)

        # 3. Verify Progress Screen Streak Card Metrics
        progress_section = page.locator("#progress")
        streak_card = progress_section.locator(".journal-card").first
        streak_num = streak_card.locator(".font-display.text-3xl").inner_text().strip()
        streak_status = streak_card.locator("p.text-\\[11px\\]").inner_text().strip()
        longest_streak_text = streak_card.locator("span.font-semibold.text-on-surface").inner_text().strip()

        print(f"[CHECK 2] Progress Screen Streak Metric: {streak_num} days")
        print(f"[CHECK 3] Progress Screen Streak Status: '{streak_status}'")
        print(f"[CHECK 4] Progress Screen Best Streak: '{longest_streak_text}'")

        assert streak_num == "3", f"Expected streak_num '3', got '{streak_num}'"
        assert "Maintained today" in streak_status, f"Expected 'Maintained today', got '{streak_status}'"
        assert longest_streak_text == "5d", f"Expected best '5d', got '{longest_streak_text}'"

        # 4. Verify 14-Day Matrix Strip Cells & Agreement
        matrix_container = progress_section.locator("text='14-Day Streak Matrix'").locator("xpath=ancestor::div[contains(@class, 'journal-card')]")
        matrix_cells = matrix_container.locator(".grid > div")
        cell_count = matrix_cells.count()
        print(f"\n[CHECK 5] 14-Day Activity Matrix Total Cells Found: {cell_count}")
        assert cell_count == 14, f"Expected 14 cells in strip, got {cell_count}"

        active_cells_found = []
        today_cell_active = False
        for i in range(cell_count):
            cell = matrix_cells.nth(i)
            title = cell.get_attribute("title")
            inner = cell.inner_text().replace("\n", " ").strip()
            is_active = "✓" in inner
            is_today = "Today" in inner
            if is_active:
                active_cells_found.append((i, title, inner))
            if is_today:
                today_cell_active = is_active
                print(f"  -> Cell {i+1}/14 (TODAY): Title='{title}' | ActiveCheckmark={is_active}")

        print(f"[CHECK 6] Total Active Days in 14-Day Horizon: {len(active_cells_found)} days")
        for idx, (cell_i, title, inner) in enumerate(active_cells_found):
            print(f"     Active Day {idx+1}: Index {cell_i} | {title}")

        assert today_cell_active == True, "Today's cell in 14-day matrix is not active!"
        assert len(active_cells_found) == 3, f"Expected exactly 3 active days in matrix, found {len(active_cells_found)}"

        # 5. Capture Screenshot for Scenario A
        screenshot_a = os.path.join(ARTIFACTS_DIR, "04_progress_screen_3day_streak_verified.png")
        page.screenshot(path=screenshot_a)
        print(f"[OK] Progress Screen 3-Day Streak screenshot saved: {screenshot_a}")

        # ── SCENARIO B: Fresh Spin Increment & Real-Time Matrix Sync ──
        print("\n--- SCENARIO B: Clean State -> Live Spin -> Instant 1-Day Streak Reconciliation ---")
        
        page.evaluate("""() => {
            localStorage.removeItem('daily_dive_guest_streaks');
            localStorage.removeItem('daily_dive_history');
            localStorage.removeItem('daily_dive_guest_progress');
            const starterCategories = {
                tech: true, 'ai-ml': true, 'web-dev': true,
                'mind-growth': true, psychology: true, 'philosophy-critical-thinking': true,
                'money-career': true, finance: true, 'career-strategy': true,
                'world-ideas': true, 'science-nature': true, 'history-innovation': true,
                custom: true
            };
            const settings = {
                enabled_categories: starterCategories,
                sound_enabled: true,
                animations_enabled: true,
                reading_mode: 'card',
                theme_preference: 'dark',
                content_source: 'blended',
                expanded_groups: { tech: true, 'money-career': true, 'mind-growth': true, 'world-ideas': true, custom: true },
                onboarding_completed: true
            };
            localStorage.setItem('daily_dive_guest_settings', JSON.stringify(settings));
        }""")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(800)

        # Before spin: Streak is 0
        header_before = page.locator("header .font-mono.font-medium").inner_text().strip()
        print(f"[CHECK 7] Initial Fresh Header Streak: '{header_before}'")
        assert header_before == "0d streak"

        # Perform Spin inside #spin section
        page.evaluate("() => document.getElementById('spin').scrollIntoView({ behavior: 'auto', block: 'start' })")
        page.wait_for_timeout(500)
        spin_btn = page.locator("#spin button:has-text('Spin Roulette'), #spin button:has-text('Spin Again')").first
        spin_btn.click()
        page.wait_for_timeout(4500) # wait for spin completion and sound

        # Check Header immediately updated
        header_after = page.locator("header .font-mono.font-medium").inner_text().strip()
        print(f"[CHECK 8] Live Post-Spin Header Streak: '{header_after}'")
        assert header_after == "1d streak", f"Expected '1d streak' post-spin, got '{header_after}'"

        # Navigate to Progress Screen
        page.evaluate("() => document.getElementById('progress').scrollIntoView({ behavior: 'auto', block: 'start' })")
        page.wait_for_timeout(1000)

        # Check Progress Screen Metric Card
        progress_section_b = page.locator("#progress")
        streak_card_b = progress_section_b.locator(".journal-card").first
        streak_num_b = streak_card_b.locator(".font-display.text-3xl").inner_text().strip()
        streak_status_b = streak_card_b.locator("p.text-\\[11px\\]").inner_text().strip()
        print(f"[CHECK 9] Live Post-Spin Progress Screen Streak: {streak_num_b} day ({streak_status_b})")
        assert streak_num_b == "1"
        assert "Maintained today" in streak_status_b

        # Check 14-Day Matrix Today Cell
        matrix_container_b = progress_section_b.locator("text='14-Day Streak Matrix'").locator("xpath=ancestor::div[contains(@class, 'journal-card')]")
        matrix_cells_b = matrix_container_b.locator(".grid > div")
        
        today_cell_b = None
        for i in range(matrix_cells_b.count()):
            cell = matrix_cells_b.nth(i)
            if "Today" in cell.inner_text():
                today_cell_b = cell
                break
        
        assert today_cell_b is not None, "Today cell not found in matrix"
        today_cell_text_b = today_cell_b.inner_text().replace("\n", " ").strip()
        print(f"[CHECK 10] Live Post-Spin Today Cell State: '{today_cell_text_b}' (Contains checkmark: {'✓' in today_cell_text_b})")
        assert "✓" in today_cell_text_b, "Today's cell did not get marked with '✓' active checkmark post-spin!"

        # Dump LocalStorage Streaks Object
        ls_streaks = json.loads(page.evaluate("() => localStorage.getItem('daily_dive_guest_streaks')"))
        print(f"[CHECK 11] localStorage 'daily_dive_guest_streaks' Dump: {json.dumps(ls_streaks)}")
        assert ls_streaks["current_streak"] == 1
        assert ls_streaks["last_active_date"] is not None

        # Capture Screenshot for Scenario B
        screenshot_b = os.path.join(ARTIFACTS_DIR, "04_progress_screen_live_spin_reconciled.png")
        page.screenshot(path=screenshot_b)
        print(f"[OK] Progress Screen Live Spin Reconciled screenshot saved: {screenshot_b}")

        # Total console errors check
        filtered_errors = [e for e in console_errors if "favicon" not in e and "manifest" not in e]
        assert len(filtered_errors) == 0, f"Found console errors: {filtered_errors}"

        browser.close()
        print("\n=== ALL PROGRESS SCREEN STREAK & MATRIX ASSERTIONS PASSED WITH 100% AGREEMENT ===")

if __name__ == "__main__":
    run()
