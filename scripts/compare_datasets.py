import json
import re
import subprocess
import urllib.request
import random

def compute_stats(topics, label):
    titles = [t.get('title', '') for t in topics]
    descs = [t.get('description', '') for t in topics]

    title_lens = [len(t) for t in titles]
    desc_lens = [len(d) for d in descs]

    avg_title = sum(title_lens) / len(title_lens) if title_lens else 0
    max_title = max(title_lens) if title_lens else 0
    titles_over_40 = sum(1 for l in title_lens if l > 40)

    avg_desc = sum(desc_lens) / len(desc_lens) if desc_lens else 0
    max_desc = max(desc_lens) if desc_lens else 0
    descs_over_165 = sum(1 for l in desc_lens if l > 165)

    print(f"================================================================")
    print(f"DATASET STATS: {label}")
    print(f"================================================================")
    print(f"Total topics:                 {len(topics)}")
    print(f"Average title length:         {avg_title:.2f} chars")
    print(f"Max title length:             {max_title} chars")
    print(f"Titles over 40 chars:         {titles_over_40} ({titles_over_40/len(topics)*100:.1f}%)")
    print(f"Average description length:   {avg_desc:.2f} chars")
    print(f"Max description length:       {max_desc} chars")
    print(f"Descriptions over 165 chars:  {descs_over_165} ({descs_over_165/len(topics)*100:.1f}%)")
    print("\n--- 5 Random Samples ---")
    random.seed(42)
    sample_indices = random.sample(range(len(topics)), min(5, len(topics)))
    for idx in sample_indices:
        t = topics[idx]
        print(f"[{t.get('id', idx)}] Title ({len(t.get('title',''))} chars): {t.get('title')}")
        print(f"     Description ({len(t.get('description',''))} chars): {t.get('description')}\n")
    return {
        "count": len(topics),
        "avg_title": avg_title,
        "max_title": max_title,
        "titles_over_40": titles_over_40,
        "avg_desc": avg_desc,
        "max_desc": max_desc,
        "descs_over_165": descs_over_165
    }

def main():
    # 1. This branch's compiledTopics.json
    with open('src/data/compiledTopics.json', 'r', encoding='utf-8') as f:
        current_topics = json.load(f)
    compute_stats(current_topics, "Current Branch (polish/round-5)")

    # 2. Main's compiledTopics.json
    cmd = ["git", "show", "main:src/data/compiledTopics.json"]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
    if res.returncode == 0:
        main_topics = json.loads(res.stdout)
        compute_stats(main_topics, "Main branch (src/data/compiledTopics.json)")
    else:
        print("Could not load main:src/data/compiledTopics.json")

    # 3. Check commit 7aafc84 (src/lib/compiledTopics.js)
    cmd7 = ["git", "show", "7aafc84:src/lib/compiledTopics.js"]
    res7 = subprocess.run(cmd7, capture_output=True, text=True, encoding='utf-8')
    if res7.returncode == 0:
        js_content = res7.stdout
        # Extract export const COMPILED_TOPICS = [...]
        match = re.search(r'export const COMPILED_TOPICS\s*=\s*(\[[\s\S]*\]);', js_content)
        if match:
            topics_7 = json.loads(match.group(1))
            compute_stats(topics_7, "Commit 7aafc84 (src/lib/compiledTopics.js - Good Dataset)")

    # 4. Deployed at https://daily-dive.vercel.app
    try:
        req = urllib.request.Request(
            'https://daily-dive.vercel.app',
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8')

        # Find assets JS files
        asset_matches = re.findall(r'/assets/([a-zA-Z0-9_\-\.]+)\.js', html)
        print(f"\nDiscovered deployed JS asset scripts: {asset_matches}")
        
        deployed_topics = []
        for asset in set(asset_matches):
            asset_url = f"https://daily-dive.vercel.app/assets/{asset}.js"
            try:
                with urllib.request.urlopen(urllib.request.Request(asset_url, headers={'User-Agent': 'Mozilla/5.0'})) as js_resp:
                    js_code = js_resp.read().decode('utf-8')
                    # Look for array of topics [{id:...}]
                    # Find JSON array in the chunk
                    m = re.search(r'\[\{"id":"[a-zA-Z0-9\-]+"[^\]]+\}\]', js_code)
                    if m:
                        chunk_topics = json.loads(m.group(0))
                        print(f"Found {len(chunk_topics)} topics in {asset_url}")
                        deployed_topics.extend(chunk_topics)
            except Exception as e:
                pass

        if deployed_topics:
            compute_stats(deployed_topics, "Deployed Vercel Build (https://daily-dive.vercel.app)")
        else:
            print("Could not extract topics from deployed Vercel assets directly.")
    except Exception as e:
        print(f"Error fetching deployed app: {e}")

if __name__ == '__main__':
    main()
