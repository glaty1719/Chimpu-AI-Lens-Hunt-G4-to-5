import sys
from PIL import Image, ImageFilter

src_path = "/home/slackup/.gemini/antigravity-ide/brain/02057d2a-e396-47df-933a-bba43c82eaf0/cartoon_smart_fridge_1790668998446.jpg"
out_path1 = "/home/slackup/WebstormProjects/Chimpu-AI-Lens-Hunt-G4-to-5/public/assets/prop_fridge.png"
out_path2 = "/home/slackup/WebstormProjects/Chimpu-AI-Lens-Hunt-G4-to-5/public/assets/obj_smart_fridge.png"

img = Image.open(src_path).convert("RGBA")
w, h = img.size
pix = img.load()

# Create a mask for background using BFS flood-fill from all 4 corners / borders
visited = [[False] * h for _ in range(w)]
queue = []

def is_white_bg(r, g, b):
    # Check if pixel is pure/near white (background)
    return r > 235 and g > 235 and b > 235

# Seed borders
for x in range(w):
    for y in [0, h - 1]:
        r, g, b, a = pix[x, y]
        if is_white_bg(r, g, b) and not visited[x][y]:
            visited[x][y] = True
            queue.append((x, y))

for y in range(h):
    for x in [0, w - 1]:
        r, g, b, a = pix[x, y]
        if is_white_bg(r, g, b) and not visited[x][y]:
            visited[x][y] = True
            queue.append((x, y))

# BFS
head = 0
while head < len(queue):
    cx, cy = queue[head]
    head += 1
    
    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nx, ny = cx + dx, cy + dy
        if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
            r, g, b, a = pix[nx, ny]
            if is_white_bg(r, g, b):
                visited[nx][ny] = True
                queue.append((nx, ny))

# Apply alpha transparency to visited background pixels
for x in range(w):
    for y in range(h):
        if visited[x][y]:
            r, g, b, a = pix[x, y]
            pix[x, y] = (r, g, b, 0)

# Smooth edges slightly
bbox = img.getbbox()
if bbox:
    # Add 10px padding if possible
    x0 = max(0, bbox[0] - 8)
    y0 = max(0, bbox[1] - 8)
    x1 = min(w, bbox[2] + 8)
    y1 = min(h, bbox[3] + 8)
    img = img.crop((x0, y0, x1, y1))

img.save(out_path1, "PNG")
img.save(out_path2, "PNG")
print(f"Successfully processed cartoon smart fridge with pure PIL! Saved to {out_path1} ({img.size})")
