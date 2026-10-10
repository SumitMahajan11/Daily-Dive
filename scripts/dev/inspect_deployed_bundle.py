import urllib.request
import re
import json

url = "https://daily-dive.vercel.app/assets/index-nwhw9pv7.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    js_text = resp.read().decode('utf-8')

# Search for the compiled topics array: [{id:"...
# Let's find "id:\"aristotelian-rhetorical-triangle-ethos-pathos-logos\"" or similar
pos = js_text.find("aristotelian-rhetorical-triangle")
if pos != -1:
    # Look backwards to find the start of the array `[`
    arr_start = js_text.rfind("[", 0, pos)
    
    # Balance brackets from arr_start
    bracket_count = 0
    in_string = False
    escape = False
    string_char = None
    arr_end = -1
    
    for i in range(arr_start, len(js_text)):
        ch = js_text[i]
        if escape:
            escape = False
            continue
        if ch == '\\':
            escape = True
            continue
        if in_string:
            if ch == string_char:
                in_string = False
            continue
        else:
            if ch in ('"', "'", '`'):
                in_string = True
                string_char = ch
                continue
            if ch == '[':
                bracket_count += 1
            elif ch == ']':
                bracket_count -= 1
                if bracket_count == 0:
                    arr_end = i + 1
                    break
    
    if arr_end != -1:
        array_code = js_text[arr_start:arr_end]
        print(f"Extracted array string of length: {len(array_code)}")
        with open('scripts/deployed_topics.json', 'w', encoding='utf-8') as f:
            # Run node to evaluate and output clean JSON
            import subprocess
            node_script = f"const fs = require('fs'); const topics = {array_code}; fs.writeFileSync('scripts/deployed_topics.json', JSON.stringify(topics, null, 2));"
            with open('scripts/eval_deployed.cjs', 'w', encoding='utf-8') as js_file:
                js_file.write(node_script)
            res = subprocess.run(["node", "scripts/eval_deployed.cjs"], capture_output=True, text=True)
            if res.returncode == 0:
                with open('scripts/deployed_topics.json', 'r', encoding='utf-8') as tf:
                    topics = json.load(tf)
                print(f"Successfully extracted {len(topics)} topics from deployed Vercel bundle!")
                import sys
                sys.path.append('scripts')
                from compare_datasets import compute_stats
                compute_stats(topics, "Deployed Vercel Bundle (https://daily-dive.vercel.app)")
            else:
                print("Node error:", res.stderr)
