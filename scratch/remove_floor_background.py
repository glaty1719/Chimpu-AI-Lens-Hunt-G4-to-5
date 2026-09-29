from PIL import Image, ImageFilter
from collections import deque

def remove_floor_background():
    img = Image.open('public/assets/obj_vacuum_robot.png').convert('RGBA')
    w, h = img.size
    pix = img.load()

    # Step 1: Identify background seed pixels from the outer border
    # A pixel is background if it's already transparent (a < 50) OR if it is light background/floor shadow (lum > 150)
    def is_background_seed(x, y):
        r, g, b, a = pix[x, y]
        if a < 30:
            return True
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        # If it's near the bottom/right and is light grey floor shadow
        if lum > 160:
            # Check it's not the cyan light or white specular logo on the robot
            # The robot is dark (lum < 130) except specular highlights which are inside the dark body
            return True
        return False

    # Flood fill to find all connected background pixels
    visited = set()
    queue = deque()

    # Add all border pixels to queue if they qualify
    for x in range(w):
        if is_background_seed(x, 0):
            queue.append((x, 0))
            visited.add((x, 0))
        if is_background_seed(x, h - 1):
            queue.append((x, h - 1))
            visited.add((x, h - 1))

    for y in range(h):
        if is_background_seed(0, y):
            queue.append((0, y))
            visited.add((0, y))
        if is_background_seed(w - 1, y):
            queue.append((w - 1, y))
            visited.add((w - 1, y))

    # Also add the bottom corners
    for y in range(h - 40, h):
        for x in range(w):
            if (x, y) not in visited and is_background_seed(x, y):
                queue.append((x, y))
                visited.add((x, y))

    # Also add right side floor area (x > 750, y > 350)
    for y in range(350, h):
        for x in range(750, w):
            if (x, y) not in visited and is_background_seed(x, y):
                queue.append((x, y))
                visited.add((x, y))

    while queue:
        cx, cy = queue.popleft()
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                r, g, b, a = pix[nx, ny]
                lum = 0.299 * r + 0.587 * g + 0.114 * b
                
                # Check if this neighbor is background floor/shadow
                # Background floor has lum > 140 or is already transparent
                if a < 50 or lum > 135:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
                elif lum > 90 and cy > 520: # Bottom shadow transition
                    # Check if it's outside the dark tire/bumper
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    # Create new image with transparent background
    cleaned = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    cpix = cleaned.load()

    for y in range(h):
        for x in range(w):
            if (x, y) not in visited:
                r, g, b, a = pix[x, y]
                # Check for semi-transparent anti-aliasing near visited border
                cpix[x, y] = (r, g, b, a)

    # Let's crop tight to the robot's actual bounding box
    bbox = cleaned.getbbox()
    if bbox:
        # Add small 6px padding
        x0 = max(0, bbox[0] - 6)
        y0 = max(0, bbox[1] - 6)
        x1 = min(w, bbox[2] + 6)
        y1 = min(h, bbox[3] + 6)
        cleaned = cleaned.crop((x0, y0, x1, y1))

    cleaned.save('scratch/clean_vacuum.png')
    print(f'Cleaned vacuum saved with size {cleaned.size}')

if __name__ == '__main__':
    remove_floor_background()
