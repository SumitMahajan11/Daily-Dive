import os
import sys
from playwright.sync_api import sync_playwright

artifacts_dir = os.path.abspath("artifacts")
os.makedirs(artifacts_dir, exist_ok=True)

brain_artifacts_dir = r"C:\Users\SUMIT\.gemini\antigravity-ide\brain\00b52349-b331-438d-a048-882f25933050"
os.makedirs(brain_artifacts_dir, exist_ok=True)

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def run():
    print("Launching Chromium for Live In-App Verification of Confidence Badges & Review Gating...", flush=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 1200})
        page = context.new_page()

        print("Navigating to local dev app...", flush=True)
        page.goto("http://localhost:5173/", wait_until="domcontentloaded")
        page.wait_for_selector("#extract", timeout=10000)

        # Scroll to Extract section
        page.evaluate("() => document.getElementById('extract').scrollIntoView({ behavior: 'instant' })")
        page.wait_for_timeout(800)

        # ── Test 1: Upload Document 6 (PPTX) ──
        pptx_path = os.path.abspath("tests/fixtures/AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx")
        assert os.path.exists(pptx_path), f"File not found: {pptx_path}"
        print(f"\n[STEP 1] Uploading Document 6: {pptx_path}...", flush=True)

        file_input = page.locator("#extract input[type='file']")
        file_input.set_input_files(pptx_path)

        # Wait for Review state heading
        page.wait_for_selector("text=Review Extracted Topics", timeout=30000)
        print("Extraction complete! In 'review' state.", flush=True)
        page.wait_for_timeout(1000)

        # Check for visible "Needs review" badges
        needs_review_badges = page.locator("#extract span:has-text('Needs review')")
        needs_review_count = needs_review_badges.count()
        print(f"Found {needs_review_count} 'Needs review' badges in UI.", flush=True)
        assert needs_review_count > 0, "Expected at least one 'Needs review' badge for low-confidence candidates"

        # Check for visible "Verified" badges
        verified_badges = page.locator("#extract span:has-text('Verified')")
        verified_count = verified_badges.count()
        print(f"Found {verified_count} 'Verified' badges in UI.", flush=True)
        assert verified_count > 0, "Expected at least one 'Verified' badge"

        # Capture in-app screenshot of the extract review section showing BOTH badges
        extract_el = page.locator("#extract")
        scen1_path = os.path.join(artifacts_dir, "extract_review_confidence_badges.png")
        brain1_path = os.path.join(brain_artifacts_dir, "extract_review_confidence_badges.png")
        extract_el.screenshot(path=scen1_path)
        extract_el.screenshot(path=brain1_path)
        print(f"Screenshot 1 saved:\n  {scen1_path}\n  {brain1_path}", flush=True)

        # ── Test 2: Verify Review Gating (Cannot silently enter spin pool) ──
        print("\n[STEP 2] Verifying spin pool gating (attempting to add unconfirmed flagged topics)...", flush=True)
        add_btn = page.locator("#extract button:has-text('Add')").filter(has_text="Spin Pool")
        add_btn.click()
        page.wait_for_timeout(500)

        # Verify toast or notification warns user
        toast_el = page.locator("text=must be confirmed or edited before entering the spin pool")
        is_toast_visible = toast_el.is_visible()
        print(f"Gating Toast Alert Visible: {is_toast_visible}", flush=True)
        assert is_toast_visible, "Expected blocking toast warning that flagged topics require confirmation"

        # ── Test 3: Confirm a flagged topic ──
        print("\n[STEP 3] Testing 1-click 'Confirm' on a flagged topic...", flush=True)
        confirm_btn = page.locator("#extract button:has-text('Confirm')").first
        confirm_btn.click()
        page.wait_for_timeout(600)

        # Check that confirmed topic converted to Verified
        new_verified_count = page.locator("#extract span:has-text('Verified')").count()
        print(f"Verified badges after confirmation: {new_verified_count} (was {verified_count})", flush=True)
        assert new_verified_count > verified_count, "Expected verified badge count to increase after confirmation"

        # ── Test 4: Confirm All Remaining Flagged ──
        print("\n[STEP 4] Testing 'Confirm All Flagged' button...", flush=True)
        confirm_all_btn = page.locator("#extract button:has-text('Confirm All Flagged')")
        if confirm_all_btn.is_visible():
            confirm_all_btn.click()
            page.wait_for_timeout(600)
            remaining_unconfirmed = page.locator("#extract span:has-text('Needs review')").count()
            print(f"Remaining unconfirmed badges: {remaining_unconfirmed}", flush=True)
            assert remaining_unconfirmed == 0, "Expected 0 unconfirmed topics after Confirm All Flagged"

        # Now click Add to Spin Pool should succeed
        add_btn.click()
        page.wait_for_timeout(800)
        success_toast = page.locator("text=Added").first
        print(f"Success confirmation visible after user confirms: {success_toast.is_visible()}", flush=True)

        # ── Test 5: Upload New Document Type (Markdown) ──
        print("\n[STEP 5] Testing New Document Type: microservices_architecture_spec.md...", flush=True)
        # Scroll back to upload tray
        page.evaluate("() => document.getElementById('extract').scrollIntoView({ behavior: 'instant' })")
        page.wait_for_timeout(500)

        md_path = os.path.abspath("tests/fixtures/microservices_architecture_spec.md")
        file_input = page.locator("#extract input[type='file']")
        file_input.set_input_files(md_path)

        page.wait_for_selector("text=Review Extracted Topics", timeout=30000)
        print("Markdown extraction complete! In review state.", flush=True)
        page.wait_for_timeout(1000)

        # Inspect titles
        card_elements = page.locator("#extract .candidate-topic-card")
        md_count = card_elements.count()
        print(f"Found {md_count} topics for Markdown fixture in UI:", flush=True)
        for i in range(md_count):
            card = card_elements.nth(i)
            title_input = card.locator("input[placeholder='Topic Title']").first
            title = title_input.input_value()
            badge_text = card.locator("span:has-text('Verified'), span:has-text('Needs review')").first.inner_text()
            print(f"  [{i + 1}] \"{title}\" -> {badge_text}", flush=True)

        scen2_path = os.path.join(artifacts_dir, "extract_review_markdown_new_doc.png")
        brain2_path = os.path.join(brain_artifacts_dir, "extract_review_markdown_new_doc.png")
        extract_el.screenshot(path=scen2_path)
        extract_el.screenshot(path=brain2_path)
        print(f"Screenshot 2 saved:\n  {scen2_path}\n  {brain2_path}", flush=True)

        browser.close()
        print("\n>>> ALL IN-APP PLAYWRIGHT UI VERIFICATIONS SUCCEEDED! <<<", flush=True)

if __name__ == "__main__":
    run()
