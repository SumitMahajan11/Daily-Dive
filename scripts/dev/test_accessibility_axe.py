import os
import sys
import json
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

AXE_CDN_URL = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.4/axe.min.js"

VIEWPORTS = [
    {"name": "Desktop", "width": 1280, "height": 800},
    {"name": "Mobile", "width": 390, "height": 844}
]

THEMES = ["dark", "light"]
SECTIONS = ["spin", "library", "progress", "settings"]

def log(msg):
    print(msg, flush=True)

def run_axe_audit():
    log("================================================================")
    log("            PART D: AXE-CORE ACCESSIBILITY AUDIT                ")
    log("================================================================\n")

    total_violations = 0
    serious_critical_violations = 0
    results_summary = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for vp in VIEWPORTS:
            for theme in THEMES:
                context = browser.new_context(viewport={"width": vp["width"], "height": vp["height"]})
                page = context.new_page()

                # Seed theme
                page.add_init_script(f"""
                    localStorage.setItem('daily_dive_theme', '{theme}');
                    localStorage.setItem('daily_dive_first_run_dismissed', 'true');
                """)

                page.goto("http://localhost:5173", wait_until="networkidle")
                page.wait_for_timeout(800)

                # Inject axe-core
                page.add_script_tag(url=AXE_CDN_URL)
                page.wait_for_timeout(300)

                for section in SECTIONS:
                    log(f"Auditing Screen: [{section.upper()}] | Theme: [{theme}] | Viewport: [{vp['name']}]...")

                    # Scroll to section / navigate
                    page.evaluate(f"""(secId) => {{
                        const el = document.querySelector(`[data-section="${{secId}}"]`);
                        if (el) el.scrollIntoView();
                    }}""", section)
                    page.wait_for_timeout(400)

                    # Run axe
                    axe_results = page.evaluate("""async () => {
                        return await axe.run(document, {
                            runOnly: {
                                type: 'tag',
                                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
                            }
                        });
                    }""")

                    violations = axe_results.get("violations", [])
                    total_violations += len(violations)
                    
                    sc_violations = [v for v in violations if v.get("impact") in ["serious", "critical"]]
                    serious_critical_violations += len(sc_violations)

                    results_summary.append({
                        "section": section,
                        "theme": theme,
                        "viewport": vp["name"],
                        "violation_count": len(violations),
                        "serious_critical": len(sc_violations),
                        "violations": violations
                    })

                    if len(sc_violations) > 0:
                        log(f"  [!] Found {len(sc_violations)} serious/critical violations on {section} ({theme}, {vp['name']}):")
                        for v in sc_violations:
                            log(f"      - {v['id']}: {v['help']} (Impact: {v['impact']})")
                    else:
                        log(f"  ✓ Clean: 0 serious/critical violations on {section} ({theme}, {vp['name']})")

                context.close()

        browser.close()

    log("\n================================================================")
    log("               AXE-CORE AUDIT SUMMARY REPORT                   ")
    log("================================================================")
    log(f"Total Configurations Audited: {len(results_summary)}")
    log(f"Total Serious/Critical Violations: {serious_critical_violations}")
    
    if serious_critical_violations == 0:
        log("\n[PASS] Target Achieved: ZERO serious or critical accessibility violations across all screens, viewports, and themes!")
    else:
        log(f"\n[FAIL] Found {serious_critical_violations} serious or critical accessibility violations.")
    log("================================================================\n")

if __name__ == '__main__':
    run_axe_audit()
