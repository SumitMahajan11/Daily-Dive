import json
import os
import sys

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    data_file = os.path.join(root_dir, 'src', 'data', 'compiledTopics.json')
    groups_dir = os.path.join(root_dir, 'src', 'data', 'groups')
    os.makedirs(groups_dir, exist_ok=True)

    if not os.path.exists(data_file):
        raise FileNotFoundError(f"Missing canonical data file: {data_file}")

    with open(data_file, 'r', encoding='utf-8') as f:
        topics = json.load(f)

    if len(topics) != 692:
        raise ValueError(f"Expected 692 topics, found {len(topics)}")

    expected_groups = {'tech', 'money-career', 'mind-growth', 'world-ideas'}
    expected_counts = {'tech': 313, 'money-career': 113, 'mind-growth': 176, 'world-ideas': 90}

    grouped = {g: [] for g in expected_groups}

    for idx, t in enumerate(topics):
        group = t.get('group_name') or t.get('group')
        if not group or group not in expected_groups:
            raise ValueError(f"FATAL: Topic [{t.get('id', idx)}] has invalid or missing group: '{group}'. No silent fallback allowed.")
        
        # Standardize topic object schema
        cleaned_topic = {
            'id': t['id'],
            'title': t['title'],
            'description': t['description'],
            'category': t['category'],
            'group': group,
            'group_name': group,
            'tags': t.get('tags', []),
            'resources': t.get('resources', [])
        }
        grouped[group].append(cleaned_topic)

    # Validate exact counts
    for g, exp_count in expected_counts.items():
        actual_count = len(grouped[g])
        if actual_count != exp_count:
            raise ValueError(f"Group '{g}' count mismatch: expected {exp_count}, got {actual_count}")
        print(f"  [OK] Group '{g}': {actual_count} topics")

    # Write each group JS module
    for g, group_topics in grouped.items():
        out_file = os.path.join(groups_dir, f"{g}.js")
        with open(out_file, 'w', encoding='utf-8') as f:
            f.write(f"/**\n * Daily Dive Topics Group: {g}\n * Total topics: {len(group_topics)}\n */\n\n")
            f.write("export const topics = ")
            json.dump(group_topics, f, indent=2, ensure_ascii=False)
            f.write(";\n\nexport default topics;\n")
        print(f"Generated {out_file} ({len(group_topics)} topics)")

    print(f"\n[SUCCESS]: Successfully split all {len(topics)} topics across 4 group modules.")

if __name__ == '__main__':
    main()
