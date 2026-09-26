import os
from playwright.sync_api import sync_playwright

video_path = os.path.abspath('tests/fixtures/lecture_microservices.webm')

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.on("console", lambda msg: print("CONSOLE:", msg.text, flush=True))
    page.on("pageerror", lambda err: print("PAGE ERROR:", err, flush=True))
    page.goto('http://localhost:5173')
    
    file_input = page.locator('#extract input[type="file"]')
    file_input.set_input_files(video_path)
    
    for i in range(25):
        page.wait_for_timeout(1000)
        h3 = page.locator('#extract h3').all_text_contents()
        p_tags = page.locator('#extract p').all_text_contents()
        print(f"Sec {i}: H3={h3}", flush=True)
        if any('Review Extracted Topics' in x for x in h3):
            print("SUCCESS! Reached review state for Video!", flush=True)
            cards = page.locator('#extract .grid > div').all()
            for idx, c in enumerate(cards):
                t = c.locator('input[type="text"]').input_value()
                d = c.locator('textarea').input_value()
                print(f"  Topic {idx+1}: {t} -> {d}", flush=True)
            break
        if any('Extraction Failed' in x for x in h3):
            print("Extraction Failed banner appeared:", p_tags, flush=True)
            break
            
    browser.close()
