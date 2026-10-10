import asyncio
import os
from playwright.async_api import async_playwright

async def main():
    roadmap_path = r"d:\Projects\Reverse\docs\ROADMAP.md"
    os.makedirs("screenshots_round6", exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        for width, height, name in [(390, 844, "mobile-390"), (1440, 900, "desktop-1440")]:
            context = await browser.new_context(viewport={"width": width, "height": height})
            page = await context.new_page()

            # Enable local storage onboarding skip
            await page.goto("http://localhost:5173")
            await page.evaluate("""() => {
                localStorage.setItem('daily_dive_onboarding_seen', 'true');
            }""")
            await page.reload()
            await page.wait_for_selector("#library", state="visible")

            # Scroll to library section
            await page.evaluate("document.getElementById('library').scrollIntoView()")
            await page.wait_for_timeout(500)

            # Click Upload & Extract tab if needed
            extract_tab = page.locator("button:has-text('Upload & Extract')")
            if await extract_tab.count() > 0:
                await extract_tab.first.click()
                await page.wait_for_timeout(300)

            # Set input file via file chooser
            file_input = page.locator("input[type='file']").first
            await file_input.set_input_files(roadmap_path)
            await page.wait_for_timeout(1500)

            # Screenshot review list
            screenshot_path = f"screenshots_round6/review_list_{name}.png"
            await page.screenshot(path=screenshot_path, full_page=False)
            print(f"Captured {screenshot_path}")

            await context.close()

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
