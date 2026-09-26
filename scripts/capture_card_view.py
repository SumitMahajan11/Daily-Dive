import os
import sys
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.abspath(r'C:\Users\SUMIT\.gemini\antigravity-ide\brain\07982283-117c-4e55-9142-5d40ce7542d3\screenshots_phase3')
os.makedirs(OUTPUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(1500)

    # Click the second 'Spin Roulette' button (the dial action button)
    spin_btns = page.locator("button:has-text('Spin Roulette')").all()
    print(f"Found {len(spin_btns)} spin buttons", flush=True)
    if len(spin_btns) >= 2:
        spin_btns[1].click()
    else:
        spin_btns[0].click()

    print("Spinning... waiting 4 seconds...", flush=True)
    page.wait_for_timeout(4000)

    # Scroll down so the card is centered in viewport
    page.mouse.wheel(0, 400)
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "04_landed_topic_card.png"))
    print("Saved 04_landed_topic_card.png", flush=True)

    # Now navigate to filter and scroll to bottom to show all 4 groups
    nav_filter = page.locator("button:has-text('Category Filter')").first
    nav_filter.click()
    page.wait_for_timeout(1000)
    page.mouse.wheel(0, 500)
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "05_filter_world_ideas_group.png"))
    print("Saved 05_filter_world_ideas_group.png", flush=True)

    browser.close()
    print("Done!", flush=True)
