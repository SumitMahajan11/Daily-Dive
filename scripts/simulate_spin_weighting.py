import json
import math
import random
from datetime import datetime, timedelta

def simulate():
    with open('src/data/compiledTopics.json', 'r', encoding='utf-8') as f:
        topics = json.load(f)

    total_pool = len(topics)
    print(f"--- Simulating Spin-Weighting on Pool of {total_pool} Topics ---", flush=True)

    # Simulation params
    # 30 days, 10 spins per day = 300 total spins
    user_progress = {} # topic_id -> { times_seen, last_seen: iso_str }
    spins_history = []
    immediate_repeats = 0 # seen within same day
    same_week_repeats = 0 # seen within 7 days

    sim_start = datetime(2026, 9, 1, 9, 0, 0)
    current_time = sim_start

    for day in range(30):
        current_time = sim_start + timedelta(days=day)
        
        for spin in range(10):
            # Select topic using exact algorithm from roulette.js
            now_ms = current_time.timestamp() * 1000
            ONE_DAY_MS = 86400000

            weighted_list = []
            for t in topics:
                prog = user_progress.get(t['id'])
                if not prog or prog['times_seen'] == 0:
                    weight = 100
                else:
                    last_seen_ms = datetime.fromisoformat(prog['last_seen']).timestamp() * 1000
                    days_since = max(0, (now_ms - last_seen_ms) / ONE_DAY_MS)
                    recency = min(50, 2 + days_since * 1.8)
                    freq_penalty = 1 + math.log2(prog['times_seen'] + 1) * 0.4
                    weight = max(1, round(recency / freq_penalty))
                weighted_list.append((t, weight))

            total_weight = sum(w for _, w in weighted_list)
            r = random.uniform(0, total_weight)
            chosen = None
            for t, w in weighted_list:
                if r < w:
                    chosen = t
                    break
                r -= w
            if not chosen:
                chosen = weighted_list[-1][0]

            # Check repeat interval
            if chosen['id'] in user_progress:
                prev_seen = datetime.fromisoformat(user_progress[chosen['id']]['last_seen'])
                diff_days = (current_time - prev_seen).total_seconds() / 86400
                if diff_days < 1.0:
                    immediate_repeats += 1
                if diff_days < 7.0:
                    same_week_repeats += 1

            # Update progress
            existing = user_progress.get(chosen['id'], {'times_seen': 0})
            user_progress[chosen['id']] = {
                'times_seen': existing['times_seen'] + 1,
                'last_seen': current_time.isoformat()
            }
            spins_history.append(chosen)

    unique_learned = len(user_progress)
    print(f"\n30-Day Simulation Results (300 spins total):")
    print(f"  Total unique topics encountered: {unique_learned} of {total_pool} ({unique_learned/total_pool*100:.1f}%)")
    print(f"  Immediate same-day repeats: {immediate_repeats} (0.0% expected)")
    print(f"  Same-week (<7d) repeats: {same_week_repeats}")
    print(f"  Average times each seen topic was encountered: {300/unique_learned:.2f}")

    # Check category distribution across 300 spins
    cat_distribution = {}
    for t in spins_history:
        cat_distribution[t['category']] = cat_distribution.get(t['category'], 0) + 1

    print("\nCategory distribution across 300 spins:")
    for c, count in sorted(cat_distribution.items()):
        print(f"  {c}: {count} spins ({count/300*100:.1f}%)")

if __name__ == '__main__':
    simulate()
