import os
import json
import time
from playwright.sync_api import sync_playwright

results = {}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 1000})
    page.on("console", lambda m: print("CONSOLE:", m.text, flush=True))
    
    def test_fixture_upload(label, file_path):
        print(f"\n=======================================================", flush=True)
        print(f"Testing {label}: {file_path} ({os.path.getsize(file_path)} bytes)", flush=True)
        print(f"=======================================================", flush=True)
        page.goto('http://localhost:5173')
        
        file_input = page.locator('#extract input[type="file"]')
        file_input.set_input_files(os.path.abspath(file_path))
        
        # Wait for review screen
        page.wait_for_selector('text=Review Extracted Topics', timeout=60000)
        
        cards = page.locator('#extract .candidate-topic-card')
        count = cards.count()
        print(f"[{label}] Successfully rendered review screen with {count} candidate cards.")
        
        topics_data = []
        for i in range(count):
            c = cards.nth(i)
            title = c.locator('input[placeholder="Topic Title"]').input_value()
            
            badge_el = c.locator('span:has-text("Verified"), span:has-text("Needs review")').first
            badge_text = badge_el.inner_text() if badge_el.is_visible() else "Unknown"
            
            # Check for reasons
            reason_el = c.locator('p:has-text("Deductions:")')
            reasons = []
            if reason_el.is_visible():
                raw_reasons = reason_el.inner_text().replace('Deductions:', '').strip()
                reasons = [r.strip() for r in raw_reasons.split('·') if r.strip()]
                
            topics_data.append({
                "index": i + 1,
                "title": title,
                "badge": badge_text,
                "reasons": reasons
            })
            print(f"  [{i+1}] \"{title}\" -> {badge_text} | Reasons: {reasons}", flush=True)
            
        return {"status": "success", "count": count, "topics": topics_data}

    # 1. Real PDF fixture
    results['pdf'] = test_fixture_upload("PDF", "tests/fixtures/Experiment no 2 cn.pdf")
    
    # 2. Real Image OCR fixture
    results['image'] = test_fixture_upload("Image OCR", "tests/fixtures/study_notes_computer_vision.png")
    
    # 3. Real Video Frame-OCR fixture
    results['video'] = test_fixture_upload("Video Frame OCR", "tests/fixtures/lecture_microservices.webm")

    # 4. Check .docx upload rejection
    dummy_docx = "tests/fixtures/temp_sample.docx"
    with open(dummy_docx, "wb") as f:
        f.write(b"PK\x03\x04dummy docx archive")
        
    print("\n=======================================================", flush=True)
    print("Testing DOCX Upload...", flush=True)
    print("=======================================================", flush=True)
    page.goto('http://localhost:5173')
    page.locator('#extract input[type="file"]').set_input_files(os.path.abspath(dummy_docx))
    page.wait_for_selector('text=Unsupported file format', timeout=10000)
    docx_msg = page.locator('text=Unsupported file format').first.inner_text()
    print("DOCX rejection confirmed:", docx_msg, flush=True)
    results['docx'] = {"status": "unsupported", "rejection_message": docx_msg}
    
    if os.path.exists(dummy_docx):
        os.remove(dummy_docx)
        
    browser.close()

with open("tests/fixtures/matrix_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("\nMatrix extraction completed successfully and saved to tests/fixtures/matrix_results.json", flush=True)
