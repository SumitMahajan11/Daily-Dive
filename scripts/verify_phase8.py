import os
import shutil
import time
import json
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\SUMIT\.gemini\antigravity-ide\brain\a16ef4aa-08cd-4c23-81c0-0a7819a2044b"
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
        # 1. TEST COMBINED FIRST-RUN ONBOARDING (CONTENT SOURCE + 4 TAXONOMY GROUPS)
        # ─────────────────────────────────────────────────────────────
        print("\n--- [TEST 1] Verifying Unified First-Run Onboarding Flow ---", flush=True)
        ctx_first_run = browser.new_context(viewport={"width": 1280, "height": 900})
        ctx_first_run.add_init_script("""
            localStorage.setItem('daily-dive-theme', 'dark');
            localStorage.removeItem('daily_dive_first_run_dismissed');
        """)
        page_fr = ctx_first_run.new_page()
        page_fr.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1)

        # Ensure first-run picker is visible on Spin screen
        picker = page_fr.locator("[data-testid='first-run-picker']")
        assert picker.is_visible(), "FAILED: First-run onboarding card is not visible on initial load!"
        print("First-run onboarding card is visible on SpinScreen.", flush=True)

        # Verify Content Source options exist in the same card
        has_curated_btn = page_fr.locator("button:has(span:text-is('Curated Syllabus'))").first.is_visible()
        has_custom_btn = page_fr.locator("button:has(span:text-is('Custom Intake'))").first.is_visible()
        has_blended_btn = page_fr.locator("button:has(span:text-is('Blended Mode'))").first.is_visible()
        assert has_curated_btn and has_custom_btn and has_blended_btn, "FAILED: 3-way content source picker missing from first-run onboarding card!"
        print("Content Source Stream options (Curated Syllabus, Custom Intake, Blended Mode) confirmed.", flush=True)

        # Verify Real 4 Category Groups exist in the same card
        has_tech = page_fr.locator("span:text-is('Tech')").first.is_visible()
        has_money = page_fr.locator("span:text-is('Money & Career')").first.is_visible()
        has_mind = page_fr.locator("span:text-is('Mind & Growth')").first.is_visible()
        has_world = page_fr.locator("span:text-is('World & Ideas')").first.is_visible()
        assert has_tech and has_money and has_mind and has_world, "FAILED: The 4 real taxonomy groups (Tech, Money & Career, Mind & Growth, World & Ideas) not all present!"
        print("Real 4 Category Groups (Tech, Money & Career, Mind & Growth, World & Ideas) confirmed.", flush=True)

        # Test selecting Blended Mode
        page_fr.locator("button:has(span:text-is('Blended Mode'))").first.click()
        time.sleep(0.4)

        # Capture screenshot of the unified first-run card
        first_run_shot = os.path.join(AFTER_DIR, "desktop-dark-first-run-onboarding.png")
        page_fr.screenshot(path=first_run_shot, full_page=False)
        shutil.copy(first_run_shot, os.path.join(AFTER_ARTIFACT_DIR, "desktop-dark-first-run-onboarding.png"))
        print(f"Captured {first_run_shot}", flush=True)

        # Dismiss by clicking Start Exploring
        page_fr.locator("button:has-text('Start Exploring')").click()
        time.sleep(0.5)
        assert not page_fr.locator("[data-testid='first-run-picker']").is_visible(), "FAILED: First run picker did not dismiss on 'Start Exploring'!"
        dismissed_flag = page_fr.evaluate("() => localStorage.getItem('daily_dive_first_run_dismissed')")
        assert dismissed_flag == 'true', "FAILED: daily_dive_first_run_dismissed was not stored in localStorage!"
        results["unified_first_run_flow"] = "PASS"
        ctx_first_run.close()

        # ─────────────────────────────────────────────────────────────
        # 2. TEST COLLAPSED VIEW BY DEFAULT, GLOBAL TOGGLE & INDEPENDENT PER-GROUP CHEVRONS
        # ─────────────────────────────────────────────────────────────
        print("\n--- [TEST 2] Verifying Global Detail Toggle & Independent Per-Group Chevrons ---", flush=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        context.add_init_script("""
            localStorage.setItem('daily-dive-theme', 'dark');
            localStorage.setItem('daily_dive_first_run_dismissed', 'true');
        """)
        page = context.new_page()
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.evaluate("() => { localStorage.removeItem('daily_dive_category_detail_view'); localStorage.removeItem('daily_dive_expanded_groups'); }")
        page.reload(wait_until="networkidle")
        time.sleep(1)

        # Navigate to Filter screen
        nav_to(page, "filter")

        # Verify collapsed view is visible by default
        collapsed_view = page.locator("#category-collapsed-view")
        detailed_view = page.locator("#category-detailed-view")
        toggle_btn = page.locator("#btn-toggle-category-detail")

        assert collapsed_view.is_visible(), "FAILED: Category filter did not default to collapsed view!"
        assert not detailed_view.is_visible(), "FAILED: Detailed subcategories should not be visible by default!"
        assert "Show All Categories" in toggle_btn.inner_text().strip()
        results["default_collapsed_view"] = "PASS"

        # Toggle global detail view
        toggle_btn.click()
        time.sleep(0.5)
        assert page.locator("#category-detailed-view").is_visible(), "FAILED: Detailed view did not open!"
        results["global_detail_toggle"] = "PASS"

        # Test individual per-group chevron collapse (e.g. collapsing Tech group accordion)
        tech_chevron_btn = page.locator("#category-detailed-view button[aria-label*='Tech group']").first
        print("Clicking Tech group chevron to collapse Tech group...", flush=True)
        tech_chevron_btn.click()
        time.sleep(0.5)

        # Verify Tech group stored as collapsed in localStorage (daily_dive_expanded_groups)
        exp_groups_str = page.evaluate("() => localStorage.getItem('daily_dive_expanded_groups')")
        exp_groups = json.loads(exp_groups_str) if exp_groups_str else {}
        print(f"Stored expanded groups state: {exp_groups}", flush=True)
        assert exp_groups.get("tech") is False, "FAILED: Tech group was not persisted as collapsed in daily_dive_expanded_groups!"
        results["independent_group_chevron_persistence"] = "PASS"

        # Reload page and verify both global detailed view AND Tech collapsed state are preserved!
        page.reload(wait_until="networkidle")
        time.sleep(1)
        nav_to(page, "filter")
        assert page.locator("#category-detailed-view").is_visible(), "FAILED: Detailed view not preserved on reload!"
        exp_after_reload = json.loads(page.evaluate("() => localStorage.getItem('daily_dive_expanded_groups')") or "{}")
        assert exp_after_reload.get("tech") is False, "FAILED: Independent group chevron state not preserved on reload!"
        results["independent_state_coexistence"] = "PASS"

        context.close()

        # ─────────────────────────────────────────────────────────────
        # 3. TEST CUSTOM TOPIC LIFECYCLE (PERMANENT VS TEMPORARY)
        # ─────────────────────────────────────────────────────────────
        print("\n--- [TEST 3] Verifying Custom Topic Lifecycle & Expiry ---", flush=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        context.add_init_script("""
            localStorage.setItem('daily-dive-theme', 'dark');
            localStorage.setItem('daily_dive_category_detail_view', 'true');
            localStorage.setItem('daily_dive_first_run_dismissed', 'true');
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

            const updated = [permTopic, tempTopic];
            localStorage.setItem('daily_dive_custom_topics', JSON.stringify(updated));
            return updated;
        }""")
        print(f"Seeded custom topics: {len(seed_result)} topics", flush=True)

        page.reload(wait_until="networkidle")
        time.sleep(1)

        nav_to(page, "filter")

        perm_section_text = page.locator("text=Permanent Collection").first.is_visible()
        temp_section_text = page.locator("text=Temporary Intake").first.is_visible()
        has_perm_topic = page.locator("text=Quantum Key Distribution").is_visible()
        has_temp_topic = page.locator("text=PostgreSQL Vacuum Strategy").is_visible()

        assert perm_section_text and temp_section_text, "FAILED: Custom Uploads does not visually separate Permanent vs Temporary!"
        assert has_perm_topic and has_temp_topic, "FAILED: Seeded custom topics not rendering in their respective sub-sections!"
        results["visual_separation_perm_vs_temp"] = "PASS"

        # ─────────────────────────────────────────────────────────────
        # 4. TEST ARTIFICIAL AGING, AUTO-EXPIRY & UNDO TOAST
        # ─────────────────────────────────────────────────────────────
        print("\n--- [TEST 4] Testing Artificial Aging, Expiry Soft-Delete & Undo Toast ---", flush=True)
        
        # Age the temporary topic past expiry (yesterday)
        page.evaluate("""() => {
            const list = JSON.parse(localStorage.getItem('daily_dive_custom_topics') || '[]');
            const aged = list.map(t => {
                if (t.id === 'custom_temp_test_02') {
                    return {
                        ...t,
                        expires_at: new Date(Date.now() - 24 * 3600000).toISOString()
                    };
                }
                return t;
            });
            localStorage.setItem('daily_dive_custom_topics', JSON.stringify(aged));
        }""")

        expired_res = page.evaluate("() => window.__checkTopicExpiry ? window.__checkTopicExpiry() : []")
        expired_count = len(expired_res) if isinstance(expired_res, list) else int(expired_res)
        print(f"window.__checkTopicExpiry() returned: {expired_count} expired topic(s)", flush=True)
        assert expired_count == 1, f"FAILED: Expected 1 expired topic, got {expired_res}"
        time.sleep(0.5)

        temp_topic_still_visible = page.locator("text=PostgreSQL Vacuum Strategy").is_visible()
        perm_topic_still_visible = page.locator("text=Quantum Key Distribution").is_visible()
        assert not temp_topic_still_visible, "FAILED: Expired temporary topic was not removed from active pool!"
        assert perm_topic_still_visible, "FAILED: Permanent topic was unexpectedly touched!"
        results["auto_expiry_soft_delete"] = "PASS"

        toast_el = page.locator("text=1 temporary topic expired")
        undo_btn = page.locator("button:has-text('Undo')")
        assert toast_el.is_visible(), "FAILED: Expiry toast did not appear!"
        assert undo_btn.is_visible(), "FAILED: Undo action button did not appear on toast!"
        print("Undo toast is prominently visible with 'Undo' action button!", flush=True)

        undo_toast_shot = os.path.join(AFTER_DIR, "expiry-undo-toast.png")
        page.screenshot(path=undo_toast_shot, full_page=False)
        shutil.copy(undo_toast_shot, os.path.join(AFTER_ARTIFACT_DIR, "expiry-undo-toast.png"))
        print(f"Captured {undo_toast_shot}", flush=True)

        # Restore
        undo_btn.click()
        time.sleep(0.8)
        temp_restored = page.locator("text=PostgreSQL Vacuum Strategy").is_visible()
        assert temp_restored, "FAILED: Undo did not restore the expired topic!"
        results["expiry_undo_restoration"] = "PASS"

        # Promote to permanent
        page.locator("button:has-text('Keep Perm')").first.click()
        time.sleep(0.6)
        perm_count = page.evaluate("""() => {
            const list = JSON.parse(localStorage.getItem('daily_dive_custom_topics') || '[]');
            return list.filter(t => t.lifecycle === 'permanent').length;
        }""")
        assert perm_count == 2, f"FAILED: Expected 2 permanent topics, got {perm_count}"
        results["lifecycle_conversion"] = "PASS"

        context.close()

        # ─────────────────────────────────────────────────────────────
        # 5. CAPTURE ALL AFTER SCREENSHOTS (DESKTOP + MOBILE, DARK + LIGHT)
        # ─────────────────────────────────────────────────────────────
        print("\n--- [TEST 5] Capturing Comprehensive After Screenshots ---", flush=True)

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
                localStorage.setItem('daily_dive_first_run_dismissed', 'true');
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

            # 1. Capture Extract Screen
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
