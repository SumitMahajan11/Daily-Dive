import os
from playwright.sync_api import sync_playwright

video_path = os.path.abspath('tests/fixtures/lecture_microservices.webm')
print(f"Testing video extraction with: {video_path} ({os.path.getsize(video_path)} bytes)...", flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 1000})
    page.on("console", lambda m: print("CONSOLE:", m.text, flush=True))
    page.goto('http://localhost:5173')
    
    file_input = page.locator('#extract input[type="file"]')
    file_input.set_input_files(video_path)
    
    print("Waiting for video frame extraction and OCR...", flush=True)
    page.wait_for_selector('text=Review Extracted Topics', timeout=40000)
    print("Video frame OCR extraction succeeded! Review screen active.", flush=True)
    
    cards = page.locator('#extract .candidate-topic-card')
    count = cards.count()
    print(f"Total topics extracted from video: {count}")
    
    for i in range(count):
        c = cards.nth(i)
        t = c.locator('input[placeholder="Topic Title"]').input_value()
        badge = c.locator('span:has-text("Verified"), span:has-text("Needs review")').first.inner_text()
        print(f"  [{i+1}] \"{t}\" -> {badge}")
        
    browser.close()
