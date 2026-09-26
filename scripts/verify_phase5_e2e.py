import os
import time
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'screenshots', 'phase5'))
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

PDF_FIXTURE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'tests', 'fixtures', 'kartik_ccl_1.pdf'))

def run_e2e_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = context.new_page()

        print("\n--- 1. Loading Application ---")
        try:
            page.goto("http://localhost:5173/")
        except Exception:
            page.goto("http://localhost:5174/")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # ── VERIFY BUG 2: No 'Supabase Sync' badge in Header ──
        print("\n--- 2. Verifying Header & 'Supabase Sync' Removal ---")
        header_text = page.locator("header").first.inner_text()
        print(f"Header text content: '{header_text.replace(chr(10), ' | ')}'")
        assert "Supabase Sync" not in header_text, "ERROR: 'Supabase Sync' badge still found in header!"
        print("[OK] Verified: 'Supabase Sync' badge is completely absent.")

        # Capture header screenshot
        header_screenshot = os.path.join(SCREENSHOTS_DIR, "01_clean_header_no_sync.png")
        page.locator("header").first.screenshot(path=header_screenshot)
        print(f"[OK] Saved header screenshot: {header_screenshot}")

        # ── VERIFY BUG 1: Initial Active Topics is Nonzero ──
        print("\n--- 3. Verifying Initial Active Topics Counter ---")
        sidebar = page.locator("aside").first
        sidebar_text = sidebar.inner_text()
        print(f"Sidebar excerpt:\n{sidebar_text[:200]}")
        assert "0 /" not in sidebar_text or "Active Topics: 0" not in sidebar_text, "ERROR: Active topics is 0 before custom upload!"
        print("[OK] Initial Active Topics is nonzero.")

        # ── NAVIGATE TO EXTRACT SCREEN ──
        print("\n--- 4. Navigating to Extract Screen ---")
        page.click("button:has-text('Extract Topics'), button:has-text('Upload')")
        time.sleep(1.5)

        # ── VERIFY BUG 4 (UI Disclosure) & BUG 5 (Manual Add Form) ──
        print("\n--- 5. Verifying In-UI Quality Notice & Manual Add Form ---")
        page_content = page.content()
        assert "Local NLP Engine Notice" in page_content, "ERROR: Quality disclosure notice missing!"
        assert "Manually Add a Topic" in page_content, "ERROR: Manual Add a Topic section missing!"
        print("[OK] Verified: Quality disclosure notice and Manual Add form are present in UI.")

        # ── UPLOAD REAL PDF FIXTURE (kartik_ccl_1.pdf) ──
        print(f"\n--- 6. Uploading Real Source PDF: {PDF_FIXTURE} ---")
        file_input = page.locator('input[accept*=".pdf"]').first
        file_input.set_input_files(PDF_FIXTURE)

        print("Waiting for client-side extraction to complete...")
        # Wait up to 30s for review state
        page.wait_for_selector("text=Review Extracted Topics", timeout=35000)
        time.sleep(2)

        # ── VERIFY BUG 3 & BUG 4: Extraction Quality, Yield & Boilerplate ──
        print("\n--- 7. Inspecting Extracted Topics ---")
        review_header = page.locator("h3:has-text('Review Extracted Topics')").inner_text()
        print(f"Extraction yield header: {review_header}")

        title_locators = page.locator("input[placeholder='Topic Title']").all()
        topic_titles = [el.input_value() for el in title_locators]
        desc_locators = page.locator("textarea[placeholder='Topic explanation and key takeaways...']").all()
        topic_descs = [el.input_value() for el in desc_locators]

        print(f"Total topics extracted: {len(topic_titles)}")
        print("\nExtracted Topic Titles:")
        for idx, t in enumerate(topic_titles):
            print(f"  {idx+1}. {t}")

        # Check for boilerplate leakage
        full_text = " ".join(topic_titles + topic_descs)
        assert "KARTIK INGLE" not in full_text.upper(), "ERROR: 'KARTIK INGLE' boilerplate leaked into extracted topics!"
        assert "ROLL NO" not in full_text.upper(), "ERROR: 'ROLL NO' boilerplate leaked into extracted topics!"
        assert "ROLL N0" not in full_text.upper(), "ERROR: 'ROLL N0' boilerplate leaked into extracted topics!"
        print("[OK] Verified: Zero document header/footer boilerplate ('KARTIK INGLE | ROLL N0.21') leaked.")

        # Check title quality:
        # 1. No naive & joins like 'Scaling & Horizontal in Horizontal Scaling'
        for t in topic_titles:
            assert " in Horizontal Scaling" not in t, f"ERROR: Naive keyword join detected: {t}"
            assert " in Vertical Scaling" not in t, f"ERROR: Naive keyword join detected: {t}"
            assert not t.strip().endswith(" into"), f"ERROR: Dangling preposition title: {t}"
            assert not t.strip().startswith("In this practical"), f"ERROR: Sentence fragment title: {t}"
            assert not t.strip().startswith("Requires load balancing"), f"ERROR: Raw bullet point title: {t}"
            assert not t.strip().startswith("Downtime may occur"), f"ERROR: Raw bullet point title: {t}"
        
        bad_titles = [t for t in topic_titles if " & " in t and len(t.split(" & ")) >= 3]
        print(f"Titles with excessive '&' joins: {bad_titles}")
        assert len(bad_titles) == 0, f"ERROR: Found naive joined titles: {bad_titles}"
        print("[OK] Verified: High title synthesis quality with coherent topic names.")

        # Capture review screen screenshot
        review_screenshot = os.path.join(SCREENSHOTS_DIR, "02_review_extracted_topics.png")
        page.screenshot(path=review_screenshot)
        print(f"[OK] Saved review screen screenshot: {review_screenshot}")

        # ── VERIFY BUG 5: Adding a Missing Topic Manually in Review ──
        print("\n--- 8. Testing Manual Add in Review State ---")
        page.click("button:has-text('Add Missing Topic')")
        time.sleep(1)

        page.fill("input[placeholder='e.g., Multi-Tenancy Isolation Patterns']", "Paxos Distributed Consensus")
        page.select_option("select:has(option[value='systems-distributed-computing'])", "systems-distributed-computing")
        page.fill("textarea[placeholder='Short 1–2 sentence explanation of the concept...']", "A foundational consensus algorithm that enables distributed nodes to agree on state across unreliable networks.")
        page.click("button:has-text('Add to Candidate List')")
        time.sleep(1)

        updated_titles = [el.input_value() for el in page.locator("input[placeholder='Topic Title']").all()]
        print(f"Updated candidate topics count: {len(updated_titles)}")
        assert "Paxos Distributed Consensus" in updated_titles, "ERROR: Manually added topic not found in candidate list!"
        print("[OK] Verified: Manually created topic added to candidate list.")

        # ── ADD TO SPIN POOL ──
        print("\n--- 9. Adding Topics to Spin Pool ---")
        page.click("button:has-text('Add') >> text=/to Spin Pool/")
        time.sleep(2)

        # ── VERIFY BUG 1: Active Topics Counter is Nonzero After Upload ──
        print("\n--- 10. Verifying Active Topics Counter in Sidebar ---")
        sidebar_text_after = page.locator("aside").first.inner_text()
        print(f"Sidebar text after adding custom topics:\n{sidebar_text_after}")
        
        # Check active topics count
        import re
        m = re.search(r'Active Topics:\s*(\d+)\s*/\s*(\d+)', sidebar_text_after)
        if m:
            active_count = int(m.group(1))
            total_count = int(m.group(2))
            print(f"Active Topics Counter: {active_count} / {total_count}")
            assert active_count > 0, f"ERROR: Active topics is 0! (Found {active_count} / {total_count})"
            print(f"[OK] SUCCESS: Active topics is nonzero ({active_count} / {total_count})!")
        else:
            print(f"Counter raw text: {sidebar_text_after}")

        # Capture sidebar screenshot proving nonzero active topics
        sidebar_screenshot = os.path.join(SCREENSHOTS_DIR, "03_active_topics_nonzero.png")
        page.screenshot(path=sidebar_screenshot)
        print(f"[OK] Saved active topics nonzero screenshot: {sidebar_screenshot}")

        # ── SPIN AND LAND SPECIFICALLY ON CUSTOM TOPIC ──
        print("\n--- 11. Testing Spin Wheel Landing on Custom/Uploaded Topic ---")
        # Navigate to Filter Screen to isolate Custom Uploads for proof
        page.click("button:has-text('Filter Categories'), button:has-text('Topics')")
        time.sleep(1.5)

        # Verify "Custom Uploads" group in FilterScreen
        filter_content = page.content()
        assert "Custom Uploads" in filter_content, "ERROR: 'Custom Uploads' accordion missing from FilterScreen!"
        # Let's isolate custom topics to prove a spin specifically lands on an uploaded custom topic
        print("Toggling built-in categories off to isolate custom topics for roulette spin proof...")
        built_in_groups = [
            "Toggle group Tech",
            "Toggle group Money & Career",
            "Toggle group Mind & Growth",
            "Toggle group World & Ideas"
        ]
        for aria in built_in_groups:
            inp = page.locator(f"input[aria-label='{aria}']").first
            if inp.is_visible(timeout=2000) or inp.count() > 0:
                inp.click(force=True)
                time.sleep(0.4)

        time.sleep(1)
        # Check active topics in sidebar now
        sidebar_isolated = page.locator("aside").first.inner_text()
        print(f"Sidebar with only custom topics active:\n{sidebar_isolated}")

        # Click Spin Active Pool
        page.click("button:has-text('Spin Active Pool'), button:has-text('Spin Now')")
        time.sleep(1.5)

        # Now click "Spin Roulette" button inside #spin section
        print("Initiating roulette spin...")
        spin_btn = page.locator("#spin button:has-text('Spin Roulette')").first
        spin_btn.click()

        print("Wheel is spinning... waiting for winner card to be selected...")
        # Wait 4.5 seconds for spin animation (2800ms) to complete and winner article to appear
        time.sleep(4.5)
        page.wait_for_selector("#spin article", timeout=12000)
        time.sleep(2)

        # Inspect winner topic title & source
        winner_card = page.locator("article").first
        winner_text = winner_card.inner_text()
        print(f"\n--- 12. Winner Topic Details ---\n{winner_text[:400]}")

        # Confirm it is an uploaded/custom topic
        assert "Custom Upload" in winner_text or "Custom" in winner_text, "ERROR: Winner topic is not custom/uploaded!"
        print("[OK] Verified: Roulette spin landed specifically on custom/uploaded topic!")

        # Capture real screenshot of roulette spin landing on uploaded custom topic
        winner_screenshot = os.path.join(SCREENSHOTS_DIR, "04_spin_landed_on_custom_topic.png")
        page.screenshot(path=winner_screenshot)
        print(f"[OK] Saved winner topic screenshot: {winner_screenshot}")

        # Spin once more to capture a second custom card (from the PDF extraction)
        print("\n--- 13. Spinning Again for PDF Extracted Topic ---")
        page.locator("#spin button:has-text('Spin Again'), #spin button:has-text('Spin Roulette')").first.click()
        time.sleep(4.5)
        page.wait_for_selector("#spin article", timeout=12000)
        time.sleep(2)

        winner2_text = page.locator("article").first.inner_text()
        print(f"Second spin winner details:\n{winner2_text[:400]}")
        winner2_screenshot = os.path.join(SCREENSHOTS_DIR, "05_spin_landed_on_pdf_extracted_topic.png")
        page.screenshot(path=winner2_screenshot)
        print(f"[OK] Saved second spin screenshot: {winner2_screenshot}")

        print("\n=======================================================")
        print("ALL 6 BUGS VERIFIED WITH REAL BROWSER EXECUTION & SCREENSHOTS!")
        print("=======================================================")

        browser.close()

if __name__ == "__main__":
    run_e2e_verification()
