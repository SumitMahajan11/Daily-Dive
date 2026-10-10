import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

AXE_CDN_URL = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.4/axe.min.js"

def inspect_nodes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.add_init_script("localStorage.setItem('daily_dive_theme', 'dark'); localStorage.setItem('daily_dive_first_run_dismissed', 'true');")
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(600)
        page.add_script_tag(url=AXE_CDN_URL)
        page.wait_for_timeout(300)

        results = page.evaluate("""async () => {
            const r = await axe.run(document, { runOnly: ['color-contrast'] });
            return r.violations.map(v => ({
                id: v.id,
                help: v.help,
                nodes: v.nodes.map(n => ({
                    html: n.html,
                    target: n.target,
                    summary: n.failureSummary
                }))
            }));
        }""")

        print("=== COLOR CONTRAST VIOLATIONS ON DARK THEME ===")
        for v in results:
            for n in v['nodes']:
                print(f"Target: {n['target']}")
                print(f"HTML: {n['html']}")
                print(f"Summary: {n['summary']}\n")

        # Now test light theme
        page.evaluate("() => { localStorage.setItem('daily_dive_theme', 'light'); location.reload(); }")
        page.wait_for_timeout(600)
        page.add_script_tag(url=AXE_CDN_URL)
        page.wait_for_timeout(300)

        results_light = page.evaluate("""async () => {
            const r = await axe.run(document, { runOnly: ['color-contrast'] });
            return r.violations.map(v => ({
                id: v.id,
                help: v.help,
                nodes: v.nodes.map(n => ({
                    html: n.html,
                    target: n.target,
                    summary: n.failureSummary
                }))
            }));
        }""")

        print("=== COLOR CONTRAST VIOLATIONS ON LIGHT THEME ===")
        for v in results_light:
            for n in v['nodes']:
                print(f"Target: {n['target']}")
                print(f"HTML: {n['html']}")
                print(f"Summary: {n['summary']}\n")

        browser.close()

if __name__ == '__main__':
    inspect_nodes()
