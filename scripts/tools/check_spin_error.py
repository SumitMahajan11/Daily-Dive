import os
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 900})

    errors = []
    page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))
    page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}", flush=True))

    page.goto("http://localhost:5173/")
    page.wait_for_timeout(2000)

    btn = page.locator("#spin button:has-text('Spin Roulette')").first
    print("Spin button found. Clicking...", flush=True)
    btn.click()

    page.wait_for_timeout(4000)
    print("Errors logged:", errors, flush=True)
    browser.close()
