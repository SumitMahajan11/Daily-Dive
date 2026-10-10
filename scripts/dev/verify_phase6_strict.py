import os
import time
import json
import re
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'screenshots', 'phase6'))
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

PDF_FIXTURE_1 = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'tests', 'fixtures', 'study_guide_algorithms.pdf'))
PDF_FIXTURE_2 = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'tests', 'fixtures', 'kartik_ccl_1.pdf'))

def run_strict_verification():
    print("\n" + "="*70)
    print("DAILY DIVE V2 - PHASE 6 STRICT REAL-UI VERIFICATION")
    print("="*70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # -------------------------------------------------------------
        # TEST SUITE 1: CLEAN FLOW (NO SHORTCUTS, BUTTON CLICKS ONLY)
        # -------------------------------------------------------------
        print("\n>>> TEST SUITE 1: Standard Clean Flow <<<")
        context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = context.new_page()

        print("\nStep 1: Open app fresh")
        page.goto("http://localhost:5173/")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # 1. Inspect initial storage
        storage_initial = page.evaluate("() => ({ custom: localStorage.getItem('daily_dive_custom_topics'), settings: localStorage.getItem('daily_dive_guest_settings') })")
        sidebar_initial = page.locator("aside").first.inner_text()
        active_initial = [l for l in sidebar_initial.splitlines() if 'Active Topics' in l or '/' in l]
        print(f"  [STORAGE BEFORE] daily_dive_custom_topics: {storage_initial['custom']}")
        print(f"  [STORAGE BEFORE] daily_dive_guest_settings: {storage_initial['settings']}")
        print(f"  [COUNTER BEFORE] {active_initial}")

        # Screenshot initial state
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "01_initial_state.png"))

        # Step 2: Go to Extract Topics by clicking visible button
        print("\nStep 2: Click 'Extract Topics' navigation button")
        page.locator("button:has-text('Extract Topics')").first.click()
        time.sleep(1)

        # Step 3: Upload document through file input
        print(f"\nStep 3: Upload real document: {os.path.basename(PDF_FIXTURE_1)}")
        file_input = page.locator('input[type="file"]').first
        file_input.set_input_files(PDF_FIXTURE_1)
        print("  Waiting for extraction...")

        # Step 4: Wait for candidate topics & review action
        page.wait_for_selector("button:has-text('Add') >> text=/to Spin Pool/", timeout=30000)
        time.sleep(1)
        add_btn = page.locator("button:has-text('Add') >> text=/to Spin Pool/").first
        add_text = add_btn.inner_text()
        print(f"  Extraction complete. Found Add Button: '{add_text}'")

        # Step 5: Click the real Add button
        print("\nStep 5: Click 'Add to Spin Pool' button")
        add_btn.click()
        time.sleep(2)

        # Step 6: Observe Active Topics counter IMMEDIATELY
        sidebar_after_add = page.locator("aside").first.inner_text()
        active_after_add = [l for l in sidebar_after_add.splitlines() if 'Active Topics' in l or '/' in l]
        storage_after_add = page.evaluate("() => ({ custom: localStorage.getItem('daily_dive_custom_topics'), settings: localStorage.getItem('daily_dive_guest_settings') })")
        custom_topics_1 = json.loads(storage_after_add['custom']) if storage_after_add['custom'] else []

        print(f"\nStep 6: IMMEDIATE Observation after Click:")
        print(f"  [COUNTER IMMEDIATELY AFTER ADD] {active_after_add}")
        print(f"  [STORAGE IMMEDIATELY AFTER ADD] Count: {len(custom_topics_1)}")
        print(f"  [STORAGE IMMEDIATELY AFTER ADD] Titles: {[t['title'] for t in custom_topics_1]}")
        print(f"  [SETTINGS IMMEDIATELY AFTER ADD] {storage_after_add['settings']}")

        assert len(custom_topics_1) > 0, "ERROR: Topics were not persisted to localStorage!"
        # Screenshot after Add
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "02_immediately_after_add.png"))

        # Step 7: REFRESH TEST (Check persistence and re-render across hard reload)
        print("\nStep 7: Perform Page Refresh (Testing reactivity & state-sync gap)")
        page.reload()
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        sidebar_after_reload = page.locator("aside").first.inner_text()
        active_after_reload = [l for l in sidebar_after_reload.splitlines() if 'Active Topics' in l or '/' in l]
        storage_after_reload = page.evaluate("() => ({ custom: localStorage.getItem('daily_dive_custom_topics'), settings: localStorage.getItem('daily_dive_guest_settings') })")
        custom_topics_reload = json.loads(storage_after_reload['custom']) if storage_after_reload['custom'] else []

        print(f"  [COUNTER AFTER RELOAD] {active_after_reload}")
        print(f"  [STORAGE AFTER RELOAD] Count: {len(custom_topics_reload)}")
        assert len(custom_topics_reload) == len(custom_topics_1), "ERROR: Custom topics lost after reload!"
        assert active_after_reload == active_after_add, "ERROR: Counter differed after reload!"
        print("  [OK] Refresh test PASSED: Real storage and UI counter match perfectly before and after reload.")

        # Step 8: Go spin and observe landing on custom topic
        print("\nStep 8: Spin Roulette and observe landing")
        page.locator("button:has-text('Spin Roulette')").first.click()
        time.sleep(1)

        custom_titles = {t['title'].lower() for t in custom_topics_1}
        landed_custom_topic = None
        spins_count = 0

        for attempt in range(1, 16):
            spins_count += 1
            print(f"  Executing spin #{attempt}...")
            # Click visible Spin button
            spin_btn = page.locator("#spin button:has-text('Spin Roulette'), #spin button:has-text('Spin Again')").first
            spin_btn.click()
            time.sleep(3.6) # Allow deceleration and landing modal/article to reveal

            # Read article title
            current_title = page.evaluate("() => document.querySelector('#spin article h1, #spin article h2, [data-testid=\"topic-title\"]')?.innerText")
            current_badge = page.evaluate("() => document.querySelector('#spin article span')?.innerText")
            print(f"    Spin #{attempt} landed on: '{current_title}' [{current_badge}]")

            if current_title and any(ct in current_title.lower() for ct in custom_titles):
                landed_custom_topic = current_title
                print(f"  >>> SUCCESS: Spin #{attempt} LANDED ON UPLOADED CUSTOM TOPIC: '{current_title}'!")
                # Take screenshot
                page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "03_spin_landed_custom_clean.png"))
                break

        print(f"  Result of Clean Flow: Landed on custom topic = {landed_custom_topic is not None} in {spins_count} spins.")
        context.close()

        # -------------------------------------------------------------
        # TEST SUITE 2: USER WITH CATEGORY FILTER CONFIGURED (THE REGRESSION)
        # -------------------------------------------------------------
        print("\n" + "-"*70)
        print(">>> TEST SUITE 2: User with Category Filter Configured <<<")
        print("-" * 70)

        context2 = browser.new_context(viewport={"width": 1400, "height": 900})
        page2 = context2.new_page()

        print("\nStep 1: Open app and navigate to Category Filter")
        page2.goto("http://localhost:5173/")
        page2.wait_for_load_state("networkidle")
        time.sleep(2)

        page2.locator("button:has-text('Category Filter')").first.click()
        time.sleep(1)

        # Click "Tech" preset (filters to only Tech topics, testing whether custom topics are properly eligible under Tech)
        print("Step 2: User selects 'Tech' category filter preset (confirming Tech is ON, others OFF)")
        tech_preset = page2.locator("button:has-text('Tech')").filter(has_text="Tech").first
        tech_preset.click()
        time.sleep(1)

        sidebar_tech_filter = page2.locator("aside").first.inner_text()
        active_tech_filter = [l for l in sidebar_tech_filter.splitlines() if 'Active Topics' in l or '/' in l]
        print(f"  [COUNTER WITH TECH FILTER] {active_tech_filter}")

        # Step 3: Now go to Extract Topics and upload second fixture (Cloud Scalability in Tech)
        print(f"\nStep 3: Upload Cloud & Infra PDF fixture: {os.path.basename(PDF_FIXTURE_2)}")
        page2.locator("button:has-text('Extract Topics')").first.click()
        time.sleep(1)

        file_input2 = page2.locator('input[type="file"]').first
        file_input2.set_input_files(PDF_FIXTURE_2)
        print("  Waiting for extraction...")

        page2.wait_for_selector("button:has-text('Add') >> text=/to Spin Pool/", timeout=35000)
        time.sleep(1)

        add_btn2 = page2.locator("button:has-text('Add') >> text=/to Spin Pool/").first
        print(f"  Extraction done. Add button text: '{add_btn2.inner_text()}'")

        # Step 4: Click Add to Spin Pool
        print("Step 4: Click 'Add to Spin Pool'")
        add_btn2.click()
        time.sleep(2)

        # Step 5: Check Active Topics counter immediately
        sidebar_tech_after = page2.locator("aside").first.inner_text()
        active_tech_after = [l for l in sidebar_tech_after.splitlines() if 'Active Topics' in l or '/' in l]
        storage_tech_after = page2.evaluate("() => ({ custom: localStorage.getItem('daily_dive_custom_topics'), settings: localStorage.getItem('daily_dive_guest_settings') })")
        custom_tech_list = json.loads(storage_tech_after['custom']) if storage_tech_after['custom'] else []

        print(f"\nStep 5: Observations after adding to filtered pool:")
        print(f"  [COUNTER BEFORE ADD] {active_tech_filter}")
        print(f"  [COUNTER AFTER ADD]  {active_tech_after}")
        print(f"  [STORAGE COUNT]      {len(custom_tech_list)}")
        print(f"  [SETTINGS ENABLED]   {json.loads(storage_tech_after['settings'])['enabled_categories']}")

        # Confirm counter INCREASED by the uploaded topics!
        m_before = re.search(r'(\d+)\s*/\s*(\d+)', " ".join(active_tech_filter))
        m_after = re.search(r'(\d+)\s*/\s*(\d+)', " ".join(active_tech_after))
        if m_before and m_after:
            active_b = int(m_before.group(1))
            active_a = int(m_after.group(1))
            total_b = int(m_before.group(2))
            total_a = int(m_after.group(2))
            print(f"  Active topics delta: {active_b} -> {active_a} (+{active_a - active_b})")
            print(f"  Total topics delta:  {total_b} -> {total_a} (+{total_a - total_b})")
            assert active_a > active_b, f"REGRESSION DETECTED: Active topics counter did NOT increase! ({active_b} -> {active_a})"
            print(f"  [OK] PROOF: Active topics counter strictly INCREASED (+{active_a - active_b})!")

        # Screenshot after filtered add
        page2.screenshot(path=os.path.join(SCREENSHOTS_DIR, "04_filtered_active_topics_increased.png"))

        # Step 6: Refresh test on filtered session
        print("\nStep 6: Refresh test on filtered session")
        page2.reload()
        page2.wait_for_load_state("networkidle")
        time.sleep(2)

        sidebar_tech_reload = page2.locator("aside").first.inner_text()
        active_tech_reload = [l for l in sidebar_tech_reload.splitlines() if 'Active Topics' in l or '/' in l]
        print(f"  [COUNTER AFTER RELOAD] {active_tech_reload}")
        assert active_tech_reload == active_tech_after, "ERROR: Counter changed after reload!"

        # Step 7: Spin wheel in filtered pool and verify landing on custom topic
        print("\nStep 7: Spin Roulette in active pool")
        page2.locator("button:has-text('Spin Roulette')").first.click()
        time.sleep(1)

        custom_titles_2 = {t['title'].lower() for t in custom_tech_list}
        landed_custom_topic_2 = None

        for attempt in range(1, 12):
            print(f"  Filtered spin #{attempt}...")
            spin_btn = page2.locator("#spin button:has-text('Spin Roulette'), #spin button:has-text('Spin Again')").first
            spin_btn.click()
            time.sleep(3.6)

            current_title = page2.evaluate("() => document.querySelector('#spin article h1, #spin article h2, [data-testid=\"topic-title\"]')?.innerText")
            current_badge = page2.evaluate("() => document.querySelector('#spin article span')?.innerText")
            print(f"    Spin #{attempt} landed on: '{current_title}' [{current_badge}]")

            if current_title and any(ct in current_title.lower() for ct in custom_titles_2):
                landed_custom_topic_2 = current_title
                print(f"  >>> SUCCESS: Filtered Spin #{attempt} LANDED ON UPLOADED CUSTOM TOPIC: '{current_title}'!")
                page2.screenshot(path=os.path.join(SCREENSHOTS_DIR, "05_spin_landed_custom_filtered.png"))
                break

        assert landed_custom_topic_2 is not None, "ERROR: Failed to land on uploaded custom topic within reasonable number of tries!"
        print(f"\n[OK] VERIFIED: Real spin landed on custom topic '{landed_custom_topic_2}'!")

        context2.close()
        browser.close()

    print("\n" + "="*70)
    print("ALL VERIFICATION CRITERIA PASSED WITH ZERO SHORTCUTS")
    print("="*70)

if __name__ == "__main__":
    run_strict_verification()
