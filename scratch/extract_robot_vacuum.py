from PIL import Image, ImageFilter
from collections import deque

def extract_robot_vacuum_no_floor():
    src_path = 'public/assets/obj_robot_vacuum.png'
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size
    pix = img.load()

    # Step 1: Detect all background & floor pixels connected to the borders
    visited = set()
    queue = deque()

    # 1. Outer border seeds
    for x in range(w):
        if pix[x, 0][3] < 30 or max(pix[x, 0][:3]) < 20:
            visited.add((x, 0))
            queue.append((x, 0))
        if pix[x, h - 1][3] < 30 or max(pix[x, h - 1][:3]) < 20 or pix[x, h - 1][0] > 140:
            visited.add((x, h - 1))
            queue.append((x, h - 1))

    for y in range(h):
        if pix[0, y][3] < 30 or max(pix[0, y][:3]) < 20:
            visited.add((0, y))
            queue.append((0, y))
        if pix[w - 1, y][3] < 30 or max(pix[w - 1, y][:3]) < 20:
            visited.add((w - 1, y))
            queue.append((w - 1, y))

    # 2. Add light floor area pixels (lum > 135 and y > 1000) as floor seeds
    for y in range(1000, h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if a < 30 or lum > 135:
                if (x, y) not in visited:
                    visited.add((x, y))
                    queue.append((x, y))

    # 3. Add bottom floor/shadow area (y > 1640)
    for y in range(1640, h):
        for x in range(w):
            if (x, y) not in visited:
                visited.add((x, y))
                queue.append((x, y))

    # Flood fill all connected floor background & shadow pixels
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                r, g, b, a = pix[nx, ny]
                lum = 0.299 * r + 0.587 * g + 0.114 * b
                
                # Floor background condition
                if a < 50:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
                elif max(r, g, b) <= 18:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
                elif cy > 1000 and lum > 125: # Floor reflection
                    visited.add((nx, ny))
                    queue.append((nx, ny))
                elif cy > 1600 and lum < 45: # Bottom shadow
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    # Step 2: Build high-precision alpha mask
    mask = Image.new('L', (w, h), 255)
    mpix = mask.load()
    for (x, y) in visited:
        mpix[x, y] = 0

    # Sub-pixel smoothing on the mask edge for clean anti-aliasing
    smooth_mask = mask.filter(ImageFilter.GaussianBlur(0.8))

    # Step 3: Composite transparent image
    cleaned = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    cleaned = Image.composite(img, cleaned, smooth_mask)

    # Crop tightly to content
    bbox = cleaned.getbbox()
    if bbox:
        cleaned = cleaned.crop(bbox)

    dest_path = 'public/assets/obj_robot_vacuum.png'
    cleaned.save(dest_path)
    print(f'Successfully saved floor-free transparent robot vacuum to {dest_path} with size {cleaned.size}')

if __name__ == '__main__':
    extract_robot_vacuum_no_floor()
