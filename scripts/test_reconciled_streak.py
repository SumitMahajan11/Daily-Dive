from datetime import datetime, timedelta

def get_local_calendar_date(dt):
    return dt.strftime("%Y-%m-%d")

def get_local_yesterday_date(dt):
    return (dt - timedelta(days=1)).strftime("%Y-%m-%d")

def reconcile_streak_with_activity(streak_data, active_dates_set, now_date):
    today_str = get_local_calendar_date(now_date)
    yesterday_str = get_local_yesterday_date(now_date)

    stored_current = streak_data.get("current_streak", 0) if streak_data else 0
    stored_longest = streak_data.get("longest_streak", 0) if streak_data else 0
    stored_last = streak_data.get("last_active_date") if streak_data else None

    # Merge stored_last into active_dates if present
    effective_dates = set(active_dates_set)
    if stored_last:
        effective_dates.add(stored_last)

    has_today = today_str in effective_dates
    has_yesterday = yesterday_str in effective_dates

    # Count consecutive active days backwards
    consecutive = 0
    if has_today:
        check_dt = now_date
        while get_local_calendar_date(check_dt) in effective_dates:
            consecutive += 1
            check_dt -= timedelta(days=1)
    elif has_yesterday:
        check_dt = now_date - timedelta(days=1)
        while get_local_calendar_date(check_dt) in effective_dates:
            consecutive += 1
            check_dt -= timedelta(days=1)

    if has_today:
        current = max(stored_current, consecutive, 1)
        longest = max(stored_longest, current)
        return {
            "current_streak": current,
            "longest_streak": longest,
            "last_active_date": today_str,
            "is_active_today": True,
            "is_broken": False
        }
    elif has_yesterday:
        current = max(stored_current, consecutive, 1)
        longest = max(stored_longest, current)
        return {
            "current_streak": current,
            "longest_streak": longest,
            "last_active_date": yesterday_str,
            "is_active_today": False,
            "is_broken": False
        }
    else:
        is_broken = len(effective_dates) > 0
        return {
            "current_streak": 0,
            "longest_streak": max(stored_longest, stored_current),
            "last_active_date": stored_last,
            "is_active_today": False,
            "is_broken": is_broken
        }

print("=== VERIFYING RECONCILED STREAK EDGE CASES ===")

# Case A: Live screenshot audit failure scenario (Sat + Sun both active in history, stored streak was 0/stale)
now_sun = datetime(2026, 9, 27, 12, 0, 0)
stale_streak = {"current_streak": 0, "longest_streak": 3, "last_active_date": "2026-09-24"}
active_dates = {"2026-09-26", "2026-09-27"}
res = reconcile_streak_with_activity(stale_streak, active_dates, now_sun)
print("Case A (Sat+Sun active, stale stored):", res)
assert res["current_streak"] == 2
assert res["is_active_today"] == True
assert res["is_broken"] == False
print("  [PASS] Reconciled streak fixes Bug 1: displays 2 days active, NOT 0 days lapsed!")

# Case B: Sunday morning before user does anything (Saturday was active)
active_dates_b = {"2026-09-26"}
res_b = reconcile_streak_with_activity({"current_streak": 1, "longest_streak": 1, "last_active_date": "2026-09-26"}, active_dates_b, now_sun)
print("Case B (Sunday morning pending action):", res_b)
assert res_b["current_streak"] == 1
assert res_b["is_active_today"] == False
assert res_b["is_broken"] == False
print("  [PASS] Sunday morning before spin shows 1 day alive, pending action (NOT active today)")

# Case C: Skipped Saturday and Sunday (last active Friday 2026-09-25)
res_c = reconcile_streak_with_activity({"current_streak": 2, "longest_streak": 2, "last_active_date": "2026-09-25"}, {"2026-09-25"}, now_sun)
print("Case C (Skipped 2 days):", res_c)
assert res_c["current_streak"] == 0
assert res_c["is_active_today"] == False
assert res_c["is_broken"] == True
print("  [PASS] Skipped day correctly marks streak as lapsed (0 days)")

print("ALL CASES PASSED PERFECTLY!")
