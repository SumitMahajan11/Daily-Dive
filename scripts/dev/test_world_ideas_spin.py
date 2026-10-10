import os
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.abspath(r'C:\Users\SUMIT\.gemini\antigravity-ide\brain\07982283-117c-4e55-9142-5d40ce7542d3\screenshots_phase3')
os.makedirs(OUTPUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(1500)

    # Click World & Ideas preset
    filter_btn = page.locator("button:has-text('World & Ideas (90)')").first
    filter_btn.click()
    print("Clicked World & Ideas preset!", flush=True)
    page.wait_for_timeout(800)

    # Now spin
    spin_btn = page.locator("#spin button:has-text('Spin Roulette')").first
    spin_btn.click()
    print("Spinning for World & Ideas topic...", flush=True)
    page.wait_for_timeout(4500)

    # Capture topic card
    card = page.locator("#spin article")
    if card.is_visible():
        card.screenshot(path=os.path.join(OUTPUT_DIR, "10_world_ideas_topic_card.png"))
        print("Saved 10_world_ideas_topic_card.png", flush=True)
    else:
        print("Card not visible", flush=True)

    browser.close()
    print("Complete!", flush=True)
