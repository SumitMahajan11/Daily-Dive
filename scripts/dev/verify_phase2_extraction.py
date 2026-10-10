import os
import time
import json
from playwright.sync_api import sync_playwright

FIXTURES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'tests', 'fixtures'))
SCREENSHOTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'screenshots_phase2'))
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

RESULTS = {
    'formats': {},
    'error_cases': {},
    'spin_pool_verification': {}
}

def log(msg):
    print(msg, flush=True)

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 900})
        page = context.new_page()

        log("\n=== STEP 1: LOAD APP & SCROLL TO EXTRACT SECTION ===")
        page.goto('http://localhost:5173', wait_until='networkidle')
        page.wait_for_timeout(1000)

        # Scroll to extract section
        extract_section = page.locator('#extract')
        extract_section.scroll_into_view_if_needed()
        page.wait_for_timeout(600)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '01_extract_idle.png'))
        log("Captured 01_extract_idle.png")

        # -------------------------------------------------------------
        # TEST 1: PPTX EXTRACTION
        # -------------------------------------------------------------
        log("\n=== TEST 1: PPTX EXTRACTION (lecture_systems.pptx) ===")
        pptx_file = os.path.join(FIXTURES_DIR, 'lecture_systems.pptx')
        
        file_input = page.locator('#extract input[type="file"]')
        file_input.set_input_files(pptx_file)

        # Wait for review state
        page.wait_for_selector('text=Review Extracted Topics', timeout=15000)
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '02_pptx_review.png'))

        pptx_topics = []
        cards = page.locator('#extract .grid > div').all()
        for card in cards:
            title_input = card.locator('input[type="text"]').first
            desc_textarea = card.locator('textarea').first
            title = title_input.input_value() if title_input.count() > 0 else ''
            desc = desc_textarea.input_value() if desc_textarea.count() > 0 else ''
            cat = card.locator('span.font-mono.font-semibold').first.text_content() if card.locator('span.font-mono.font-semibold').count() > 0 else ''
            tags = [t.text_content().strip() for t in card.locator('.font-mono span').all() if t.text_content().strip()]
            if title:
                pptx_topics.append({'title': title, 'description': desc, 'category': cat, 'tags': tags})

        RESULTS['formats']['pptx'] = {
            'file': 'lecture_systems.pptx',
            'topic_count': len(pptx_topics),
            'topics': pptx_topics
        }
        log(f"PPTX Extracted {len(pptx_topics)} topics:")
        for t in pptx_topics:
            log(f"  - [{t['category']}] {t['title']}: {t['description']}")

        # Click "Add Topics to Spin Pool"
        add_btn = page.locator('#extract button:has-text("Add")')
        add_btn.click()
        page.wait_for_timeout(1000)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '03_after_add_pptx.png'))

        # -------------------------------------------------------------
        # TEST 2: PDF EXTRACTION
        # -------------------------------------------------------------
        log("\n=== TEST 2: PDF EXTRACTION (study_guide_algorithms.pdf) ===")
        extract_section.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        pdf_file = os.path.join(FIXTURES_DIR, 'study_guide_algorithms.pdf')
        file_input.set_input_files(pdf_file)

        page.wait_for_selector('text=Review Extracted Topics', timeout=20000)
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '04_pdf_review.png'))

        pdf_topics = []
        cards = page.locator('#extract .grid > div').all()
        for card in cards:
            title_input = card.locator('input[type="text"]').first
            desc_textarea = card.locator('textarea').first
            title = title_input.input_value() if title_input.count() > 0 else ''
            desc = desc_textarea.input_value() if desc_textarea.count() > 0 else ''
            cat = card.locator('span.font-mono.font-semibold').first.text_content() if card.locator('span.font-mono.font-semibold').count() > 0 else ''
            if title:
                pdf_topics.append({'title': title, 'description': desc, 'category': cat})

        RESULTS['formats']['pdf'] = {
            'file': 'study_guide_algorithms.pdf',
            'topic_count': len(pdf_topics),
            'topics': pdf_topics
        }
        log(f"PDF Extracted {len(pdf_topics)} topics:")
        for t in pdf_topics:
            log(f"  - [{t['category']}] {t['title']}: {t['description']}")

        page.locator('#extract button:has-text("Add")').click()
        page.wait_for_timeout(1000)

        # -------------------------------------------------------------
        # TEST 3: IMAGE EXTRACTION (OCR)
        # -------------------------------------------------------------
        log("\n=== TEST 3: IMAGE EXTRACTION (study_note_neural_nets.png) ===")
        extract_section.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        img_file = os.path.join(FIXTURES_DIR, 'study_note_neural_nets.png')
        file_input.set_input_files(img_file)

        page.wait_for_selector('text=Review Extracted Topics', timeout=30000)
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '05_image_review.png'))

        img_topics = []
        cards = page.locator('#extract .grid > div').all()
        for card in cards:
            title_input = card.locator('input[type="text"]').first
            desc_textarea = card.locator('textarea').first
            title = title_input.input_value() if title_input.count() > 0 else ''
            desc = desc_textarea.input_value() if desc_textarea.count() > 0 else ''
            cat = card.locator('span.font-mono.font-semibold').first.text_content() if card.locator('span.font-mono.font-semibold').count() > 0 else ''
            if title:
                img_topics.append({'title': title, 'description': desc, 'category': cat})

        RESULTS['formats']['image'] = {
            'file': 'study_note_neural_nets.png',
            'topic_count': len(img_topics),
            'topics': img_topics
        }
        log(f"Image Extracted {len(img_topics)} topics:")
        for t in img_topics:
            log(f"  - [{t['category']}] {t['title']}: {t['description']}")

        page.locator('#extract button:has-text("Add")').click()
        page.wait_for_timeout(1000)

        # -------------------------------------------------------------
        # TEST 4: VIDEO EXTRACTION (HTML5 Video Frame Sampling + OCR)
        # -------------------------------------------------------------
        log("\n=== TEST 4: VIDEO EXTRACTION (lecture_microservices.webm) ===")
        extract_section.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        video_file = os.path.join(FIXTURES_DIR, 'lecture_microservices.webm')
        file_input.set_input_files(video_file)

        # Wait for review state
        page.wait_for_selector('text=Review Extracted Topics', timeout=25000)
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '06_video_review.png'))

        video_topics = []
        cards = page.locator('#extract .grid > div').all()
        for card in cards:
            title_input = card.locator('input[type="text"]').first
            desc_textarea = card.locator('textarea').first
            title = title_input.input_value() if title_input.count() > 0 else ''
            desc = desc_textarea.input_value() if desc_textarea.count() > 0 else ''
            cat = card.locator('span.font-mono.font-semibold').first.text_content() if card.locator('span.font-mono.font-semibold').count() > 0 else ''
            if title:
                video_topics.append({'title': title, 'description': desc, 'category': cat})

        RESULTS['formats']['video'] = {
            'file': 'lecture_microservices.webm',
            'topic_count': len(video_topics),
            'topics': video_topics
        }
        log(f"Video Extracted {len(video_topics)} topics:")
        for t in video_topics:
            log(f"  - [{t['category']}] {t['title']}: {t['description']}")

        page.locator('#extract button:has-text("Add")').click()
        page.wait_for_timeout(1000)

        # -------------------------------------------------------------
        # TEST 5: ERROR HANDLING - CORRUPT FILE
        # -------------------------------------------------------------
        log("\n=== TEST 5: ERROR HANDLING - CORRUPT PDF ===")
        extract_section.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        corrupt_file = os.path.join(FIXTURES_DIR, 'corrupt_test_file.pdf')
        file_input.set_input_files(corrupt_file)

        page.wait_for_selector('text=Extraction Failed', timeout=10000)
        error_text = page.locator('#extract .p-6.sm\\:p-8 p, #extract .p-6 p').first.text_content()
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '07_error_corrupt_file.png'))
        RESULTS['error_cases']['corrupt_file'] = error_text
        log(f"Corrupt file error handled: {error_text}")

        # Reset
        page.locator('button:has-text("Try Another File")').click()
        page.wait_for_timeout(500)

        # -------------------------------------------------------------
        # TEST 6: ERROR HANDLING - NON-TEXTUAL IMAGE
        # -------------------------------------------------------------
        log("\n=== TEST 6: ERROR HANDLING - NON-TEXTUAL IMAGE ===")
        extract_section.scroll_into_view_if_needed()
        non_text_file = os.path.join(FIXTURES_DIR, 'diagram_no_text.png')
        file_input.set_input_files(non_text_file)

        page.wait_for_selector('text=Extraction Failed', timeout=20000)
        non_text_error = page.locator('#extract .p-6.sm\\:p-8 p, #extract .p-6 p').first.text_content()
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '08_error_non_text_image.png'))
        RESULTS['error_cases']['non_text_image'] = non_text_error
        log(f"Non-text image error handled: {non_text_error}")

        # Reset
        page.locator('button:has-text("Try Another File")').click()
        page.wait_for_timeout(500)

        # -------------------------------------------------------------
        # TEST 7: ERROR HANDLING - OVERSIZED VIDEO GUARDRAIL (>100MB)
        # -------------------------------------------------------------
        log("\n=== TEST 7: ERROR HANDLING - OVERSIZED VIDEO GUARDRAIL ===")
        # Evaluate oversized file test through the input dispatch
        oversized_error = page.evaluate("""async () => {
            const file = new File([new ArrayBuffer(105 * 1024 * 1024)], "lecture_huge_recording.mp4", { type: "video/mp4" });
            const dt = new DataTransfer();
            dt.items.add(file);
            const input = document.querySelector('#extract input[type="file"]');
            input.files = dt.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Wait for error state
            await new Promise(r => setTimeout(r, 1200));
            const p = document.querySelector('#extract .p-6.sm\\\\:p-8 p, #extract .p-6 p');
            return p ? p.textContent : 'No error found';
        }""")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '09_error_oversized_video.png'))
        RESULTS['error_cases']['oversized_video'] = oversized_error
        log(f"Oversized video guardrail handled: {oversized_error}")

        # Reset
        page.locator('button:has-text("Try Another File")').click()
        page.wait_for_timeout(500)

        # -------------------------------------------------------------
        # TEST 8: VERIFY PERSONAL SPIN POOL WITH CUSTOM TOPICS
        # -------------------------------------------------------------
        log("\n=== TEST 8: VERIFY PERSONAL SPIN POOL WITH CUSTOM TOPICS ===")
        extract_section.scroll_into_view_if_needed()
        page.wait_for_timeout(600)
        
        # Check custom topics listed in "Your Personal Spin Pool"
        custom_cards = page.locator('#extract .border-outline-variant\\/30 h4').all_text_contents()
        RESULTS['spin_pool_verification']['personal_pool_cards'] = custom_cards
        log(f"Personal spin pool currently contains {len(custom_cards)} custom topics:")
        for c in custom_cards[:5]:
            log(f"  * {c}")

        # Scroll to Spin Screen and spin roulette wheel
        spin_section = page.locator('#spin')
        spin_section.scroll_into_view_if_needed()
        page.wait_for_timeout(800)

        spin_btn = page.locator('button:has-text("Spin Wheel"), button:has-text("SPIN")').first
        if spin_btn.count() > 0:
            spin_btn.click()
            log("Triggered spin on roulette wheel...")
            page.wait_for_timeout(3500)

        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '10_spin_with_custom_topics.png'))
        log("Captured 10_spin_with_custom_topics.png")

        # Save all results to JSON
        results_file = os.path.join(FIXTURES_DIR, 'phase2_extraction_results.json')
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(RESULTS, f, indent=2)
        log(f"\nAll verification tests completed! Results saved to {results_file}")

        browser.close()

if __name__ == '__main__':
    run_tests()
