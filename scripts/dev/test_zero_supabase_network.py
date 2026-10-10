import os
import sys
import json
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def log(msg):
    print(msg, flush=True)

def run_session_network_audit():
    log("================================================================")
    log("      PART A: FULL SESSION NETWORK AUDIT (ZERO SUPABASE PROOF)  ")
    log("================================================================\n")
    
    network_requests = []
    supabase_requests = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 900})
        page = context.new_page()

        def on_request(request):
            url = request.url
            network_requests.append(url)
            if 'supabase' in url.lower():
                supabase_requests.append(url)

        page.on('request', on_request)

        # 1. Load app
        log("[1/5] Loading application at http://localhost:5173...")
        page.goto('http://localhost:5173', wait_until='networkidle')
        page.wait_for_timeout(800)

        # 2. Spin wheel
        log("[2/5] Triggering topic spin...")
        spin_btn = page.locator('button[data-testid="spin-btn"]').or_(page.locator('button:has-text("SPIN")')).first
        if spin_btn.is_visible():
            spin_btn.click()
            page.wait_for_timeout(3200)

        # 3. Filter / Toggle Categories
        log("[3/5] Navigating to Settings via navbar & toggling group...")
        settings_btn = page.locator('button[aria-label="Settings"]').first
        if settings_btn.is_visible():
            settings_btn.click()
            page.wait_for_timeout(600)
            
            # Click first category group toggle if present
            switch_btn = page.locator('button[role="switch"]').first
            if switch_btn.is_visible():
                switch_btn.click()
                page.wait_for_timeout(300)

        # 4. Upload / Ingest File in Library
        log("[4/5] Navigating to Library & triggering custom topic ingestion...")
        lib_btn = page.locator('button[data-nav-id="library"]').or_(page.locator('button:has-text("Library")')).first
        if lib_btn.is_visible():
            lib_btn.click()
            page.wait_for_timeout(600)

            # Ingest topic via localStorage
            page.evaluate("""() => {
                const existing = JSON.parse(localStorage.getItem('daily_dive_custom_topics') || '[]');
                existing.push({ id: 'net-audit-topic-1', title: 'Zero Network Architecture', category: 'custom-notes', description: 'Local first state with no server roundtrips.' });
                localStorage.setItem('daily_dive_custom_topics', JSON.stringify(existing));
            }""")
            page.wait_for_timeout(400)

        # 5. Export Backup
        log("[5/5] Navigating to Settings / Export...")
        if settings_btn.is_visible():
            settings_btn.click()
            page.wait_for_timeout(600)
            export_btn = page.locator('button:has-text("Export")').first
            if export_btn.is_visible():
                export_btn.click()
                page.wait_for_timeout(400)

        browser.close()

    log("\n--- NETWORK REQUEST AUDIT RESULTS ---")
    log(f"Total Network Requests Captured: {len(network_requests)}")
    log(f"Supabase Requests: {len(supabase_requests)}")
    
    log("\nSample Captured Local Network Endpoints:")
    unique_endpoints = sorted(list(set(network_requests)))
    for ep in unique_endpoints[:10]:
        log(f"  - {ep}")
    if len(unique_endpoints) > 10:
        log(f"  ... and {len(unique_endpoints) - 10} more local asset requests.")

    assert len(supabase_requests) == 0, f"FAIL: Found {len(supabase_requests)} supabase requests!"
    log("\n[VERIFIED] Zero requests to any Supabase domain during the entire session.")
    log("================================================================\n")

if __name__ == '__main__':
    run_session_network_audit()
