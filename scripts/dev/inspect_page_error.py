import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def inspect_page_error():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on("console", lambda msg: print("CONSOLE:", msg.text))

        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(1000)

        html = page.evaluate("() => document.body.innerHTML")
        print("PAGE ERRORS:", errors)
        print("BODY HTML SNIPPET (first 500 chars):", html[:500])
        browser.close()

if __name__ == '__main__':
    inspect_page_error()
