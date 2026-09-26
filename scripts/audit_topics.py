import glob
import csv
import json
import re

def audit():
    # 1. Parse roulette.js INITIAL_TOPICS
    with open('src/lib/roulette.js', 'r', encoding='utf-8') as f:
        roulette_text = f.read()

    # Extract INITIAL_TOPICS block
    init_match = re.search(r'export const INITIAL_TOPICS = \[(.*?)\];\s*export const CATEGORY_TREE', roulette_text, re.DOTALL)
    if not init_match:
        print("Could not match INITIAL_TOPICS in roulette.js")
        return

    # 2. Parse all seeds
    seed_files = sorted(glob.glob('seeds/*.csv'))
    seeds_by_cat = {}
    seed_ids = {}
    seed_titles = {}

    for sf in seed_files:
        with open(sf, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                key = f"{row['group_name']}::{row['category']}"
                if key not in seeds_by_cat:
                    seeds_by_cat[key] = []
                seeds_by_cat[key].append(row)
                seed_ids[row['id']] = row
                seed_titles[row['title'].strip().lower()] = row

    print("=== SEED FILE BREAKDOWN ===")
    total_seeds = 0
    for cat, items in seeds_by_cat.items():
        print(f"  {cat}: {len(items)} topics")
        total_seeds += len(items)
    print(f"Total Seed Topics: {total_seeds}\n")

if __name__ == '__main__':
    audit()
