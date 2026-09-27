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
    print("Launching Chromium for Upload -> Extract -> Review Flow Verification...", flush=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 1100})
        page = context.new_page()

        print("Navigating to app...", flush=True)
        page.goto("http://localhost:5173/", wait_until="domcontentloaded")
        page.wait_for_selector("#extract", timeout=10000)

        # Scroll to Extract section
        page.evaluate("() => document.getElementById('extract').scrollIntoView({ behavior: 'instant' })")
        page.wait_for_timeout(800)

        pptx_path = os.path.abspath("tests/fixtures/AI_ML_Climate_Adaptive_Shelter_Technical_Seminar_.pptx")
        assert os.path.exists(pptx_path), f"File not found: {pptx_path}"
        print(f"Uploading file: {pptx_path} ({os.path.getsize(pptx_path)} bytes)...", flush=True)

        # Set input files
        file_input = page.locator("#extract input[type='file']")
        file_input.set_input_files(pptx_path)

        print("Waiting for client-side extraction to complete...", flush=True)
        # Wait for Review state heading
        page.wait_for_selector("text=Review Extracted Topics", timeout=30000)
        print("Extraction complete! In 'review' state.", flush=True)
        page.wait_for_timeout(1000)

        # Inspect candidate cards
        card_elements = page.locator("#extract .candidate-topic-card")
        count = card_elements.count()
        print(f"Found {count} candidate topic cards in UI:", flush=True)

        extracted_titles = []
        for i in range(count):
            card = card_elements.nth(i)
            # Find the title input/heading
            title_el = card.locator("input[type='text'], h4, .font-display").first
            title = title_el.input_value() if title_el.evaluate("el => el.tagName === 'INPUT'") else title_el.inner_text()
            print(f"  [{i + 1}] \"{title}\"", flush=True)
            extracted_titles.append(title)

        # Verify no trailing punctuation or broken patterns in UI
        for title in extracted_titles:
            assert not title.endswith(","), f"Title has trailing comma: {title}"
            assert not title.endswith("-") and not title.endswith("–"), f"Title has trailing dash: {title}"
            assert title != "RESEARCH GAP", f"Title passed through raw ALL-CAPS: {title}"
            assert not title.lower().startswith("existing research includes"), f"Title starts with conversational fragment: {title}"
            assert not title.lower().startswith("compare random forest"), f"Title is truncated imperative fragment: {title}"

        # Capture in-app screenshot of the extract section
        extract_el = page.locator("#extract")
        scen_path = os.path.join(artifacts_dir, "upload_extract_review_flow_fixed.png")
        brain_path = os.path.join(brain_artifacts_dir, "upload_extract_review_flow_fixed.png")
        
        extract_el.screenshot(path=scen_path)
        extract_el.screenshot(path=brain_path)
        print(f"[PASS] In-app review screenshot captured successfully to:\n  - {scen_path}\n  - {brain_path}", flush=True)

        browser.close()
        print("\nALL VERIFICATION STEPS COMPLETED CLEANLY!", flush=True)

if __name__ == "__main__":
    run()
