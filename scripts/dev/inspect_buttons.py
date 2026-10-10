import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def inspect_spin_screen():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.add_init_script("""
            localStorage.setItem('daily_dive_first_run_dismissed', 'true');
        """)
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(600)

        buttons = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('button')).map(b => ({
                text: b.innerText,
                testid: b.getAttribute('data-testid'),
                className: b.className
            }));
        }""")
        print("Buttons found on page:")
        for btn in buttons:
            print(" -", btn)
        browser.close()

if __name__ == '__main__':
    inspect_spin_screen()
