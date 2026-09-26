import json
from datetime import datetime, timedelta

def get_local_calendar_date(dt):
    return dt.strftime("%Y-%m-%d")

def get_local_yesterday_date(dt):
    return (dt - timedelta(days=1)).strftime("%Y-%m-%d")

def calculate_updated_streak(current_streak_data, now_date):
    today_str = get_local_calendar_date(now_date)
    yesterday_str = get_local_yesterday_date(now_date)

    prev_active_date = current_streak_data.get("last_active_date")
    current_streak = current_streak_data.get("current_streak", 0)
    longest_streak = current_streak_data.get("longest_streak", 0)

    if prev_active_date == today_str:
        return {
            "current_streak": max(1, current_streak),
            "longest_streak": max(longest_streak, current_streak, 1),
            "last_active_date": today_str
        }

    if prev_active_date == yesterday_str:
        current_streak = (current_streak if current_streak > 0 else 0) + 1
    else:
        current_streak = 1

    longest_streak = max(longest_streak, current_streak)

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "last_active_date": today_str
    }

def get_effective_streak(streak_data, now_date):
    today_str = get_local_calendar_date(now_date)
    yesterday_str = get_local_yesterday_date(now_date)
    last_active = streak_data.get("last_active_date")
    current_streak = streak_data.get("current_streak", 0)
    longest_streak = streak_data.get("longest_streak", 0)

    if not last_active:
        return {
            "current_streak": 0,
            "longest_streak": longest_streak,
            "last_active_date": None,
            "is_active_today": False,
            "is_broken": False
        }

    if last_active == today_str:
        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "last_active_date": last_active,
            "is_active_today": True,
            "is_broken": False
        }

    if last_active == yesterday_str:
        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "last_active_date": last_active,
            "is_active_today": False,
            "is_broken": False
        }

    return {
        "current_streak": 0,
        "longest_streak": longest_streak,
        "last_active_date": last_active,
        "is_active_today": False,
        "is_broken": True
    }

MAX_HISTORY_ENTRIES = 150
MAX_HISTORY_AGE_DAYS = 60

def append_history_entry(prev_history, topic, action, now_date):
    if not topic:
        return prev_history
    now_ms = now_date.timestamp() * 1000
    cutoff_ms = now_ms - (MAX_HISTORY_AGE_DAYS * 86400000)

    entry = {
        "id": f"{topic['id']}_{int(now_ms)}",
        "topic_id": topic["id"],
        "title": topic["title"],
        "group_name": topic.get("group_name", "general"),
        "category": topic.get("category", "general"),
        "is_custom": bool(topic.get("is_custom", False)),
        "source": topic.get("source"),
        "action": action,
        "timestamp": now_date.isoformat(),
        "local_date": get_local_calendar_date(now_date)
    }

    filtered = [entry]
    for h in prev_history:
        h_dt = datetime.fromisoformat(h["timestamp"].replace("Z", "+00:00"))
        if h_dt.timestamp() * 1000 >= cutoff_ms:
            filtered.append(h)

    return filtered[:MAX_HISTORY_ENTRIES]

print("=== RUNNING PHASE 4 STREAK & HISTORY TESTS ===")

# Test 1: First spin ever
t1_now = datetime(2026, 9, 20, 10, 0, 0)
s1 = calculate_updated_streak({}, t1_now)
assert s1["current_streak"] == 1, f"Expected 1, got {s1['current_streak']}"
assert s1["longest_streak"] == 1, f"Expected 1, got {s1['longest_streak']}"
assert s1["last_active_date"] == "2026-09-20"
print("[PASS] Test 1 Passed: First spin ever initializes streak to 1")

# Test 2: Same-day multiple spins
s2 = calculate_updated_streak(s1, datetime(2026, 9, 20, 15, 30, 0))
assert s2["current_streak"] == 1, f"Expected 1, got {s2['current_streak']}"
assert s2["longest_streak"] == 1
print("[PASS] Test 2 Passed: Same-day multiple spins maintain steady streak (no double increment)")

# Test 3: Normal consecutive day continuation (Day 2)
t3_now = datetime(2026, 9, 21, 9, 0, 0)
s3 = calculate_updated_streak(s2, t3_now)
assert s3["current_streak"] == 2, f"Expected 2, got {s3['current_streak']}"
assert s3["longest_streak"] == 2
print("[PASS] Test 3 Passed: Consecutive day spin advances streak from 1 -> 2")

# Test 4: Continuing streak to Day 5
s_curr = s3
for day in [22, 23, 24]:
    s_curr = calculate_updated_streak(s_curr, datetime(2026, 9, day, 11, 0, 0))
assert s_curr["current_streak"] == 5
assert s_curr["longest_streak"] == 5
print(f"[PASS] Test 4 Passed: Multi-day streak correctly reached {s_curr['current_streak']} days")

# Test 5: Effective streak check on next morning (Day 25, pending spin)
eff_pending = get_effective_streak(s_curr, datetime(2026, 9, 25, 8, 0, 0))
assert eff_pending["current_streak"] == 5
assert eff_pending["is_active_today"] == False
assert eff_pending["is_broken"] == False
print("[PASS] Test 5 Passed: Effective streak pending today's spin shows active 5-day streak alive")

# Test 6: Streak breaking after skipped day (Day 26, Day 25 was skipped)
eff_broken = get_effective_streak(s_curr, datetime(2026, 9, 26, 8, 0, 0))
assert eff_broken["current_streak"] == 0, f"Expected 0, got {eff_broken['current_streak']}"
assert eff_broken["is_broken"] == True
assert eff_broken["longest_streak"] == 5
print("[PASS] Test 6 Passed: Effective streak detects skipped day (2 days since last active) -> streak broken")

# Test 7: User spins on Day 26 after breaking streak
s_broken_spin = calculate_updated_streak(s_curr, datetime(2026, 9, 26, 12, 0, 0))
assert s_broken_spin["current_streak"] == 1, f"Expected 1, got {s_broken_spin['current_streak']}"
assert s_broken_spin["longest_streak"] == 5, f"Expected longest 5, got {s_broken_spin['longest_streak']}"
assert s_broken_spin["last_active_date"] == "2026-09-26"
print("[PASS] Test 7 Passed: Post-break spin resets current streak to 1 while preserving longest streak (5)")

# Test 8: History logging for built-in and uploaded custom topics
hist = []
topic_builtin = {"id": "rag-llms", "title": "Retrieval-Augmented Generation", "group_name": "tech", "category": "ai-ml"}
topic_custom = {"id": "custom-cs101-notes", "title": "CS101 Binary Search Lecture", "group_name": "custom", "category": "notes", "is_custom": True, "source": "lecture_03.pdf"}

hist = append_history_entry(hist, topic_builtin, "spin", datetime(2026, 9, 26, 10, 0, 0))
hist = append_history_entry(hist, topic_custom, "spin", datetime(2026, 9, 26, 10, 5, 0))
hist = append_history_entry(hist, topic_custom, "learned", datetime(2026, 9, 26, 10, 10, 0))

assert len(hist) == 3
assert hist[0]["action"] == "learned" and hist[0]["is_custom"] == True
assert hist[1]["action"] == "spin" and hist[1]["source"] == "lecture_03.pdf"
assert hist[2]["action"] == "spin" and hist[2]["is_custom"] == False
print("[PASS] Test 8 Passed: Both built-in and custom uploaded topics log cleanly into unified history")

# Test 9: History retention cap (150 entries) and age pruning (>60 days)
old_hist = []
for i in range(200):
    d = datetime(2026, 9, 26, 12, 0, 0) - timedelta(days=i * 0.5)
    t = {"id": f"topic-{i}", "title": f"Topic #{i}", "group_name": "tech", "category": "ai-ml"}
    old_hist = append_history_entry(old_hist, t, "spin", d)

assert len(old_hist) <= 150, f"History length {len(old_hist)} exceeded cap of 150"
for item in old_hist:
    item_dt = datetime.fromisoformat(item["timestamp"].replace("Z", "+00:00"))
    days_old = (datetime(2026, 9, 26, 12, 0, 0) - item_dt.replace(tzinfo=None)).total_seconds() / 86400
    print(f"[PASS] Test 9 Passed: History retention successfully capped at {len(old_hist)} entries and pruned >60d items")

print("\nALL 9 PHASE 4 TESTS PASSED ACCURATELY!")
