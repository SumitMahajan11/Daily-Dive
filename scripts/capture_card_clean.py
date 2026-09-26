import os
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.abspath(r'C:\Users\SUMIT\.gemini\antigravity-ide\brain\07982283-117c-4e55-9142-5d40ce7542d3\screenshots_phase3')
os.makedirs(OUTPUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 1000})
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(1500)

    # Click spin button
    spin_btn = page.locator("button:has-text('Spin Roulette')").nth(1)
    spin_btn.click()
    print("Clicked spin, waiting 5.5s for spin and confetti to fully settle...", flush=True)
    page.wait_for_timeout(5500)

    # Screenshot the specific topic card container
    card = page.locator(".journal-card").first
    if card.is_visible():
        card.screenshot(path=os.path.join(OUTPUT_DIR, "08_topic_card_element.png"))
        print("Saved 08_topic_card_element.png", flush=True)
    else:
        print("Card element not visible, checking page text...")
        page.screenshot(path=os.path.join(OUTPUT_DIR, "08_page_viewport.png"))

    browser.close()
    print("Done!", flush=True)
