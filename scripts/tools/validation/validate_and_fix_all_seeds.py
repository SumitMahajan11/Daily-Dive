import os
import csv
import json
import sys

# Force UTF-8 output if possible
sys.stdout.reconfigure(encoding='utf-8')

seed_dir = 'seeds'
print("=" * 70)
print("AUDITING ALL CSV FILES IN SEEDS/")
print("=" * 70)

all_files = [f for f in sorted(os.listdir(seed_dir)) if f.endswith('.csv')]

topic_counts = {}
errors = []
all_topic_ids = {}

for fname in all_files:
    fpath = os.path.join(seed_dir, fname)
    with open(fpath, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        count = 0
        file_errors = []
        for idx, row in enumerate(reader, 1):
            count += 1
            t_id = row.get('id', '')
            if not t_id:
                file_errors.append(f"Row {idx}: missing ID")
            else:
                if t_id in all_topic_ids:
                    file_errors.append(f"Row {idx} ({t_id}): GLOBAL DUPLICATE ID with {all_topic_ids[t_id]}")
                all_topic_ids[t_id] = f"{fname} row {idx}"
            
            # Test JSON load
            res_raw = row.get('resources', '')
            try:
                res_obj = json.loads(res_raw)
                if not isinstance(res_obj, list):
                    file_errors.append(f"Row {idx} ({t_id}): resources is not a list")
                elif not (2 <= len(res_obj) <= 4):
                    file_errors.append(f"Row {idx} ({t_id}): resources count {len(res_obj)} not in [2,4]")
                else:
                    for r_idx, r in enumerate(res_obj):
                        if 'label' not in r or 'url' not in r:
                            file_errors.append(f"Row {idx} ({t_id}): item {r_idx} missing label or url")
                        elif not r['url'].startswith('http'):
                            file_errors.append(f"Row {idx} ({t_id}): item {r_idx} invalid url {r['url']}")
            except Exception as e:
                file_errors.append(f"Row {idx} ({t_id}): JSON Error: {e} | Content: {res_raw[:80]}")
        
        topic_counts[fname] = count
        if file_errors:
            errors.append((fname, file_errors))
            print(f"[FAIL] {fname}: {len(file_errors)} errors found across {count} rows")
            for err in file_errors:
                print(f"   - {err}")
        else:
            print(f"[PASS] {fname}: PASSED ({count} rows, 100% valid JSON)")

print("\n" + "=" * 70)
print("SUMMARY OF TOPIC COUNTS:")
for fname, cnt in topic_counts.items():
    print(f"  {fname:<45}: {cnt} topics")
print(f"Total topics across all {len(all_files)} categories: {sum(topic_counts.values())}")
print("=" * 70)
