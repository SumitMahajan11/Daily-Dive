import csv
import json

with open('seeds/topics_tech_ai_ml.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

with open('seeds/seed_topics_tech_ai_ml.sql', 'w', encoding='utf-8') as f_sql:
    f_sql.write('-- ==============================================================================\n')
    f_sql.write(f'-- TOPICS SEED DATA: TECH -> AI-ML ({len(rows)} Topics)\n')
    f_sql.write('-- ==============================================================================\n\n')
    
    for r in rows:
        topic_id = r['id'].replace("'", "''")
        group_name = r['group_name'].replace("'", "''")
        category = r['category'].replace("'", "''")
        tags = [t.strip().replace("'", "''") for t in r['tags'].split(';') if t.strip()]
        tags_sql = "ARRAY[" + ", ".join([f"'{t}'" for t in tags]) + "]::TEXT[]"
        title = r['title'].replace("'", "''")
        desc = r['description'].replace("'", "''")
        res_json = r['resources'].replace("'", "''")
        
        f_sql.write(f"INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)\n")
        f_sql.write(f"VALUES ('{topic_id}', '{group_name}', '{category}', {tags_sql}, '{title}', '{desc}', '{res_json}'::JSONB)\n")
        f_sql.write("ON CONFLICT (id) DO UPDATE SET\n")
        f_sql.write("    title = EXCLUDED.title,\n")
        f_sql.write("    description = EXCLUDED.description,\n")
        f_sql.write("    tags = EXCLUDED.tags,\n")
        f_sql.write("    resources = EXCLUDED.resources;\n\n")

print(f"Generated SQL seed file: seeds/seed_topics_tech_ai_ml.sql with {len(rows)} records.")
