from PIL import Image, ImageFilter
from collections import deque

def remove_speaker_floor():
    img = Image.open('public/assets/obj_smart_speaker.png').convert('RGBA')
    w, h = img.size
    pix = img.load()

    # Step 1: Detect background pixels
    def is_bg(x, y):
        r, g, b, a = pix[x, y]
        if a < 40:
            return True
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        # If it's bright/grey floor background or shadow
        if lum > 140:
            return True
        return False

    visited = set()
    queue = deque()

    # Seed from all 4 borders
    for x in range(w):
        if is_bg(x, 0):
            queue.append((x, 0))
            visited.add((x, 0))
        if is_bg(x, h - 1):
            queue.append((x, h - 1))
            visited.add((x, h - 1))

    for y in range(h):
        if is_bg(0, y):
            queue.append((0, y))
            visited.add((0, y))
        if is_bg(w - 1, y):
            queue.append((w - 1, y))
            visited.add((w - 1, y))

    # Also add bottom shadow area
    for y in range(h - 30, h):
        for x in range(w):
            if (x, y) not in visited and is_bg(x, y):
                queue.append((x, y))
                visited.add((x, y))

    # Also add lower right floor shadow area (x > 380, y > 680)
    for y in range(680, h):
        for x in range(380, w):
            if (x, y) not in visited and is_bg(x, y):
                queue.append((x, y))
                visited.add((x, y))

    # Also add lower left floor shadow area (x < 80, y > 680)
    for y in range(680, h):
        for x in range(80):
            if (x, y) not in visited and is_bg(x, y):
                queue.append((x, y))
                visited.add((x, y))

    while queue:
        cx, cy = queue.popleft()
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                r, g, b, a = pix[nx, ny]
                lum = 0.299 * r + 0.587 * g + 0.114 * b
                
                # Check if neighbor is background floor / shadow
                if a < 40 or lum > 125:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
                elif lum > 80 and cy > 720: # Floor shadow transition near bottom base
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    # Build cleaned image
    cleaned = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    cpix = cleaned.load()

    for y in range(h):
        for x in range(w):
            if (x, y) not in visited:
                r, g, b, a = pix[x, y]
                cpix[x, y] = (r, g, b, a)

    # Tight crop with 4px padding
    bbox = cleaned.getbbox()
    if bbox:
        x0 = max(0, bbox[0] - 4)
        y0 = max(0, bbox[1] - 4)
        x1 = min(w, bbox[2] + 4)
        y1 = min(h, bbox[3] + 4)
        cleaned = cleaned.crop((x0, y0, x1, y1))

    cleaned.save('scratch/clean_speaker.png')
    print(f'Cleaned smart speaker saved with size {cleaned.size}')

if __name__ == '__main__':
    remove_speaker_floor()
