import json
import re

def tokenize(s):
    return set(re.findall(r'[a-z0-9]+', s.lower()))

def run_pass():
    with open('src/data/compiledTopics.json', 'r', encoding='utf-8') as f:
        compiled = json.load(f)

    print(f"Auditing {len(compiled)} compiled topics...", flush=True)

    # 1. Exact ID duplicates
    id_counts = {}
    for t in compiled:
        id_counts[t['id']] = id_counts.get(t['id'], 0) + 1
    id_dups = {k: v for k, v in id_counts.items() if v > 1}
    print(f"1. ID Collisions: {len(id_dups)}", flush=True)

    # 2. Exact Title duplicates
    title_counts = {}
    for t in compiled:
        t_low = t['title'].strip().lower()
        title_counts[t_low] = title_counts.get(t_low, 0) + 1
    title_dups = {k: v for k, v in title_counts.items() if v > 1}
    print(f"2. Exact Title Collisions: {len(title_dups)}", flush=True)

    # 3. Near-duplicate Title pairs (Jaccard similarity > 0.65 on non-stop words)
    stop_words = {'the', 'a', 'an', 'and', 'or', 'in', 'of', 'for', 'with', 'on', 'at', 'by', 'from', 'to', 'is', 'are'}
    token_sets = [tokenize(t['title']) - stop_words for t in compiled]
    
    near_dups = []
    for i in range(len(token_sets)):
        for j in range(i + 1, len(token_sets)):
            s1, s2 = token_sets[i], token_sets[j]
            if not s1 or not s2:
                continue
            inter = len(s1 & s2)
            union = len(s1 | s2)
            jaccard = inter / union if union > 0 else 0
            if jaccard >= 0.60:
                near_dups.append((jaccard, compiled[i]['id'], compiled[i]['title'], compiled[j]['id'], compiled[j]['title']))

    print(f"3. Near-Duplicate Title Pairs (Jaccard >= 0.60): {len(near_dups)}", flush=True)
    for score, id1, t1, id2, t2 in near_dups:
        print(f"   [{score:.2f}] '{t1}' ({id1}) vs '{t2}' ({id2})", flush=True)

    # 4. Check Resources validity
    malformed_resources = []
    total_resources = 0
    for t in compiled:
        for r in t.get('resources', []):
            total_resources += 1
            if not isinstance(r, dict) or not r.get('label') or not r.get('url'):
                malformed_resources.append((t['id'], r))
            elif not r.get('url', '').startswith(('http://', 'https://')):
                malformed_resources.append((t['id'], r))

    print(f"4. Total Resources Checked: {total_resources}", flush=True)
    print(f"   Malformed Resources / URLs: {len(malformed_resources)}", flush=True)

    # 5. Check Description Length / Quality
    short_descs = [t for t in compiled if len(t.get('description', '')) < 60]
    print(f"5. Short Descriptions (<60 chars): {len(short_descs)}", flush=True)

    print("\nDe-duplication & Quality Pass complete!", flush=True)

if __name__ == '__main__':
    run_pass()
