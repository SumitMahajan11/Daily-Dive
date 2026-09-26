import json

with open('src/data/compiledTopics.json', 'r', encoding='utf-8') as f:
    topics = json.load(f)

print(f"Total topics: {len(topics)}")
lengths = [len(t.get('description', '')) for t in topics]
word_counts = [len(t.get('description', '').split()) for t in topics]

print(f"Character lengths:")
print(f"  Min: {min(lengths)}")
print(f"  Max: {max(lengths)}")
print(f"  Avg: {sum(lengths)/len(lengths):.1f}")
print(f"Word counts:")
print(f"  Min: {min(word_counts)}")
print(f"  Max: {max(word_counts)}")
print(f"  Avg: {sum(word_counts)/len(word_counts):.1f}")

# Show 5 random samples
print("\nSample current descriptions:")
for t in topics[:5]:
    desc = t.get('description', '')
    print(f"\n[{t.get('category')}] {t.get('title')} ({len(desc)} chars, {len(desc.split())} words):")
    print(f"  \"{desc}\"")
