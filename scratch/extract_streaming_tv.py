from PIL import Image, ImageFilter
from collections import deque

def extract_streaming_tv():
    src_path = 'public/assets/obj_streaming_tv.png'
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size
    pix = img.load()

    # Step 1: Detect all background pixels connected to the borders
    visited = set()
    queue = deque()

    # Add seeds from 4 outer borders where max(r,g,b) <= 15 or alpha < 30
    for x in range(w):
        if pix[x, 0][3] < 30 or max(pix[x, 0][:3]) <= 15:
            queue.append((x, 0))
            visited.add((x, 0))
        if pix[x, h - 1][3] < 30 or max(pix[x, h - 1][:3]) <= 15:
            queue.append((x, h - 1))
            visited.add((x, h - 1))

    for y in range(h):
        if pix[0, y][3] < 30 or max(pix[0, y][:3]) <= 15:
            queue.append((0, y))
            visited.add((0, y))
        if pix[w - 1, y][3] < 30 or max(pix[w - 1, y][:3]) <= 15:
            queue.append((w - 1, y))
            visited.add((w - 1, y))

    # Flood fill outer background
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                r, g, b, a = pix[nx, ny]
                if a < 50 or max(r, g, b) <= 15:
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

    dest_path = 'public/assets/obj_streaming_tv.png'
    cleaned.save(dest_path)
    print(f'Successfully saved transparent streaming TV to {dest_path} with size {cleaned.size}')

if __name__ == '__main__':
    extract_streaming_tv()
