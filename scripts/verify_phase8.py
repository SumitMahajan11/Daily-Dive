import os
import shutil
import time
import json
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\SUMIT\.gemini\antigravity-ide\brain\c2c30b95-856e-4b15-a55b-b571bbf91e66"
AFTER_DIR = os.path.join("screenshots", "phase8", "after")
AFTER_ARTIFACT_DIR = os.path.join(ARTIFACT_DIR, "screenshots_phase8_after")

os.makedirs(AFTER_DIR, exist_ok=True)
os.makedirs(AFTER_ARTIFACT_DIR, exist_ok=True)

def nav_to(page, section_id):
    """Navigate to section using sidebar/bottom nav button or scroll."""
    btn = page.locator(f'button[data-nav-id="{section_id}"]').first
    if btn.count() > 0 and btn.is_visible():
        btn.click()
    else:
        sec = page.locator(f'#{section_id}')
        if sec.count() > 0:
            sec.scroll_into_view_if_needed()
    time.sleep(0.6)

def verify_phase8_all():
    results = {}
    print("=== STARTING PHASE 8 VERIFICATION & EVIDENCE CAPTURE ===", flush=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # ─────────────────────────────────────────────────────────────
        # 1. TEST FIX 2: COLLAPSED CATEGORY FILTER BY DEFAULT & PERSISTENCE
        # ─────────────────────────────────────────────────────────────
        print("\n--- [TEST 1] Verifying Default Collapsed Category Filter ---", flush=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        context.add_init_script("""
            localStorage.setItem('daily-dive-theme', 'dark');
        """)
        page = context.new_page()
        page.goto("http://localhost:5173", wait_until="networkidle")
        # Clear category view preference once to test default collapsed state
        page.evaluate("() => localStorage.removeItem('daily_dive_category_detail_view')")
        page.reload(wait_until="networkidle")
        time.sleep(1)

        # Navigate to Filter screen
        nav_to(page, "filter")

        # Verify collapsed view is visible by default
        collapsed_view = page.locator("#category-collapsed-view")
        detailed_view = page.locator("#category-detailed-view")
        toggle_btn = page.locator("#btn-toggle-category-detail")

        is_collapsed_visible = collapsed_view.is_visible()
        is_detailed_visible = detailed_view.is_visible()
        btn_text = toggle_btn.inner_text().strip()

        print(f"Default view collapsed visible: {is_collapsed_visible}", flush=True)
        print(f"Default view detailed visible: {is_detailed_visible}", flush=True)
        print(f"Granularity button text: '{btn_text}'", flush=True)

        assert is_collapsed_visible, "FAILED: Category filter did not default to collapsed view!"
        assert not is_detailed_visible, "FAILED: Detailed subcategories should not be visible by default!"
        assert "Show All Categories" in btn_text, f"FAILED: Expected 'Show All Categories' button, got {btn_text}"
        results["default_collapsed_view"] = "PASS"

        # Toggle to detailed view
        print("Clicking 'Show All Categories'...", flush=True)
        toggle_btn.click()
        time.sleep(0.5)

        is_detailed_now = page.locator("#category-detailed-view").is_visible()
        btn_text_detailed = page.locator("#btn-toggle-category-detail").inner_text().strip()
        pref_stored = page.evaluate("() => localStorage.getItem('daily_dive_category_detail_view')")

        print(f"Detailed view visible after toggle: {is_detailed_now}", flush=True)
        print(f"Button text now: '{btn_text_detailed}'", flush=True)
        print(f"Stored preference in localStorage: '{pref_stored}'", flush=True)

        assert is_detailed_now, "FAILED: Detailed view did not open upon clicking toggle!"
        assert "Collapse to Groups" in btn_text_detailed, "FAILED: Button text did not update to 'Collapse to Groups'!"
        assert pref_stored == "true", "FAILED: daily_dive_category_detail_view was not saved as 'true'!"
        results["expand_to_detailed"] = "PASS"

        # Reload page and verify persistence
        print("Reloading page to verify persistence...", flush=True)
        page.reload(wait_until="networkidle")
        time.sleep(1)
        nav_to(page, "filter")

        is_detailed_reloaded = page.locator("#category-detailed-view").is_visible()
        print(f"Detailed view retained after reload: {is_detailed_reloaded}", flush=True)
        assert is_detailed_reloaded, "FAILED: Detailed view preference was not persisted on reload!"
        results["persistence_across_reloads"] = "PASS"

        # Collapse back
        page.locator("#btn-toggle-category-detail").click()
        time.sleep(0.4)
        pref_stored_collapsed = page.evaluate("() => localStorage.getItem('daily_dive_category_detail_view')")
        assert pref_stored_collapsed == "false", "FAILED: Preference did not update back to 'false'!"
        context.close()

        # ─────────────────────────────────────────────────────────────
        # 2. TEST FIX 1: CUSTOM TOPIC LIFECYCLE (PERMANENT VS TEMPORARY)
        # ─────────────────────────────────────────────────────────────
        print("\n--- [TEST 2] Verifying Custom Topic Lifecycle & Expiry ---", flush=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        context.add_init_script("""
            localStorage.setItem('daily-dive-theme', 'dark');
            localStorage.setItem('daily_dive_category_detail_view', 'true');
        """)
        page = context.new_page()
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1)

        # Seed custom topics: 1 Permanent, 1 Temporary
        seed_result = page.evaluate("""() => {
            const now = Date.now();
            const permTopic = {
                id: 'custom_perm_test_01',
                title: 'Quantum Key Distribution & Cryptography',
                description: 'Foundational quantum key exchange protocol principles using entangled photons.',
                group_name: 'custom',
                category: 'custom-notes',
                tags: ['security', 'quantum-tech'],
                source: 'Manuscript Lab Intake',
                is_custom: true,
                lifecycle: 'permanent',
                created_at: new Date(now).toISOString()
            };
            const tempTopic = {
                id: 'custom_temp_test_02',
                title: 'PostgreSQL Vacuum Strategy & Bloat Reduction',
                description: 'Deep dive into Postgres MVCC autovacuum parameters and page freezing.',
                group_name: 'custom',
                category: 'custom-notes',
                tags: ['database', 'postgres'],
                source: 'Uploaded Research Note',
                is_custom: true,
                lifecycle: 'temporary',
                created_at: new Date(now).toISOString(),
                expires_at: new Date(now + 14 * 86400000).toISOString(),
                expiry_rule: '14_days'
            };

            const existing = JSON.parse(localStorage.getItem('daily_dive_custom_topics') || '[]');
            const updated = [permTopic, tempTopic];
            localStorage.setItem('daily_dive_custom_topics', JSON.stringify(updated));
            return updated;
        }""")
        print(f"Seeded custom topics: {len(seed_result)} topics", flush=True)

        # Reload to let context pick up seeded topics
        page.reload(wait_until="networkidle")
        time.sleep(1)

        # Go to Filter screen (in detailed view)
        nav_to(page, "filter")

        # Verify Permanent Collection sub-section has Quantum Key Distribution
        perm_section_text = page.locator("text=Permanent Collection").first.is_visible()
        temp_section_text = page.locator("text=Temporary Intake").first.is_visible()
        has_perm_topic = page.locator("text=Quantum Key Distribution").is_visible()
        has_temp_topic = page.locator("text=PostgreSQL Vacuum Strategy").is_visible()

        print(f"Permanent Collection section visible: {perm_section_text}", flush=True)
        print(f"Temporary Intake section visible: {temp_section_text}", flush=True)
        print(f"Permanent topic visible: {has_perm_topic}", flush=True)
        print(f"Temporary topic visible: {has_temp_topic}", flush=True)

        assert perm_section_text and temp_section_text, "FAILED: Custom Uploads does not visually separate Permanent vs Temporary!"
        assert has_perm_topic and has_temp_topic, "FAILED: Seeded custom topics not rendering in their respective sub-sections!"
        results["visual_separation_perm_vs_temp"] = "PASS"

        # ─────────────────────────────────────────────────────────────
        # 3. TEST ARTIFICIAL AGING, AUTO-EXPIRY & UNDO TOAST
        # ─────────────────────────────────────────────────────────────
        print("\n--- [TEST 3] Testing Artificial Aging, Expiry Soft-Delete & Undo Toast ---", flush=True)
        
        # Age the temporary topic past expiry (yesterday)
        page.evaluate("""() => {
            const list = JSON.parse(localStorage.getItem('daily_dive_custom_topics') || '[]');
            const aged = list.map(t => {
                if (t.id === 'custom_temp_test_02') {
                    return {
                        ...t,
                        expires_at: new Date(Date.now() - 24 * 3600000).toISOString() // 1 day expired
                    };
                }
                return t;
            });
            localStorage.setItem('daily_dive_custom_topics', JSON.stringify(aged));
        }""")

        # Call expiry check
        expired_res = page.evaluate("() => window.__checkTopicExpiry ? window.__checkTopicExpiry() : []")
        expired_count = len(expired_res) if isinstance(expired_res, list) else int(expired_res)
        print(f"window.__checkTopicExpiry() returned: {expired_count} expired topic(s)", flush=True)
        assert expired_count == 1, f"FAILED: Expected 1 expired topic, got {expired_res}"
        time.sleep(0.5)

        # Verify temporary topic is soft-deleted and removed from view
        temp_topic_still_visible = page.locator("text=PostgreSQL Vacuum Strategy").is_visible()
        perm_topic_still_visible = page.locator("text=Quantum Key Distribution").is_visible()

        print(f"Temporary topic still visible in active list: {temp_topic_still_visible}", flush=True)
        print(f"Permanent topic still visible in active list: {perm_topic_still_visible}", flush=True)

        assert not temp_topic_still_visible, "FAILED: Expired temporary topic was not removed from the active pool!"
        assert perm_topic_still_visible, "FAILED: Permanent topic was unexpectedly touched!"
        results["auto_expiry_soft_delete"] = "PASS"

        # Verify the Undo Toast is visible!
        toast_el = page.locator("text=1 temporary topic expired")
        undo_btn = page.locator("button:has-text('Undo')")
        assert toast_el.is_visible(), "FAILED: Expiry toast did not appear!"
        assert undo_btn.is_visible(), "FAILED: Undo action button did not appear on toast!"
        print("Undo toast is prominently visible with 'Undo' action button!", flush=True)

        # Capture screenshot of the Undo Toast in action
        undo_toast_shot = os.path.join(AFTER_DIR, "expiry-undo-toast.png")
        page.screenshot(path=undo_toast_shot, full_page=False)
        shutil.copy(undo_toast_shot, os.path.join(AFTER_ARTIFACT_DIR, "expiry-undo-toast.png"))
        print(f"Captured {undo_toast_shot}", flush=True)

        # Click Undo to test restoration!
        print("Clicking 'Undo' to restore expired topic...", flush=True)
        undo_btn.click()
        time.sleep(0.8)

        # Check that PostgreSQL Vacuum Strategy is back in Temporary Intake
        temp_restored = page.locator("text=PostgreSQL Vacuum Strategy").is_visible()
        print(f"PostgreSQL Vacuum Strategy restored: {temp_restored}", flush=True)
        assert temp_restored, "FAILED: Undo did not restore the expired topic!"
        results["expiry_undo_restoration"] = "PASS"

        # Test lifecycle conversion: Promote temporary to permanent
        print("Testing promote to permanent via 'Keep Perm'...", flush=True)
        page.locator("button:has-text('Keep Perm')").first.click()
        time.sleep(0.6)

        # Verify it now has "Permanent" badge and is in permanent sub-section
        perm_count = page.evaluate("""() => {
            const list = JSON.parse(localStorage.getItem('daily_dive_custom_topics') || '[]');
            return list.filter(t => t.lifecycle === 'permanent').length;
        }""")
        print(f"Permanent topics count after conversion: {perm_count}", flush=True)
        assert perm_count == 2, f"FAILED: Expected 2 permanent topics, got {perm_count}"
        results["lifecycle_conversion"] = "PASS"

        context.close()

        # ─────────────────────────────────────────────────────────────
        # 4. CAPTURE ALL AFTER SCREENSHOTS (DESKTOP + MOBILE, DARK + LIGHT)
        # ─────────────────────────────────────────────────────────────
        print("\n--- [TEST 4] Capturing Comprehensive After Screenshots ---", flush=True)

        configs = [
            {"name": "desktop-dark", "width": 1280, "height": 900, "is_mobile": False, "theme": "dark"},
            {"name": "desktop-light", "width": 1280, "height": 900, "is_mobile": False, "theme": "light"},
            {"name": "mobile-dark", "width": 375, "height": 812, "is_mobile": True, "theme": "dark"},
            {"name": "mobile-light", "width": 375, "height": 812, "is_mobile": True, "theme": "light"},
        ]

        for cfg in configs:
            ctx = browser.new_context(
                viewport={"width": cfg["width"], "height": cfg["height"]},
                is_mobile=cfg["is_mobile"],
                has_touch=cfg["is_mobile"],
                color_scheme=cfg["theme"],
                device_scale_factor=2
            )
            ctx.add_init_script(f"""
                localStorage.setItem('daily-dive-theme', '{cfg["theme"]}');
                localStorage.setItem('daily_dive_category_detail_view', 'false');
                const now = Date.now();
                localStorage.setItem('daily_dive_custom_topics', JSON.stringify([
                    {{
                        id: 'custom_perm_demo',
                        title: 'Quantum Key Distribution & Photonic Cryptography',
                        description: 'Foundational quantum key exchange protocol principles using entangled photons.',
                        group_name: 'custom',
                        category: 'custom-notes',
                        tags: ['tech', 'cryptography'],
                        source: 'Manuscript Lab Intake',
                        is_custom: true,
                        lifecycle: 'permanent',
                        created_at: new Date(now).toISOString()
                    }},
                    {{
                        id: 'custom_temp_demo',
                        title: 'PostgreSQL MVCC & Autovacuum Tuning',
                        description: 'Tuning parameters for write-heavy workloads, table bloat prevention, and lock avoidance.',
                        group_name: 'custom',
                        category: 'custom-notes',
                        tags: ['database', 'postgres'],
                        source: 'Uploaded Research Note',
                        is_custom: true,
                        lifecycle: 'temporary',
                        created_at: new Date(now).toISOString(),
                        expires_at: new Date(now + 14 * 86400000).toISOString(),
                        expiry_rule: '14_days'
                    }}
                ]));
            """)
            p_scr = ctx.new_page()
            p_scr.goto("http://localhost:5173", wait_until="networkidle")
            time.sleep(1)

            p_scr.evaluate(f"""() => {{
                if ('{cfg["theme"]}' === 'dark') {{
                    document.documentElement.classList.add('dark');
                }} else {{
                    document.documentElement.classList.remove('dark');
                }}
            }}""")
            time.sleep(0.5)

            # 1. Capture Extract Screen (Bespoke Manuscript Intake Tray)
            nav_to(p_scr, "extract")
            extract_el = p_scr.locator("#extract")
            if extract_el.count() > 0:
                extract_el.scroll_into_view_if_needed()
                time.sleep(0.6)
                extract_path = os.path.join(AFTER_DIR, f"{cfg['name']}-extract.png")
                p_scr.screenshot(path=extract_path, full_page=False)
                shutil.copy(extract_path, os.path.join(AFTER_ARTIFACT_DIR, f"{cfg['name']}-extract.png"))
                print(f"Captured {extract_path}", flush=True)

            # 2. Capture Filter Screen (Collapsed View by Default)
            nav_to(p_scr, "filter")
            filter_el = p_scr.locator("#filter")
            if filter_el.count() > 0:
                filter_el.scroll_into_view_if_needed()
                time.sleep(0.6)
                filter_collapsed_path = os.path.join(AFTER_DIR, f"{cfg['name']}-filter-collapsed.png")
                p_scr.screenshot(path=filter_collapsed_path, full_page=False)
                shutil.copy(filter_collapsed_path, os.path.join(AFTER_ARTIFACT_DIR, f"{cfg['name']}-filter-collapsed.png"))
                print(f"Captured {filter_collapsed_path}", flush=True)

                # 3. Toggle to Detailed View & capture Permanent vs Temporary separation
                p_scr.locator("#btn-toggle-category-detail").click()
                time.sleep(0.6)
                filter_detailed_path = os.path.join(AFTER_DIR, f"{cfg['name']}-filter-detailed.png")
                p_scr.screenshot(path=filter_detailed_path, full_page=False)
                shutil.copy(filter_detailed_path, os.path.join(AFTER_ARTIFACT_DIR, f"{cfg['name']}-filter-detailed.png"))
                print(f"Captured {filter_detailed_path}", flush=True)

            ctx.close()

        browser.close()

    print("\n=== ALL PHASE 8 VERIFICATIONS & CAPTURES PASSED SUCCESSFULLY ===", flush=True)
    print(json.dumps(results, indent=2), flush=True)

if __name__ == "__main__":
    verify_phase8_all()
