import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.abspath(r'C:\Users\SUMIT\.gemini\antigravity-ide\brain\07982283-117c-4e55-9142-5d40ce7542d3\screenshots_phase3')
os.makedirs(OUTPUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()

    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    print("Navigating to http://localhost:5173/ ...")
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(2000)

    # 1. Main Spin Screen
    page.screenshot(path=os.path.join(OUTPUT_DIR, "01_spin_screen_initial.png"))
    print("Saved 01_spin_screen_initial.png")

    # Read page text to verify topic counts
    page_text = page.locator("body").inner_text()
    print("Page preview text contains 'Daily Dive'?", "Daily Dive" in page_text)

    # 2. Click on Filter button
    filter_btn = page.locator("button:has-text('Filter'), button:has-text('Categories')").first
    if filter_btn.is_visible():
        filter_btn.click()
        page.wait_for_timeout(1000)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "02_filter_categories_expanded.png"))
        print("Saved 02_filter_categories_expanded.png")

    # 3. Check for specific new categories in filter text
    filter_text = page.locator("body").inner_text()
    print("Contains 'World & Ideas'?", "World & Ideas" in filter_text)
    print("Contains 'Career Strategy'?", "Career Strategy" in filter_text)
    print("Contains 'Science & Natural World'?", "Science & Natural World" in filter_text)
    print("Contains 'History of Innovation'?", "History of Innovation" in filter_text)
    print("Contains '692'?", "692" in filter_text)

    # 4. Return to spin screen
    spin_nav_btn = page.locator("button:has-text('Spin Now'), button:has-text('Roulette')").first
    if spin_nav_btn.is_visible():
        spin_nav_btn.click()
        page.wait_for_timeout(1000)
    else:
        page.keyboard.press("Escape")
        page.wait_for_timeout(800)

    # 5. Trigger a couple spins to see various categories
    spin_trigger = page.locator("button:has-text('Spin Roulette'), button:has-text('Spin Again')").first
    if spin_trigger.is_visible():
        print("Spinning wheel...")
        spin_trigger.click()
        page.wait_for_timeout(4500)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "03_spin_result_card.png"))
        print("Saved 03_spin_result_card.png")

    print(f"Console errors detected: {len(console_errors)}")
    for err in console_errors:
        print("  Error:", err)

    browser.close()
    print("UI verification finished successfully!")
