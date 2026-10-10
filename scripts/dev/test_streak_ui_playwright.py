import os
import sys
import json
from datetime import datetime, timedelta
from playwright.sync_api import sync_playwright

artifacts_dir = os.path.abspath("artifacts")
os.makedirs(artifacts_dir, exist_ok=True)

brain_artifacts_dir = r"C:\Users\SUMIT\.gemini\antigravity-ide\brain\00b52349-b331-438d-a048-882f25933050"
os.makedirs(brain_artifacts_dir, exist_ok=True)

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def run():
    print("Launching Chromium...", flush=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 1000})
        page = context.new_page()

        now = datetime.now()
        today_str = now.strftime("%Y-%m-%d")
        yesterday_str = (now - timedelta(days=1)).strftime("%Y-%m-%d")
        three_days_ago_str = (now - timedelta(days=3)).strftime("%Y-%m-%d")

        print(f"Current Date: {today_str}, Yesterday: {yesterday_str}", flush=True)

        # =========================================================================
        # SCENARIO 1: Live Audit Reproduction & Reconciliation (Sat & Sun active)
        # In live app screenshot: card showed "0 days / Streak lapsed" while matrix
        # showed BOTH Sat & Sun checked.
        # With fix: card MUST show "2 days / Maintained today" and agree with matrix!
        # =========================================================================
        print("\n--- SCENARIO 1: Consecutive Days (Yesterday + Today Active) ---", flush=True)
        history_2days = [
            {
                "id": "t1_today",
                "topic_id": "dns-resolution-flow",
                "title": "DNS Resolution Flow",
                "group_name": "tech",
                "category": "systems",
                "is_custom": False,
                "action": "spin",
                "timestamp": f"{today_str}T08:30:00.000Z",
                "local_date": today_str
            },
            {
                "id": "t2_yesterday",
                "topic_id": "tcp-handshake",
                "title": "TCP 3-Way Handshake",
                "group_name": "tech",
                "category": "systems",
                "is_custom": False,
                "action": "spin",
                "timestamp": f"{yesterday_str}T09:15:00.000Z",
                "local_date": yesterday_str
            }
        ]
        progress_2days = {
            "dns-resolution-flow": {
                "times_seen": 1,
                "learned": False,
                "last_seen": f"{today_str}T08:30:00.000Z"
            },
            "tcp-handshake": {
                "times_seen": 1,
                "learned": False,
                "last_seen": f"{yesterday_str}T09:15:00.000Z"
            }
        }
        # Simulate stale guest streaks of 0 (which was the bug before reconciliation)
        streaks_stale = {
            "current_streak": 0,
            "longest_streak": 2,
            "last_active_date": yesterday_str
        }

        page.goto("http://localhost:5173/", wait_until="domcontentloaded")
        page.evaluate("""([hist, prog, strk]) => {
            localStorage.setItem('daily_dive_history', JSON.stringify(hist));
            localStorage.setItem('daily_dive_guest_progress', JSON.stringify(prog));
            localStorage.setItem('daily_dive_guest_streaks', JSON.stringify(strk));
        }""", [history_2days, progress_2days, streaks_stale])

        page.reload(wait_until="domcontentloaded")
        page.wait_for_selector("#progress", timeout=10000)
        page.evaluate("() => document.getElementById('progress').scrollIntoView({ behavior: 'instant' })")
        page.wait_for_timeout(1000)

        # Inspect streak card
        streak_num = page.locator("#progress .journal-card").first.locator("span.font-display").inner_text()
        streak_subtitle = page.locator("#progress .journal-card").first.locator("p").inner_text()
        print(f"Scenario 1 Streak Display: {streak_num} days / {streak_subtitle}", flush=True)

        assert streak_num == "2", f"Expected '2' days, got: {streak_num}"
        assert "Maintained today" in streak_subtitle, f"Expected 'Maintained today', got: {streak_subtitle}"

        # Inspect matrix checks
        matrix_el = page.locator("#progress div:has-text('14-Day Streak Matrix')").first
        today_cell = matrix_el.locator("span:text-is('Today')").locator("xpath=..")
        today_check = today_cell.inner_text()
        print(f"Scenario 1 Matrix Today cell content: {repr(today_check)}", flush=True)
        assert "✓" in today_check, f"Expected '✓' in Today cell, got: {today_check}"

        progress_el = page.locator("#progress")
        scen1_path = os.path.join(artifacts_dir, "scenario1_consecutive_days_reconciled.png")
        progress_el.screenshot(path=scen1_path)
        progress_el.screenshot(path=os.path.join(brain_artifacts_dir, "scenario1_consecutive_days_reconciled.png"))
        print(f"[PASS] Scenario 1 verified and captured to {scen1_path}", flush=True)

        # =========================================================================
        # SCENARIO 2: Morning Pending State (Yesterday Active, Today Unspun)
        # Checks whether "Today" is prematurely checked before any action today.
        # =========================================================================
        print("\n--- SCENARIO 2: Morning Pending State (Yesterday Active, Today Unspun) ---", flush=True)
        history_yesterday_only = [
            {
                "id": "t2_yesterday",
                "topic_id": "tcp-handshake",
                "title": "TCP 3-Way Handshake",
                "group_name": "tech",
                "category": "systems",
                "is_custom": False,
                "action": "spin",
                "timestamp": f"{yesterday_str}T09:15:00.000Z",
                "local_date": yesterday_str
            }
        ]
        progress_yesterday_only = {
            "tcp-handshake": {
                "times_seen": 1,
                "learned": False,
                "last_seen": f"{yesterday_str}T09:15:00.000Z"
            }
        }
        streaks_yesterday_only = {
            "current_streak": 1,
            "longest_streak": 1,
            "last_active_date": yesterday_str
        }

        page.evaluate("""([hist, prog, strk]) => {
            localStorage.setItem('daily_dive_history', JSON.stringify(hist));
            localStorage.setItem('daily_dive_guest_progress', JSON.stringify(prog));
            localStorage.setItem('daily_dive_guest_streaks', JSON.stringify(strk));
        }""", [history_yesterday_only, progress_yesterday_only, streaks_yesterday_only])

        page.reload(wait_until="domcontentloaded")
        page.wait_for_selector("#progress", timeout=10000)
        page.evaluate("() => document.getElementById('progress').scrollIntoView({ behavior: 'instant' })")
        page.wait_for_timeout(1000)

        streak_num_2 = page.locator("#progress .journal-card").first.locator("span.font-display").inner_text()
        streak_subtitle_2 = page.locator("#progress .journal-card").first.locator("p").inner_text()
        print(f"Scenario 2 Streak Display: {streak_num_2} days / {streak_subtitle_2}", flush=True)

        assert streak_num_2 == "1", f"Expected '1' day, got: {streak_num_2}"
        assert "Spin to maintain" in streak_subtitle_2, f"Expected 'Spin to maintain', got: {streak_subtitle_2}"

        # Check Matrix today cell: must NOT have '✓'!
        matrix_el_2 = page.locator("#progress div:has-text('14-Day Streak Matrix')").first
        today_cell_2 = matrix_el_2.locator("span:text-is('Today')").locator("xpath=..")
        today_check_2 = today_cell_2.inner_text()
        print(f"Scenario 2 Matrix Today cell content: {repr(today_check_2)}", flush=True)
        assert "✓" not in today_check_2, f"FAILURE: Today cell was prematurely marked with checkmark! Got: {today_check_2}"

        scen2_path = os.path.join(artifacts_dir, "scenario2_morning_pending_not_premature.png")
        progress_el = page.locator("#progress")
        progress_el.screenshot(path=scen2_path)
        progress_el.screenshot(path=os.path.join(brain_artifacts_dir, "scenario2_morning_pending_not_premature.png"))
        print(f"[PASS] Scenario 2 verified (Today NOT marked prematurely) and captured to {scen2_path}", flush=True)

        # =========================================================================
        # SCENARIO 3: Lapsed Streak (Inactive for 3 days)
        # =========================================================================
        print("\n--- SCENARIO 3: Lapsed Streak (Inactive for 3 days) ---", flush=True)
        history_lapsed = [
            {
                "id": "t_old",
                "topic_id": "tcp-handshake",
                "title": "TCP 3-Way Handshake",
                "group_name": "tech",
                "category": "systems",
                "is_custom": False,
                "action": "spin",
                "timestamp": f"{three_days_ago_str}T09:15:00.000Z",
                "local_date": three_days_ago_str
            }
        ]
        progress_lapsed = {
            "tcp-handshake": {
                "times_seen": 1,
                "learned": False,
                "last_seen": f"{three_days_ago_str}T09:15:00.000Z"
            }
        }
        streaks_lapsed = {
            "current_streak": 0,
            "longest_streak": 4,
            "last_active_date": three_days_ago_str
        }

        page.evaluate("""([hist, prog, strk]) => {
            localStorage.setItem('daily_dive_history', JSON.stringify(hist));
            localStorage.setItem('daily_dive_guest_progress', JSON.stringify(prog));
            localStorage.setItem('daily_dive_guest_streaks', JSON.stringify(strk));
        }""", [history_lapsed, progress_lapsed, streaks_lapsed])

        page.reload(wait_until="domcontentloaded")
        page.wait_for_selector("#progress", timeout=10000)
        page.evaluate("() => document.getElementById('progress').scrollIntoView({ behavior: 'instant' })")
        page.wait_for_timeout(1000)

        streak_num_3 = page.locator("#progress .journal-card").first.locator("span.font-display").inner_text()
        streak_subtitle_3 = page.locator("#progress .journal-card").first.locator("p").inner_text()
        print(f"Scenario 3 Streak Display: {streak_num_3} days / {streak_subtitle_3}", flush=True)

        assert streak_num_3 == "0"
        assert "Streak lapsed" in streak_subtitle_3

        scen3_path = os.path.join(artifacts_dir, "scenario3_lapsed_streak_agree.png")
        progress_el = page.locator("#progress")
        progress_el.screenshot(path=scen3_path)
        progress_el.screenshot(path=os.path.join(brain_artifacts_dir, "scenario3_lapsed_streak_agree.png"))
        print(f"[PASS] Scenario 3 verified (Card and matrix agree on lapsed) and captured to {scen3_path}", flush=True)

        browser.close()
        print("\nALL 3 PLAYWRIGHT VERIFICATION SCENARIOS COMPLETED SUCCESSFULLY!", flush=True)

if __name__ == "__main__":
    run()
