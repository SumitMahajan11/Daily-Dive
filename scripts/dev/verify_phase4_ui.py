import os
import json
from datetime import datetime, timedelta
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.abspath(r'C:\Users\SUMIT\.gemini\antigravity-ide\brain\07982283-117c-4e55-9142-5d40ce7542d3\screenshots_phase4')
os.makedirs(OUTPUT_DIR, exist_ok=True)

today = datetime.now()
today_str = today.strftime("%Y-%m-%d")
yesterday_str = (today - timedelta(days=1)).strftime("%Y-%m-%d")
day_before_str = (today - timedelta(days=2)).strftime("%Y-%m-%d")

# Realistic sample history data with both built-in topics and custom uploads
sample_history = [
    {
        "id": "rag-llms_01",
        "topic_id": "rag-llms",
        "title": "Retrieval-Augmented Generation (RAG)",
        "group_name": "tech",
        "category": "ai-ml",
        "is_custom": False,
        "action": "learned",
        "timestamp": today.isoformat(),
        "local_date": today_str
    },
    {
        "id": "radical-candor_02",
        "topic_id": "radical-candor-framework",
        "title": "Radical Candor: Care Personally & Challenge Directly",
        "group_name": "money-career",
        "category": "career-strategy",
        "is_custom": False,
        "action": "spin",
        "timestamp": (today - timedelta(hours=2)).isoformat(),
        "local_date": today_str
    },
    {
        "id": "custom_lecture_03",
        "topic_id": "custom-cs101-notes",
        "title": "CS101 Distributed Consensus & Paxos Slides",
        "group_name": "custom",
        "category": "notes",
        "is_custom": True,
        "source": "mit_6824_consensus.pdf",
        "action": "learned",
        "timestamp": (today - timedelta(days=1, hours=3)).isoformat(),
        "local_date": yesterday_str
    },
    {
        "id": "general-relativity_04",
        "topic_id": "general-relativity-spacetime-curvature",
        "title": "General Relativity: Spacetime Curvature & Geodesics",
        "group_name": "world-ideas",
        "category": "science-nature",
        "is_custom": False,
        "action": "spin",
        "timestamp": (today - timedelta(days=1, hours=5)).isoformat(),
        "local_date": yesterday_str
    },
    {
        "id": "aristotelian-triangle_05",
        "topic_id": "aristotelian-rhetorical-triangle-ethos-pathos-logos",
        "title": "The Aristotelian Rhetorical Triangle: Ethos, Pathos & Logos",
        "group_name": "mind-growth",
        "category": "communication",
        "is_custom": False,
        "action": "learned",
        "timestamp": (today - timedelta(days=2, hours=4)).isoformat(),
        "local_date": day_before_str
    }
]

sample_progress = {
    "rag-llms": {"times_seen": 2, "last_seen": today.isoformat(), "learned": True},
    "radical-candor-framework": {"times_seen": 1, "last_seen": today.isoformat(), "learned": False},
    "custom-cs101-notes": {"times_seen": 3, "last_seen": (today - timedelta(days=1)).isoformat(), "learned": True},
    "general-relativity-spacetime-curvature": {"times_seen": 1, "last_seen": (today - timedelta(days=1)).isoformat(), "learned": False},
    "aristotelian-rhetorical-triangle-ethos-pathos-logos": {"times_seen": 2, "last_seen": (today - timedelta(days=2)).isoformat(), "learned": True}
}

sample_custom_topics = [
    {
        "id": "custom-cs101-notes",
        "title": "CS101 Distributed Consensus & Paxos Slides",
        "description": "Explores Leslie Lamport's state machine replication, leader lease timeouts, and quorums under network partitions.",
        "group_name": "custom",
        "category": "notes",
        "is_custom": True,
        "source": "mit_6824_consensus.pdf",
        "tags": ["distributed-systems", "paxos", "consensus"],
        "resources": [{"label": "Paxos Made Simple (Lamport)", "url": "https://lamport.azurewebsites.net/pubs/paxos-simple.pdf"}]
    }
]

sample_streaks = {
    "current_streak": 3,
    "longest_streak": 5,
    "last_active_date": today_str
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 950})

    # Go to app and inject sample local data
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(1000)

    page.evaluate(f"""() => {{
        localStorage.setItem('daily_dive_history', JSON.stringify({json.dumps(sample_history)}));
        localStorage.setItem('daily_dive_guest_progress', JSON.stringify({json.dumps(sample_progress)}));
        localStorage.setItem('daily_dive_guest_streaks', JSON.stringify({json.dumps(sample_streaks)}));
        localStorage.setItem('daily_dive_custom_topics', JSON.stringify({json.dumps(sample_custom_topics)}));
    }}""")

    # Reload page with injected data
    page.reload()
    page.wait_for_timeout(2000)

    # 1. Capture Top Navbar & Hero with Local Storage Badge
    page.screenshot(path=os.path.join(OUTPUT_DIR, "01_navbar_streak_and_hero.png"))
    print("Saved 01_navbar_streak_and_hero.png", flush=True)

    # 2. Navigate to Progress & Stats Section
    nav_btn = page.locator("button:has-text('Progress & Stats')").first
    nav_btn.click()
    page.wait_for_timeout(1000)

    # Scroll down to center progress section
    page.mouse.wheel(0, 700)
    page.wait_for_timeout(600)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "02_stats_overview_and_streak_strip.png"))
    print("Saved 02_stats_overview_and_streak_strip.png", flush=True)

    # 3. Scroll to Category Breakdown and History Log
    page.mouse.wheel(0, 600)
    page.wait_for_timeout(600)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "03_history_log_and_categories.png"))
    print("Saved 03_history_log_and_categories.png", flush=True)

    # 4. Test History Filter Pills (Click "Uploads" and "Learned")
    uploads_pill = page.locator("button:has-text('Uploads')").first
    if uploads_pill.is_visible():
        uploads_pill.click()
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "04_history_uploads_filter.png"))
        print("Saved 04_history_uploads_filter.png", flush=True)

    learned_pill = page.locator("button:has-text('Learned')").first
    if learned_pill.is_visible():
        learned_pill.click()
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "05_history_learned_filter.png"))
        print("Saved 05_history_learned_filter.png", flush=True)

    # 5. Live Spin & Mark Learned from UI
    all_pill = page.locator("button:has-text('All')").first
    if all_pill.is_visible():
        all_pill.click()

    nav_spin = page.locator("button:has-text('Spin Roulette')").first
    nav_spin.click()
    page.wait_for_timeout(800)

    spin_btn = page.locator("#spin button:has-text('Spin Roulette')").first
    spin_btn.click()
    print("Live spinning roulette...", flush=True)
    page.wait_for_timeout(4200)

    # Mark the topic as learned
    mark_btn = page.locator("button:has-text('Mark as Learned')").first
    if mark_btn.is_visible():
        mark_btn.click()
        print("Clicked Mark as Learned!", flush=True)
        page.wait_for_timeout(1000)

    # Return to Progress Screen to verify instant history prepend
    nav_btn.click()
    page.wait_for_timeout(800)
    page.mouse.wheel(0, 1000)
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "06_live_updated_history_log.png"))
    print("Saved 06_live_updated_history_log.png", flush=True)

    browser.close()
    print("Verification complete!", flush=True)
