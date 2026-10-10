import os
import shutil
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\SUMIT\.gemini\antigravity-ide\brain\c2c30b95-856e-4b15-a55b-b571bbf91e66"
AFTER_DIR = os.path.join("screenshots", "phase8", "after")
AFTER_ARTIFACT_DIR = os.path.join(ARTIFACT_DIR, "screenshots_phase8_after")

def test_extract_and_review_flow():
    print("=== TESTING EXTRACTION & LIFECYCLE REVIEW END-TO-END ===", flush=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 950})
        context.add_init_script("""
            localStorage.setItem('daily-dive-theme', 'dark');
            localStorage.setItem('daily_dive_category_detail_view', 'true');
        """)
        page = context.new_page()
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]:", msg.text))
        page.on("pageerror", lambda err: print("PAGE ERROR:", err))

        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1)

        # Scroll to Extract Section
        page.locator('#extract').scroll_into_view_if_needed()
        time.sleep(0.5)

        pptx_path = os.path.abspath(os.path.join("tests", "fixtures", "lecture_systems.pptx"))

        # Set file input inside extract section
        file_input = page.locator('#extract input[type="file"]')
        file_input.set_input_files(pptx_path)

        # Wait for candidate review state
        page.wait_for_selector('text=Review Extracted Topics', timeout=15000)
        time.sleep(1)

        # Verify candidate review screen opened with the bespoke Manuscript intake styling
        review_title = page.locator("text=Review Extracted Topics").is_visible()
        print(f"Review screen visible: {review_title}", flush=True)
        assert review_title, "FAILED: Candidate review screen did not appear after file extraction!"

        # Verify batch retention policy switcher exists on review screen
        batch_temp = page.locator("text=Temporary (14d Expiry)").is_visible()
        batch_perm = page.locator("text=Permanent Collection").is_visible()
        print(f"Batch Retention Policy buttons visible: Temp={batch_temp}, Perm={batch_perm}", flush=True)
        assert batch_temp and batch_perm, "FAILED: Batch Retention Policy buttons missing from Candidate Review!"

        # Capture screenshot of Candidate Review screen
        review_shot = os.path.join(AFTER_DIR, "desktop-dark-extract-review.png")
        page.screenshot(path=review_shot, full_page=False)
        shutil.copy(review_shot, os.path.join(AFTER_ARTIFACT_DIR, "desktop-dark-extract-review.png"))
        print(f"Captured {review_shot}", flush=True)

        # Click 'Add Topics to Spin Pool'
        add_btn = page.locator("button:has-text('to Spin Pool')").first
        add_btn.click()
        time.sleep(1.2)

        # Check confirmation message
        confirmed = page.locator("text=added to your active spin pool!").is_visible()
        print(f"Confirmation banner visible: {confirmed}", flush=True)
        assert confirmed, "FAILED: Confirmation banner not visible after adding to pool!"

        # Scroll to Category Filter to verify they were added into the Custom Uploads group
        page.locator('#filter').scroll_into_view_if_needed()
        time.sleep(0.8)

        # Verify Custom Uploads in localStorage
        custom_topics = page.evaluate("() => JSON.parse(localStorage.getItem('daily_dive_custom_topics') || '[]')")
        print(f"Extracted {len(custom_topics)} topics into Custom Uploads", flush=True)
        assert len(custom_topics) > 0, "FAILED: No topics added to daily_dive_custom_topics!"
        for ct in custom_topics:
            assert ct["group_name"] == "custom", f"FAILED: Expected group_name 'custom', got {ct['group_name']}"
            assert ct["lifecycle"] in ["temporary", "permanent"], f"FAILED: Invalid lifecycle {ct['lifecycle']}"
            if ct["lifecycle"] == "temporary":
                assert ct.get("expires_at") is not None, "FAILED: Temporary topic missing expires_at!"
        
        sample_topic = custom_topics[0]
        print(f"Verified sample custom topic: '{sample_topic['title']}' | group: {sample_topic['group_name']} | lifecycle: {sample_topic['lifecycle']} | expires: {sample_topic.get('expires_at')}", flush=True)

        # Verify it appears in the Temporary Intake or Permanent Collection section of FilterScreen
        has_custom_topic = page.locator(f"text={sample_topic['title']}").first.is_visible()
        print(f"Topic '{sample_topic['title']}' visible in FilterScreen: {has_custom_topic}", flush=True)
        assert has_custom_topic, f"FAILED: Topic {sample_topic['title']} not visible in FilterScreen!"

        context.close()
        browser.close()
    print("=== EXTRACTION & LIFECYCLE REVIEW TEST PASSED SUCCESSFULLY ===", flush=True)

if __name__ == "__main__":
    test_extract_and_review_flow()
