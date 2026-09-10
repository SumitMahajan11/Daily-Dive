from PIL import Image, ImageDraw
import os

def create_pwa_icon(size, filename, maskable=False):
    img = Image.new("RGBA", (size, size), (17, 19, 27, 255)) # #11131b dark background
    draw = ImageDraw.Draw(img)
    
    center = size / 2
    radius = size * 0.38
    
    # Outer glowing ring
    for i in range(int(size * 0.04), 0, -1):
        alpha = int(30 * (1 - i / (size * 0.04)))
        ring_r = radius + i
        draw.ellipse(
            [center - ring_r, center - ring_r, center + ring_r, center + ring_r],
            outline=(94, 106, 210, alpha), # #5e6ad2
            width=2
        )

    # Main circular wheel ring
    draw.ellipse(
        [center - radius, center - radius, center + radius, center + radius],
        outline=(94, 106, 210, 255),
        width=int(max(2, size * 0.03))
    )
    
    # Inner wheel ring
    inner_r = radius * 0.65
    draw.ellipse(
        [center - inner_r, center - inner_r, center + inner_r, center + inner_r],
        outline=(189, 194, 255, 180), # #bdc2ff
        width=int(max(1, size * 0.015))
    )
    
    # Hub center
    hub_r = radius * 0.25
    draw.ellipse(
        [center - hub_r, center - hub_r, center + hub_r, center + hub_r],
        fill=(94, 106, 210, 255),
        outline=(189, 194, 255, 255),
        width=int(max(1, size * 0.02))
    )
    
    # 4 Roulette segments / markers
    num_spokes = 8
    import math
    for spoke in range(num_spokes):
        angle = spoke * (2 * math.pi / num_spokes)
        x1 = center + math.cos(angle) * (hub_r * 1.1)
        y1 = center + math.sin(angle) * (hub_r * 1.1)
        x2 = center + math.cos(angle) * (radius * 0.95)
        y2 = center + math.sin(angle) * (radius * 0.95)
        
        color = (189, 194, 255, 220) if spoke % 2 == 0 else (94, 106, 210, 160)
        draw.line([(x1, y1), (x2, y2)], fill=color, width=int(max(1, size * 0.015)))

    # Sparkle / dice dot in center
    dot_r = size * 0.03
    draw.ellipse(
        [center - dot_r, center - dot_r, center + dot_r, center + dot_r],
        fill=(255, 255, 255, 255)
    )

    os.makedirs('public', exist_ok=True)
    os.makedirs('icons', exist_ok=True)
    img.save(filename, "PNG")
    print(f"Saved {filename}")

create_pwa_icon(192, "icons/icon-192.png")
create_pwa_icon(512, "icons/icon-512.png")
create_pwa_icon(192, "icons/icon-192-maskable.png", maskable=True)
create_pwa_icon(512, "icons/icon-512-maskable.png", maskable=True)
create_pwa_icon(192, "public/icon-192.png")
create_pwa_icon(512, "public/icon-512.png")
