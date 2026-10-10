import os
import shutil
import time
import json
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\SUMIT\.gemini\antigravity-ide\brain\a16ef4aa-08cd-4c23-81c0-0a7819a2044b"
AFTER_DIR = os.path.join(ARTIFACT_DIR, "phase8_evidence")
os.makedirs(AFTER_DIR, exist_ok=True)

def nav_to(page, section_id):
    """Navigate to section using sidebar/bottom nav button or scroll."""
    btn = page.locator(f'button[data-nav-id="{section_id}"]').first
    if btn.count() > 0 and btn.is_visible():
        btn.click()
    else:
        sec = page.locator(f'#{section_id}')
        if sec.count() > 0:
            sec.scroll_into_view_if_needed()
    time.sleep(0.5)

def run_scoped_phase8_verification():
    log_entries = []
    def log(msg):
        print(msg, flush=True)
        log_entries.append(msg)

    log("=================================================================")
    log("  PHASE 8 SCOPED VERIFICATION: TAXONOMY, ONBOARDING, CHEVRONS   ")
    log("=================================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # ─────────────────────────────────────────────────────────────
        # PART 1: UNIFIED FIRST-RUN ONBOARDING MOMENT
        # ─────────────────────────────────────────────────────────────
        log("\n>>> [STEP 1] Testing Unified First-Run Onboarding on SpinScreen")
        ctx1 = browser.new_context(viewport={"width": 1280, "height": 900})
        ctx1.add_init_script("""
            localStorage.setItem('daily-dive-theme', 'dark');
            localStorage.removeItem('daily_dive_first_run_dismissed');
            localStorage.removeItem('daily_dive_guest_settings');
        """)
        p1 = ctx1.new_page()
        p1.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1)

        # 1.1 Check presence of single unified card
        picker = p1.locator("[data-testid='first-run-picker']")
        assert picker.is_visible(), "ASSERTION ERROR: First run onboarding card not visible on initial launch"
        log("  [OK] Unified First-Run Card is visible on SpinScreen")

        # 1.2 Inspect DOM contents of the single card
        header_text = picker.locator("h2").inner_text().strip()
        log(f"  - Card Header: '{header_text}'")

        # Verify Content Source options in the same card
        btn_curated = picker.locator("button:has(span:text-is('Curated Syllabus'))").first
        btn_custom = picker.locator("button:has(span:text-is('Custom Intake'))").first
        btn_blended = picker.locator("button:has(span:text-is('Blended Mode'))").first

        assert btn_curated.is_visible() and btn_custom.is_visible() and btn_blended.is_visible(), "ASSERTION ERROR: 3-way content source options missing"
        log("  [OK] Content Source Stream buttons confirmed:")
        log("     [1] Curated Syllabus (692 vetted topics)")
        log("     [2] Custom Intake (Uploaded PDFs/slides/notes)")
        log("     [3] Blended Mode (Harmonious mixture)")

        # Verify Real 4 Category Groups in the same card
        cat_buttons = picker.locator("div.grid-cols-2 button")
        cat_count = cat_buttons.count()
        log(f"  - Starter Category Focus buttons rendered: {cat_count}")
        group_names = [cat_buttons.nth(i).locator("span").first.inner_text().strip() for i in range(cat_count)]
        log(f"  - Rendered Category Groups: {group_names}")
        expected_groups = ["TECH", "MONEY & CAREER", "MIND & GROWTH", "WORLD & IDEAS"]
        assert [g.upper() for g in group_names] == expected_groups, f"ASSERTION ERROR: Expected {expected_groups}, got {group_names}"
        log("  [OK] Real Taxonomy strictly validated: Tech, Money & Career, Mind & Growth, World & Ideas")

        # 1.3 Interactivity: Select 'Blended Mode'
        log("  - Action: Clicking 'Blended Mode' button...")
        btn_blended.click()
        time.sleep(0.4)
        stored_settings_pre = p1.evaluate("() => localStorage.getItem('daily_dive_guest_settings')")
        log(f"  - Stored guest settings after selecting Blended Mode: {stored_settings_pre}")

        # Capture Screenshot: Unified First-Run Card
        shot_first_run = os.path.join(AFTER_DIR, "01_unified_first_run_card.png")
        p1.screenshot(path=shot_first_run, full_page=False)
        log(f"  [OK] Captured Screenshot: {shot_first_run}")

        # 1.4 Dismissal: Click 'Start Exploring'
        btn_start = picker.locator("button:has-text('Start Exploring')").first
        log("  - Action: Clicking 'Start Exploring' CTA...")
        btn_start.click()
        time.sleep(0.5)

        is_picker_visible = picker.is_visible()
        dismissed_stored = p1.evaluate("() => localStorage.getItem('daily_dive_first_run_dismissed')")
        log(f"  - First-run picker visible after dismissal: {is_picker_visible}")
        log(f"  - localStorage['daily_dive_first_run_dismissed']: '{dismissed_stored}'")
        assert not is_picker_visible and dismissed_stored == 'true', "ASSERTION ERROR: First-run card not dismissed or flag not stored"
        log("  [OK] First-run onboarding successfully dismissed and persisted")
        ctx1.close()

        # ─────────────────────────────────────────────────────────────
        # PART 2: REAL CATEGORY TAXONOMY & EXPAND/COLLAPSE COEXISTENCE
        # ─────────────────────────────────────────────────────────────
        log("\n>>> [STEP 2] Testing Category Taxonomy, Global Toggle & Per-Group Chevron Persistence")
        ctx2 = browser.new_context(viewport={"width": 1280, "height": 900})
        ctx2.add_init_script("""
            localStorage.setItem('daily-dive-theme', 'dark');
            localStorage.setItem('daily_dive_first_run_dismissed', 'true');
        """)
        p2 = ctx2.new_page()
        p2.goto("http://localhost:5173", wait_until="networkidle")
        p2.evaluate("() => { localStorage.removeItem('daily_dive_category_detail_view'); localStorage.removeItem('daily_dive_expanded_groups'); }")
        p2.reload(wait_until="networkidle")
        time.sleep(1)

        # Navigate to Filter Screen
        nav_to(p2, "filter")

        # 2.1 Default State: Collapsed Group View
        collapsed_view = p2.locator("#category-collapsed-view")
        detailed_view = p2.locator("#category-detailed-view")
        toggle_btn = p2.locator("#btn-toggle-category-detail")

        assert collapsed_view.is_visible(), "ASSERTION ERROR: Did not default to collapsed view"
        assert not detailed_view.is_visible(), "ASSERTION ERROR: Detailed view should not be visible by default"
        log("  [OK] Default View is COLLAPSED to top-level group cards")

        # Verify the 4 groups in Collapsed View
        rendered_collapsed_groups = p2.locator("#category-collapsed-view .font-display").all_inner_texts()
        log(f"  - Collapsed View Group Cards: {rendered_collapsed_groups}")
        assert all(g in rendered_collapsed_groups for g in ["Tech", "Money & Career", "Mind & Growth", "World & Ideas"]), "ASSERTION ERROR: Missing groups in collapsed view"

        # Capture Screenshot: Filter Collapsed View
        shot_collapsed = os.path.join(AFTER_DIR, "02_filter_collapsed_default.png")
        p2.screenshot(path=shot_collapsed, full_page=False)
        log(f"  [OK] Captured Screenshot: {shot_collapsed}")

        # 2.2 Global Toggle: Switch to Detailed View
        log("  - Action: Clicking global toggle 'Show All Categories'...")
        toggle_btn.click()
        time.sleep(0.5)

        is_detailed = p2.locator("#category-detailed-view").is_visible()
        global_pref = p2.evaluate("() => localStorage.getItem('daily_dive_category_detail_view')")
        btn_label = toggle_btn.inner_text().strip()
        log(f"  - Detailed view container visible: {is_detailed}")
        log(f"  - Global toggle button text: '{btn_label}'")
        log(f"  - localStorage['daily_dive_category_detail_view']: '{global_pref}'")
        assert is_detailed and global_pref == 'true' and 'Collapse to Groups' in btn_label, "ASSERTION ERROR: Detailed view toggle failed"
        log("  [OK] Global Detailed View opened and persisted")

        # Capture Screenshot: Filter Detailed View (All Groups Expanded)
        shot_detailed_all = os.path.join(AFTER_DIR, "03_filter_detailed_all_expanded.png")
        p2.screenshot(path=shot_detailed_all, full_page=False)
        log(f"  [OK] Captured Screenshot: {shot_detailed_all}")

        # 2.3 Per-Group Chevron: Collapse 'Tech' and 'Mind & Growth'
        log("  - Action: Clicking per-group chevron on 'Tech' group...")
        tech_chevron = p2.locator("#category-detailed-view button[aria-label*='Tech group']").first
        tech_chevron.click()
        time.sleep(0.4)

        log("  - Action: Clicking per-group chevron on 'Mind & Growth' group...")
        mind_chevron = p2.locator("#category-detailed-view button[aria-label*='Mind & Growth group']").first
        mind_chevron.click()
        time.sleep(0.4)

        stored_expanded = p2.evaluate("() => localStorage.getItem('daily_dive_expanded_groups')")
        log(f"  - localStorage['daily_dive_expanded_groups']: {stored_expanded}")
        exp_obj = json.loads(stored_expanded)
        assert exp_obj.get("tech") is False and exp_obj.get("mind-growth") is False, "ASSERTION ERROR: Per-group chevron state not saved in localStorage"
        assert exp_obj.get("money-career") is True and exp_obj.get("world-ideas") is True, "ASSERTION ERROR: Other groups should remain expanded"
        log("  [OK] Independent per-group chevron collapse verified in localStorage")

        # Capture Screenshot: Detailed View with Tech & Mind Collapsed
        shot_custom_chevrons = os.path.join(AFTER_DIR, "04_filter_detailed_independent_chevrons.png")
        p2.screenshot(path=shot_custom_chevrons, full_page=False)
        log(f"  [OK] Captured Screenshot: {shot_custom_chevrons}")

        # 2.4 Persistence Across Reload: Verify Coexistence
        log("  - Action: Reloading page to verify persistence...")
        p2.reload(wait_until="networkidle")
        time.sleep(1)
        nav_to(p2, "filter")

        is_detailed_after_reload = p2.locator("#category-detailed-view").is_visible()
        reloaded_global_pref = p2.evaluate("() => localStorage.getItem('daily_dive_category_detail_view')")
        reloaded_expanded_pref = p2.evaluate("() => localStorage.getItem('daily_dive_expanded_groups')")

        log(f"  - Detailed view visible after reload: {is_detailed_after_reload}")
        log(f"  - Reloaded localStorage['daily_dive_category_detail_view']: '{reloaded_global_pref}'")
        log(f"  - Reloaded localStorage['daily_dive_expanded_groups']: {reloaded_expanded_pref}")

        assert is_detailed_after_reload and reloaded_global_pref == 'true', "ASSERTION ERROR: Global detail state lost after reload"
        reloaded_exp_obj = json.loads(reloaded_expanded_pref)
        assert reloaded_exp_obj.get("tech") is False and reloaded_exp_obj.get("mind-growth") is False, "ASSERTION ERROR: Per-group chevron state lost after reload"
        log("  [OK] Both Global Toggle AND Independent Group Chevrons cleanly COEXIST across reloads")

        # 2.5 Collapse back to Global Overview
        log("  - Action: Clicking global toggle 'Collapse to Groups'...")
        toggle_btn.click()
        time.sleep(0.4)
        collapsed_again = p2.locator("#category-collapsed-view").is_visible()
        global_pref_collapsed = p2.evaluate("() => localStorage.getItem('daily_dive_category_detail_view')")
        log(f"  - Collapsed view visible again: {collapsed_again}")
        log(f"  - localStorage['daily_dive_category_detail_view']: '{global_pref_collapsed}'")
        assert collapsed_again and global_pref_collapsed == 'false', "ASSERTION ERROR: Could not collapse back to global groups"
        log("  [OK] Successfully collapsed back to top-level groups")

        # 2.6 Round-Trip Re-Expand: Confirm per-group chevron memory is preserved!
        log("  - Action: Clicking global toggle 'Show All Categories' to RE-EXPAND detailed view...")
        toggle_btn.click()
        time.sleep(0.5)

        is_detailed_re_expanded = p2.locator("#category-detailed-view").is_visible()
        global_pref_re_expanded = p2.evaluate("() => localStorage.getItem('daily_dive_category_detail_view')")
        exp_pref_re_expanded = p2.evaluate("() => localStorage.getItem('daily_dive_expanded_groups')")
        exp_obj_re = json.loads(exp_pref_re_expanded)

        log(f"  - Detailed view visible after re-expansion: {is_detailed_re_expanded}")
        log(f"  - localStorage['daily_dive_category_detail_view']: '{global_pref_re_expanded}'")
        log(f"  - localStorage['daily_dive_expanded_groups']: {exp_pref_re_expanded}")

        # Check DOM aria-expanded state on each group's chevron button
        tech_btn_expanded = p2.locator("#category-detailed-view button[aria-label*='Tech group']").get_attribute("aria-expanded")
        money_btn_expanded = p2.locator("#category-detailed-view button[aria-label*='Money & Career group']").get_attribute("aria-expanded")
        mind_btn_expanded = p2.locator("#category-detailed-view button[aria-label*='Mind & Growth group']").get_attribute("aria-expanded")
        world_btn_expanded = p2.locator("#category-detailed-view button[aria-label*='World & Ideas group']").get_attribute("aria-expanded")

        log(f"  - DOM chevron states: Tech={tech_btn_expanded}, Money={money_btn_expanded}, Mind={mind_btn_expanded}, World={world_btn_expanded}")

        assert is_detailed_re_expanded and global_pref_re_expanded == 'true', "ASSERTION ERROR: Re-expanded detailed view failed"
        assert exp_obj_re.get("tech") is False and exp_obj_re.get("mind-growth") is False, "ASSERTION ERROR: Per-group chevron state reset after round-trip!"
        assert exp_obj_re.get("money-career") is True and exp_obj_re.get("world-ideas") is True, "ASSERTION ERROR: Other groups should remain expanded"
        assert tech_btn_expanded == "false" and mind_btn_expanded == "false", "ASSERTION ERROR: Tech/Mind DOM chevron not collapsed"
        assert money_btn_expanded == "true" and world_btn_expanded == "true", "ASSERTION ERROR: Money/World DOM chevron not expanded"

        # Capture Screenshot: Round-trip Re-expanded View
        shot_re_expanded = os.path.join(AFTER_DIR, "05_filter_detailed_re_expanded_round_trip.png")
        p2.screenshot(path=shot_re_expanded, full_page=False)
        log(f"  [OK] Captured Screenshot: {shot_re_expanded}")
        log("  [OK] ROUND-TRIP VERIFIED: Global collapse -> re-expand perfectly preserves individual chevron states!")

        ctx2.close()
        browser.close()

    log("\n=================================================================")
    log("  ALL PHASE 8 SCOPED VERIFICATIONS PASSED WITH 100% ACCURACY!    ")
    log("=================================================================")
    return log_entries

if __name__ == "__main__":
    run_scoped_phase8_verification()
