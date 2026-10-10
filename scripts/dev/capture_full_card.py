import os
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.abspath(r'C:\Users\SUMIT\.gemini\antigravity-ide\brain\07982283-117c-4e55-9142-5d40ce7542d3\screenshots_phase3')
os.makedirs(OUTPUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(1500)

    # Click the wheel spin button directly
    page.keyboard.press("Space")
    print("Pressed space to spin...")
    page.wait_for_timeout(3800)

    # Full page screenshot of spun topic card
    page.screenshot(path=os.path.join(OUTPUT_DIR, "04_full_card_result.png"), full_page=True)
    print("Saved 04_full_card_result.png")

    # Filter screen scrolled down to show all 4 groups
    filter_tab = page.locator("button:has-text('Category Filter')").first
    filter_tab.click()
    page.wait_for_timeout(1000)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "05_filter_all_groups_full.png"), full_page=True)
    print("Saved 05_filter_all_groups_full.png")

    browser.close()
    print("Full screenshots captured!")
