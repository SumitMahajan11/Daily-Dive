import json
import re
from pathlib import Path

def main():
    root = Path(__file__).resolve().parent.parent
    topics_path = root / 'src' / 'data' / 'compiledTopics.json'
    readme_path = root / 'README.md'

    with open(topics_path, 'r', encoding='utf-8') as f:
        topics = json.load(f)

    total_topics = len(topics)
    groups = {}
    categories = {}

    for t in topics:
        g = t.get('group_name') or t.get('group', 'other')
        c = t.get('category', 'other')
        groups[g] = groups.get(g, 0) + 1
        categories[c] = categories.get(c, 0) + 1

    print(f"Total topics loaded: {total_topics}")
    print(f"Total categories: {len(categories)}")
    print(f"Groups: {groups}")

    # Read README
    with open(readme_path, 'r', encoding='utf-8') as f:
        readme_content = f.read()

    # Remove any claim of "verified" links
    readme_content = re.sub(r'verified authoritative sources', 'curated reference links', readme_content, flags=re.IGNORECASE)
    readme_content = re.sub(r'verified links', 'curated links', readme_content, flags=re.IGNORECASE)

    # Build stats table
    # Category metadata mapping
    cat_details = [
        ("Tech & Systems", "Data Structures & Algorithms", "data-structures-algorithms", "Trees, graphs, dynamic programming, sorting"),
        ("", "Cloud & Infrastructure", "cloud-infra", "Kubernetes, networking, serverless, edge computing"),
        ("", "AI & Machine Learning", "ai-ml", "LLMs, embeddings, transformer architectures, MLOps"),
        ("", "Systems & Distributed Computing", "systems-distributed-computing", "Raft, Paxos, replication, CAP theorem, caching"),
        ("", "Web Development & Architecture", "web-dev", "DOM performance, rendering pipelines, security"),
        ("Mind & Growth", "Psychology & Decision Making", "psychology", "Cognitive biases, mental models, behavioral science"),
        ("", "Communication & Negotiation", "communication", "Framing, persuasion, executive presence, feedback"),
        ("", "Philosophy & Critical Thinking", "philosophy-critical-thinking", "Epistemology, ethics, logic, first principles"),
        ("Money & Career", "Personal Finance & Economics", "finance", "Compound interest, macroeconomics, capital markets"),
        ("", "Career Strategy & Leadership", "career-strategy", "Leverage, org design, talent density, negotiations"),
        ("World & Ideas", "Science & Nature", "science-nature", "Quantum mechanics, thermodynamics, biology"),
        ("", "History of Innovation", "history-innovation", "Breakthrough inventions, industrial revolutions, tech shifts")
    ]

    table_lines = [
        "<!-- STATS:START -->",
        f"Daily Dive compiles **{total_topics} curated micro-topics** spanning **{len(categories)} categories** and 4 primary knowledge pillars:\n",
        "| Pillar | Category | Topic Count | Focus Areas |",
        "| :--- | :--- | :---: | :--- |"
    ]

    for pillar, cat_label, cat_slug, focus in cat_details:
        count = categories.get(cat_slug, 0)
        p_col = f"**{pillar}**" if pillar else ""
        table_lines.append(f"| {p_col} | {cat_label} | {count} | {focus} |")

    table_lines.append(f"| **Total** | | **{total_topics} Topics** | |")
    table_lines.append("<!-- STATS:END -->")

    stats_block = "\n".join(table_lines)

    # Replace in README
    if "<!-- STATS:START -->" in readme_content and "<!-- STATS:END -->" in readme_content:
        pattern = re.compile(r"<!-- STATS:START -->.*?<!-- STATS:END -->", re.DOTALL)
        new_readme = pattern.sub(stats_block, readme_content)
    else:
        # Replace existing static table
        pattern = re.compile(
            r"Daily Dive compiles \*\*\d+ curated micro-topics\*\*.*?\|\s*\*\*Total\*\*\s*\|\s*\|\s*\*\*\d+ Topics\*\*\s*\|\s*\|",
            re.DOTALL
        )
        if pattern.search(readme_content):
            new_readme = pattern.sub(stats_block, readme_content)
        else:
            print("Warning: could not locate stats section to replace.")
            new_readme = readme_content

    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(new_readme)

    print("Successfully updated README.md stats and verified links claims!")

if __name__ == '__main__':
    main()
