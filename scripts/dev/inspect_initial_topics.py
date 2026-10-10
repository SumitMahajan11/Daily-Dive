import glob
import csv
import json
import re

with open('src/lib/roulette.js', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'{\s*id:\s*"([^"]+)",\s*group_name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*tags:\s*\[(.*?)\],\s*title:\s*"([^"]+)"'
matches = re.findall(pattern, text)

print(f"INITIAL_TOPICS in roulette.js: {len(matches)} topics found")
for m in matches:
    print(f"  [{m[1]}::{m[2]}] {m[0]}: {m[4]}")
