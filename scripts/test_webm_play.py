import os
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.on("console", lambda m: print("CONSOLE:", m.text, flush=True))
    page.goto('http://localhost:5173')
    video_path = os.path.abspath('tests/fixtures/lecture_microservices.mp4')
    
    # Check if chromium can play video_path directly
    res = page.evaluate("""async () => {
        const v = document.createElement('video');
        return {
            mp4: v.canPlayType('video/mp4'),
            h264: v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'),
            webm: v.canPlayType('video/webm; codecs="vp8, vorbis"')
        };
    }""")
    print("Can play types:", res, flush=True)
    browser.close()
