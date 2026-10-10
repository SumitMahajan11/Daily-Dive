import json
import re
import subprocess
import os

def main():
    # 1. Extract from git commit 7aafc84
    cmd = ["git", "show", "7aafc84:src/lib/compiledTopics.js"]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
    if res.returncode != 0:
        raise RuntimeError("Failed to fetch 7aafc84:src/lib/compiledTopics.js")

    js_code = res.stdout
    match = re.search(r'export const COMPILED_TOPICS\s*=\s*(\[[\s\S]*\]);', js_code)
    if not match:
        raise ValueError("Could not parse COMPILED_TOPICS array from commit 7aafc84")

    topics = json.loads(match.group(1))
    print(f"Extracted {len(topics)} topics from commit 7aafc84.")

    # Validate schema
    valid_groups = {'tech', 'money-career', 'mind-growth', 'world-ideas'}
    group_counts = {}
    for idx, t in enumerate(topics):
        assert 'id' in t and t['id'], f"Topic at index {idx} missing id"
        assert 'title' in t and t['title'], f"Topic {t['id']} missing title"
        assert 'description' in t and t['description'], f"Topic {t['id']} missing description"
        assert 'category' in t and t['category'], f"Topic {t['id']} missing category"
        assert 'group_name' in t and t['group_name'] in valid_groups, f"Topic {t['id']} has invalid group_name: {t.get('group_name')}"
        assert len(t['description']) <= 175, f"Topic {t['id']} description too long: {len(t['description'])} chars"
        g = t['group_name']
        group_counts[g] = group_counts.get(g, 0) + 1

    print("Group counts:", group_counts)
    assert group_counts == {'tech': 313, 'money-career': 113, 'mind-growth': 176, 'world-ideas': 90}, f"Unexpected group counts: {group_counts}"
    assert len(topics) == 692, f"Expected 692 topics, got {len(topics)}"

    out_path = os.path.abspath(os.path.join('src', 'data', 'compiledTopics.json'))
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(topics, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(topics)} topics to {out_path}")

if __name__ == '__main__':
    main()
