from PIL import Image, ImageFilter
from collections import deque

def extract_smart_speaker():
    src_path = 'public/assets/obj_smart_speaker.png'
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size
    pix = img.load()

    # Step 1: Detect all background & table pixels connected to the borders
    visited = set()
    queue = deque()

    # Add all 4 borders as initial seeds
    for x in range(w):
        visited.add((x, 0))
        queue.append((x, 0))
        visited.add((x, h - 1))
        queue.append((x, h - 1))

    for y in range(h):
        visited.add((0, y))
        queue.append((0, y))
        visited.add((w - 1, y))
        queue.append((w - 1, y))

    # Add bottom table surface seeds (y > 2615)
    for y in range(2615, h):
        for x in range(w):
            if (x, y) not in visited:
                visited.add((x, y))
                queue.append((x, y))

    # Flood fill outer background & table surface
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                r, g, b, a = pix[nx, ny]
                lum = 0.299 * r + 0.587 * g + 0.114 * b
                
                is_speaker = False
                if (120 <= nx <= 1400) and (258 <= ny <= 2605):
                    is_cyan = (g > 130 and b > 130 and r < 120)
                    if lum < 100 or is_cyan:
                        is_speaker = True
                    elif 2500 <= ny <= 2605 and lum < 126: # Bottom metallic base
                        is_speaker = True
                    elif 260 <= ny <= 380 and lum < 120: # Top dome controls
                        is_speaker = True

                if not is_speaker:
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

    dest_path = 'public/assets/obj_smart_speaker.png'
    cleaned.save(dest_path)
    print(f'Successfully saved transparent smart speaker to {dest_path} with size {cleaned.size}')

if __name__ == '__main__':
    extract_smart_speaker()
