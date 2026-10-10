import os
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.abspath(r'C:\Users\SUMIT\.gemini\antigravity-ide\brain\07982283-117c-4e55-9142-5d40ce7542d3\screenshots_phase3')
os.makedirs(OUTPUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(1500)

    # 1. Capture World & Ideas at bottom of Category Filter
    nav_filter = page.locator("button:has-text('Category Filter')").first
    nav_filter.click()
    page.wait_for_timeout(800)
    page.mouse.wheel(0, 1100)
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "06_filter_world_ideas_bottom.png"))
    print("Saved 06_filter_world_ideas_bottom.png", flush=True)

    # 2. Return to spin section and spin
    nav_spin = page.locator("button:has-text('Spin Roulette')").first
    nav_spin.click()
    page.wait_for_timeout(1000)

    # Click the spin button
    spin_btn = page.locator("section#spin button:has-text('Spin Roulette')").first
    if not spin_btn.is_visible():
        spin_btn = page.locator("button:has-text('Spin Roulette')").nth(1)
    spin_btn.click()
    print("Spinning...", flush=True)
    page.wait_for_timeout(3600)

    # Scroll down slightly inside spin section to view the topic card
    page.mouse.wheel(0, 260)
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(OUTPUT_DIR, "07_landed_card_content.png"))
    print("Saved 07_landed_card_content.png", flush=True)

    browser.close()
    print("Complete!", flush=True)
