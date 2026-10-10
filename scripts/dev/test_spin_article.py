import os
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.abspath(r'C:\Users\SUMIT\.gemini\antigravity-ide\brain\07982283-117c-4e55-9142-5d40ce7542d3\screenshots_phase3')
os.makedirs(OUTPUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(1000)

    # Wait for loadingData to finish so button is enabled
    btn = page.locator("#spin button:has-text('Spin Roulette')")
    btn.wait_for(state="visible")
    page.wait_for_timeout(2000)

    print("Clicking spin button...", flush=True)
    btn.click()

    print("Waiting for article to appear...", flush=True)
    article = page.locator("#spin article")
    article.wait_for(state="visible", timeout=8000)
    print("Article appeared!", flush=True)

    # Give animation 600ms to complete smoothly
    page.wait_for_timeout(600)
    article.screenshot(path=os.path.join(OUTPUT_DIR, "09_actual_topic_card.png"))
    print("Saved 09_actual_topic_card.png", flush=True)

    # Also capture the topic title and description text
    title = article.locator("h2").inner_text()
    desc = article.locator("p.font-serif").inner_text()
    print(f"Landed on Topic Title: {title}", flush=True)
    print(f"Topic Description: {desc}", flush=True)

    browser.close()
