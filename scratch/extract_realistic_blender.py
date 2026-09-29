from PIL import Image, ImageFilter
from collections import deque

def extract_realistic_blender():
    jpg_path = '/home/slackup/.gemini/antigravity-ide/brain/030946f4-9bdf-438f-8fa4-a1f59790c3dd/realistic_blender_1790654210445.jpg'
    img = Image.open(jpg_path).convert('RGBA')
    w, h = img.size
    pix = img.load()

    # Step 1: Detect background from outer borders
    visited = set()
    queue = deque()

    # Outer border seeds
    for x in range(w):
        if min(pix[x, 0][:3]) > 230:
            queue.append((x, 0))
            visited.add((x, 0))
        if min(pix[x, h - 1][:3]) > 220:
            queue.append((x, h - 1))
            visited.add((x, h - 1))

    for y in range(h):
        if min(pix[0, y][:3]) > 230:
            queue.append((0, y))
            visited.add((0, y))
        if min(pix[w - 1, y][:3]) > 230:
            queue.append((w - 1, y))
            visited.add((w - 1, y))

    # Also seed handle loop interior
    handle_seeds = [(655, 300), (660, 310), (650, 350), (655, 275)]
    for hx, hy in handle_seeds:
        if min(pix[hx, hy][:3]) > 230:
            queue.append((hx, hy))
            visited.add((hx, hy))

    while queue:
        cx, cy = queue.popleft()
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                r, g, b, _ = pix[nx, ny]
                min_rgb = min(r, g, b)
                
                # Check if this pixel is white/light-grey background
                if min_rgb > 235:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
                elif min_rgb > 210 and (cy > 1120 or cy < 100): # Top cap or bottom floor shadow
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    # Build alpha channel
    cleaned = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    cpix = cleaned.load()

    for y in range(h):
        for x in range(w):
            r, g, b, _ = pix[x, y]
            if (x, y) not in visited:
                # Inside blender
                min_rgb = min(r, g, b)
                # Check if this is the glass area of the pitcher (y: 120 to 620, x: 250 to 650)
                # In the clear glass area, we can give a slight realistic transparency to pure white areas
                if 140 <= y <= 600 and 260 <= x <= 620:
                    if min_rgb > 245:
                        # Semi-transparent glass body
                        alpha = int(255 - (min_rgb - 245) * 18)
                        alpha = max(110, min(255, alpha))
                        cpix[x, y] = (r, g, b, alpha)
                    else:
                        cpix[x, y] = (r, g, b, 255)
                else:
                    cpix[x, y] = (r, g, b, 255)

    # Tight crop to content with 4px margin
    bbox = cleaned.getbbox()
    if bbox:
        x0 = max(0, bbox[0] - 4)
        y0 = max(0, bbox[1] - 4)
        x1 = min(w, bbox[2] + 4)
        y1 = min(h, bbox[3] + 4)
        cleaned = cleaned.crop((x0, y0, x1, y1))

    cleaned.save('public/assets/obj_blender.png')
    print(f'Saved public/assets/obj_blender.png with size {cleaned.size}')

if __name__ == '__main__':
    extract_realistic_blender()
