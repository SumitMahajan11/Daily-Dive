import asyncio
import os
from playwright.async_api import async_playwright

async def capture_all():
    os.makedirs("screenshots_round6/screens", exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        for theme in ['light', 'dark']:
            for width, height, viewName in [(390, 844, 'mobile-390'), (1440, 900, 'desktop-1440')]:
                context = await browser.new_context(viewport={"width": width, "height": height})
                page = await context.new_page()

                await page.goto("http://localhost:5173")
                await page.evaluate(f"""() => {{
                    localStorage.setItem('daily-dive-theme', '{theme}');
                    localStorage.setItem('daily_dive_onboarding_seen', 'true');
                }}""")
                await page.reload()
                await page.wait_for_timeout(600)

                for section in ['spin', 'library', 'progress', 'settings']:
                    # Scroll to section
                    await page.evaluate(f"document.getElementById('{section}')?.scrollIntoView()")
                    await page.wait_for_timeout(400)
                    path = f"screenshots_round6/screens/{viewName}_{theme}_{section}.png"
                    await page.screenshot(path=path, full_page=False)
                    print(f"Captured {path}")

                await context.close()

        await browser.close()

if __name__ == '__main__':
    asyncio.run(capture_all())
