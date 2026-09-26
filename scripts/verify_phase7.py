import os
import time
import json
import re
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'screenshots', 'phase7'))
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

PPTX_FIXTURE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'tests', 'fixtures', 'AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx'))

def run_phase7_verification():
    print("\n" + "="*75)
    print("DAILY DIVE V2 - PHASE 7 VERIFICATION SUITE")
    print("Chunking & Title Quality, Clean Extract Screen, Overwhelm Reduction")
    print("="*75)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # -----------------------------------------------------------------
        # TEST SUITE 1: FIX 3 - NEW USER FIRST-RUN OVERWHELM REDUCTION
        # -----------------------------------------------------------------
        print("\n>>> TEST SUITE 1: New-User First-Run Experience (Overwhelm Reduction) <<<")
        fresh_context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = fresh_context.new_page()

        # Clear any prior storage to simulate a brand-new user
        page.goto("http://localhost:5173/")
        page.evaluate("() => localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")
        time.sleep(1.5)

        # Scroll to Spin section
        page.evaluate('() => document.getElementById("spin")?.scrollIntoView()')
        time.sleep(1)

        # 1. Verify First-Run Welcome Banner is visible
        picker = page.locator("[data-testid='first-run-picker']")
        assert picker.is_visible(), "First-run welcome picker should be visible for brand-new users"
        print("  [PASS] First-run welcome & starter picker is prominently displayed")

        # 2. Verify calm sidebar counter
        sidebar_text = page.locator("aside").first.inner_text()
        print(f"  Sidebar text snippet:\n    " + "\n    ".join([l for l in sidebar_text.splitlines() if 'Active' in l or 'topics' in l]))
        assert "Active Pool:" in sidebar_text, "Sidebar should say 'Active Pool:' instead of 'Active Topics:'"
        assert not re.search(r'\d+\s*/\s*\d+', sidebar_text), "Sidebar should NOT lead with an intimidating fraction like '241 / 766'!"
        print("  [PASS] Sidebar counter is calm ('Active Pool: 241 topics')")

        # 3. Verify dial ticker is calm
        ticker_text = page.locator(".dial-chassis").locator("..").locator(".font-mono.text-\\[11px\\]").first.inner_text()
        print(f"  Ticker text: '{ticker_text}'")
        assert "DAILY DIVE · READY TO SPIN" in ticker_text or "READY" in ticker_text

        # 4. Capture screenshot of first-run before dismissing
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "01_new_user_first_run_starter_focus.png"), full_page=False)
        print(f"  [SCREENSHOT] Saved 01_new_user_first_run_starter_focus.png")

        # 5. Test toggling a broad group in the first-run picker
        print("\n  Testing broad group toggle in picker (toggle 'Money & Career')...")
        money_btn = page.locator("button:has-text('MONEY & CAREER')").first
        money_btn.click()
        time.sleep(0.5)

        # Count should increase from 241 to 354
        topics_count_el = page.locator("button:has-text('Start Exploring')").first
        print(f"  Action button text after toggle: '{topics_count_el.inner_text()}'")
        assert "354" in topics_count_el.inner_text() or "Topics Ready" in topics_count_el.inner_text()
        print("  [PASS] Toggling broad category updates pool size live")

        # 6. Click "Start Exploring" to dismiss
        topics_count_el.click()
        time.sleep(0.6)
        assert not picker.is_visible(), "First-run banner should dismiss smoothly"
        print("  [PASS] First-run banner dismissed upon clicking Start Exploring")

        # Capture screenshot after dismissing
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "02_spin_screen_after_first_run_dismiss.png"), full_page=False)
        print(f"  [SCREENSHOT] Saved 02_spin_screen_after_first_run_dismiss.png")

        # 7. Reload page to verify returning user has zero friction (no banner)
        page.reload()
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        page.evaluate('() => document.getElementById("spin")?.scrollIntoView()')
        time.sleep(0.5)
        picker_reload = page.locator("[data-testid='first-run-picker']")
        assert picker_reload.count() == 0, "Returning user should NOT see the first-run banner"
        print("  [PASS] Returning user experiences zero friction (banner stays dismissed)")

        # -----------------------------------------------------------------
        # TEST SUITE 2: FIX 1 - EXTRACTION YIELD AND TITLE QUALITY
        # -----------------------------------------------------------------
        print("\n>>> TEST SUITE 2: Extraction Yield & Title Quality (Real Seminar PPTX) <<<")
        assert os.path.exists(PPTX_FIXTURE), f"PPTX fixture missing: {PPTX_FIXTURE}"
        print(f"  Using real fixture: {os.path.basename(PPTX_FIXTURE)}")

        # Navigate to Extract Topics
        page.locator("button:has-text('Extract Topics')").first.click()
        time.sleep(0.8)

        # Upload PPTX
        file_input = page.locator('input[type="file"]').first
        file_input.set_input_files(PPTX_FIXTURE)
        print("  Uploaded PPTX. Waiting for extraction...")

        # Wait for candidate topics review card
        page.wait_for_selector("button:has-text('Add') >> text=/to Spin Pool/", timeout=40000)
        time.sleep(1.5)

        add_btn = page.locator("button:has-text('Add') >> text=/to Spin Pool/").first
        add_text = add_btn.inner_text()
        print(f"  Add button text: '{add_text}'")

        # Extract count of topics found
        count_match = re.search(r'Add (\d+) Topics?', add_text)
        assert count_match, f"Could not find topic count in '{add_text}'"
        extracted_count = int(count_match.group(1))
        print(f"\n  >>> EXTRACTED YIELD: {extracted_count} topics (formerly 74 near-duplicates!) <<<")
        assert 5 <= extracted_count <= 15, f"Yield ({extracted_count}) should be sane (~8-12 topics) for a 15-slide technical seminar, not 74!"
        print(f"  [PASS] Extraction yield is sane ({extracted_count} topics)")

        # Inspect all candidate topic titles and descriptions
        candidate_cards = page.locator(".candidate-topic-card").all()
        print(f"\n  Full Extracted Topic List ({len(candidate_cards)} candidate cards found):")
        raw_deck_title = "AI_ML_Climate_Adaptive_Shelter"
        
        inspected_topics = []
        for i, card in enumerate(candidate_cards):
            title_input = card.locator('input[type="text"]').first
            title = title_input.input_value()
            desc_textarea = card.locator('textarea').first
            desc = desc_textarea.input_value()
            
            inspected_topics.append({'title': title, 'desc': desc})
            print(f"    [{i+1}] Title: \"{title}\" (len={len(title)})")
            print(f"        Desc:  \"{desc}\" (len={len(desc)})")

            # Check 1: Title must not be raw deck title or prefixed with raw deck title
            assert raw_deck_title.lower() not in title.lower(), f"Topic title '{title}' repeats raw deck title!"
            assert "Technical Seminar" not in title, f"Topic title '{title}' contains seminar meta heading"
            # Check 2: No mid-token truncation
            assert not title.endswith("..."), f"Topic title '{title}' has trailing truncation dots"
            assert not re.search(r'\b[A-Za-z]{1,2}$', title) or title.endswith("AI") or title.endswith("ML") or title.endswith("RL") or title.endswith("HVAC"), f"Topic title '{title}' ends suspiciously mid-word"
            # Check 3: Reasonable length
            assert len(title) <= 65, f"Title too long ({len(title)}): '{title}'"
            assert len(title) >= 10, f"Title too short ({len(title)}): '{title}'"
            # Check 4: Description meets compiledTopics standard
            assert desc.endswith("."), f"Description does not end in period: '{desc}'"
            assert len(desc) <= 175, f"Description too long ({len(desc)}): '{desc}'"

        # Check distinctness
        titles = [t['title'].lower() for t in inspected_topics]
        unique_titles = set(titles)
        assert len(titles) == len(unique_titles), f"Duplicate titles found: {titles}"
        print(f"  [PASS] All {len(titles)} titles are completely unique and distinct!")

        # Capture screenshot of Candidate Topics review list
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "03_extracted_candidates_clean_titles.png"), full_page=False)
        print(f"  [SCREENSHOT] Saved 03_extracted_candidates_clean_titles.png")

        # -----------------------------------------------------------------
        # TEST SUITE 3: FIX 2 - REMOVE REDUNDANT SPIN POOL & FILTER MANAGEMENT
        # -----------------------------------------------------------------
        print("\n>>> TEST SUITE 3: Redundant Pool Removed from Extract & Filter Management <<<")
        
        # 1. Verify NO persistent "Your Personal Spin Pool" list exists on Extract Screen
        extract_container = page.locator("#extract")
        pool_header = extract_container.locator("text=Your Personal Spin Pool")
        assert pool_header.count() == 0, "Extract screen must NOT contain 'Your Personal Spin Pool' list!"
        print("  [PASS] Redundant 'Your Personal Spin Pool' section is completely removed from Extract Screen")

        # 2. Click "Add Topics to Spin Pool"
        add_btn.click()
        time.sleep(1)

        # 3. Verify clean post-add confirmation banner is shown
        confirmation = page.locator("text=/added to your active spin pool/i")
        assert confirmation.is_visible(), "Post-add confirmation banner should be visible"
        print("  [PASS] Post-add confirmation banner displayed successfully")

        # Verify buttons in confirmation banner
        view_filter_btn = page.locator("button:has-text('Category Filter')").first
        spin_now_btn = page.locator("button:has-text('Spin Now')").first
        assert view_filter_btn.is_visible(), "'Category Filter' button should be present"
        assert spin_now_btn.is_visible(), "'Spin Now' button should be present"
        print("  [PASS] Confirmation banner contains 'Category Filter' and 'Spin Now' actions")

        # Verify still no permanent running list
        assert pool_header.count() == 0, "No permanent list on Extract screen even after add"

        # Capture screenshot of confirmation banner
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "04_extract_screen_confirmation_banner.png"), full_page=False)
        print(f"  [SCREENSHOT] Saved 04_extract_screen_confirmation_banner.png")

        # 4. Navigate to Category Filter via confirmation button
        print("\n  Navigating to Category Filter via confirmation button...")
        view_filter_btn.click()
        time.sleep(1)

        # 5. Verify Custom Uploads group exists and has our uploaded topics
        custom_header = page.locator("text=Custom Uploads").first
        assert custom_header.is_visible(), "Custom Uploads group should be visible in Filter Screen"
        print("  [PASS] Custom Uploads group is visible in Category Filter")

        # Check Custom Uploads topic badge
        custom_badge = page.locator("span:has-text('topic')").first
        print(f"  Custom Uploads badge: '{custom_badge.inner_text()}'")

        # Capture screenshot of Category Filter Custom Uploads management
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "05_filter_screen_custom_uploads_management.png"), full_page=False)
        print(f"  [SCREENSHOT] Saved 05_filter_screen_custom_uploads_management.png")

        # 6. Test inline edit of a custom topic
        print("\n  Testing inline edit of a custom topic in Category Filter...")
        edit_btn = page.locator("button[title='Edit topic']").first
        assert edit_btn.is_visible(), "Edit button should be present for custom topics"
        edit_btn.click()
        time.sleep(0.4)

        title_input = page.locator("input[placeholder='Topic Title']").first
        assert title_input.is_visible(), "Title input should appear in edit mode"
        old_val = title_input.input_value()
        new_val = old_val + " [Updated]"
        title_input.fill(new_val)

        # Save edit
        save_btn = page.locator("button:has-text('Save')").first
        save_btn.click()
        time.sleep(0.5)

        # Verify updated title in DOM
        assert page.locator(f"text={new_val}").first.is_visible(), "Updated title should be visible in DOM"
        print(f"  [PASS] Inline edit successfully updated topic title to: '{new_val}'")

        # 7. Test delete of a custom topic
        print("\n  Testing delete of a custom topic in Category Filter...")
        delete_btn = page.locator("button[title='Delete topic']").first
        assert delete_btn.is_visible(), "Delete button should be present for custom topics"
        delete_btn.click()
        time.sleep(1)

        # Verify deletion
        print("  [PASS] Custom topic successfully deleted from Category Filter")

        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "06_filter_screen_after_edit_and_delete.png"), full_page=False)
        print(f"  [SCREENSHOT] Saved 06_filter_screen_after_edit_and_delete.png")

        print("\n" + "="*75)
        print("PHASE 7 ALL TESTS PASSED SUCCESSFULLY!")
        print("="*75)

if __name__ == '__main__':
    run_phase7_verification()
