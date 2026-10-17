import urllib.request
import re
import os

def main():
    fonts_dir = os.path.abspath(os.path.join('public', 'fonts'))
    os.makedirs(fonts_dir, exist_ok=True)

    # Google Fonts CSS URLs (with modern user agent to get woff2)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    font_css_url = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400..800;1,6..72,400..800&display=swap'

    req = urllib.request.Request(font_css_url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        css_content = resp.read().decode('utf-8')

    # Parse @font-face blocks
    blocks = re.findall(r'@font-face\s*\{([^}]+)\}', css_content)
    print(f"Found {len(blocks)} @font-face blocks in Google Fonts CSS.")

    local_font_faces = []
    downloaded_files = {}

    for b in blocks:
        # Check if it is latin subset (or ignore non-latin)
        # Google fonts comments indicate /* latin */ above block, or unicode-range
        if 'unicode-range' in b:
            # Check for basic latin U+0000-00FF
            if not ('U+0000-00FF' in b or 'U+0100-02AF' in b or 'U+00??' in b):
                continue

        family_m = re.search(r'font-family:\s*[\'"]?([^\'";]+)[\'"]?', b)
        style_m = re.search(r'font-style:\s*([^;]+);', b)
        weight_m = re.search(r'font-weight:\s*([^;]+);', b)
        url_m = re.search(r'url\((https://[^\)]+\.woff2)\)', b)
        unicode_m = re.search(r'unicode-range:\s*([^;]+);', b)

        if not (family_m and url_m):
            continue

        family = family_m.group(1).strip()
        style = style_m.group(1).strip() if style_m else 'normal'
        weight = weight_m.group(1).strip() if weight_m else '400'
        remote_url = url_m.group(1).strip()
        unicode_range = unicode_m.group(1).strip() if unicode_m else None

        # Clean local filename
        clean_fam = family.lower().replace(' ', '-')
        clean_weight = weight.replace(' ', '')
        local_filename = f"{clean_fam}-{style}-{clean_weight}.woff2"
        local_path = os.path.join(fonts_dir, local_filename)

        if local_filename not in downloaded_files:
            print(f"Downloading {family} ({style} {weight}) -> {local_filename}...")
            urllib.request.urlretrieve(remote_url, local_path)
            downloaded_files[local_filename] = True

        font_face = [
            "@font-face {",
            f"  font-family: '{family}';",
            f"  font-style: {style};",
            f"  font-weight: {weight};",
            "  font-display: swap;",
            f"  src: url('/fonts/{local_filename}') format('woff2');"
        ]
        if unicode_range:
            font_face.append(f"  unicode-range: {unicode_range};")
        font_face.append("}")
        local_font_faces.append("\n".join(font_face))

    # Write fonts.css
    css_out_path = os.path.abspath(os.path.join('src', 'styles', 'fonts.css'))
    os.makedirs(os.path.dirname(css_out_path), exist_ok=True)
    with open(css_out_path, 'w', encoding='utf-8') as f:
        f.write("/* Self-Hosted Local Fonts (Inter, Newsreader, JetBrains Mono) */\n\n")
        f.write("\n\n".join(local_font_faces))
        f.write("\n")

    print(f"\n[SUCCESS]: Downloaded {len(downloaded_files)} font files to {fonts_dir} and wrote {css_out_path}")

if __name__ == '__main__':
    main()
