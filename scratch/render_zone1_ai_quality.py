import math
from PIL import Image, ImageDraw, ImageFilter

def save_supersampled(img, path, max_dim=1200):
    bbox = img.getbbox()
    if bbox:
        w, h = img.size
        x0 = max(0, bbox[0] - 6)
        y0 = max(0, bbox[1] - 6)
        x1 = min(w, bbox[2] + 6)
        y1 = min(h, bbox[3] + 6)
        img = img.crop((x0, y0, x1, y1))
    
    w, h = img.size
    scale = min(1.0, max_dim / max(w, h))
    if scale < 1.0:
        target_w = int(w * scale)
        target_h = int(h * scale)
        img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    img.save(path)
    print(f"Saved {path} with size {img.size}")

# 1. SMARTPHONE FACE UNLOCK (Zone 1 AI Target)
def render_phone_face():
    W, H = 2200, 3800
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    
    # Drop shadow
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([140, 120, 2060, 3680], radius=190, fill=(0, 0, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(30))
    img = Image.alpha_composite(img, shadow)
    d = ImageDraw.Draw(img)
    
    # Outer Titanium Frame with Metallic Edge
    d.rounded_rectangle([150, 100, 2050, 3650], radius=180, fill=(30, 35, 45, 255), outline=(130, 145, 165, 255), width=22)
    # Inner Bezel
    d.rounded_rectangle([190, 140, 2010, 3610], radius=150, fill=(12, 16, 24, 255), outline=(60, 70, 85, 255), width=10)
    
    # Active 8K AMOLED Screen (OLED Pure Black to Deep Navy)
    d.rounded_rectangle([210, 160, 1990, 3590], radius=135, fill=(6, 10, 20, 255))
    
    # Dynamic Island / Front Camera Sensor
    d.rounded_rectangle([860, 180, 1340, 270], radius=45, fill=(0, 0, 0, 255))
    d.ellipse([1240, 205, 1290, 245], fill=(10, 25, 50, 255), outline=(0, 200, 255, 255), width=4)
    
    # Holographic Biometric Glowing Field
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([400, 800, 1800, 2200], fill=(0, 220, 255, 55))
    gd.ellipse([600, 1000, 1600, 1800], fill=(0, 255, 180, 45))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)
    
    # 3D Facial Landmark Polygon Mesh
    cx, cy = 1100, 1480
    # Head Oval Reticle
    d.ellipse([cx - 480, cy - 640, cx + 480, cy + 540], outline=(0, 220, 255, 190), width=10)
    d.ellipse([cx - 520, cy - 680, cx + 520, cy + 580], outline=(0, 255, 180, 100), width=4)
    
    mesh_points = [
        (cx - 260, cy - 240), (cx + 260, cy - 240), # Eyes
        (cx - 180, cy - 380), (cx, cy - 450), (cx + 180, cy - 380), # Forehead
        (cx, cy - 40), # Nose Bridge
        (cx - 110, cy + 90), (cx, cy + 130), (cx + 110, cy + 90), # Nose Tip
        (cx - 220, cy + 280), (cx, cy + 340), (cx + 220, cy + 280), # Mouth
        (cx - 390, cy - 90), (cx + 390, cy - 90), # Cheeks
        (cx - 300, cy + 450), (cx, cy + 510), (cx + 300, cy + 450) # Jawline
    ]
    
    for i, p1 in enumerate(mesh_points):
        for j, p2 in enumerate(mesh_points):
            dist = math.hypot(p1[0]-p2[0], p1[1]-p2[1])
            if 0 < dist < 450:
                d.line([p1, p2], fill=(0, 255, 230, 160), width=5)
    
    for px, py in mesh_points:
        d.ellipse([px - 26, py - 26, px + 26, py + 26], fill=(0, 255, 200, 255), outline=(255, 255, 255, 255), width=8)
    
    # Glowing Unlocked Padlock (Top Center)
    d.arc([cx - 95, 520, cx + 95, 710], start=180, end=360, fill=(0, 255, 160, 255), width=20)
    d.rounded_rectangle([cx - 120, 620, cx + 120, 820], radius=35, fill=(0, 230, 140, 255), outline=(255, 255, 255, 255), width=10)
    d.ellipse([cx - 28, 685, cx + 28, 740], fill=(10, 30, 25, 255))
    d.line([(cx, 730), (cx, 770)], fill=(10, 30, 25, 255), width=10)
    
    # "FACE RECOGNIZED - UNLOCKED" Banner
    d.rounded_rectangle([380, 2300, 1820, 2580], radius=55, fill=(0, 200, 130, 245), outline=(0, 255, 180, 255), width=12)
    d.rectangle([500, 2400, 1700, 2480], fill=(255, 255, 255, 255))
    
    # AI Neural Profile Tag
    d.rounded_rectangle([520, 2680, 1680, 2840], radius=45, fill=(20, 35, 60, 240), outline=(0, 220, 255, 255), width=8)
    d.rectangle([600, 2740, 1600, 2780], fill=(0, 220, 255, 255))
    
    # Specular Glass Sheen Streak
    refl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(refl)
    rd.polygon([(400, 160), (1100, 160), (700, 3590), (210, 3590)], fill=(255, 255, 255, 35))
    img = Image.alpha_composite(img, refl)
    
    save_supersampled(img, 'public/assets/obj_phone_face.png', 1000)

# 2. TOASTER (Zone 1 Decoy)
def render_toaster():
    W, H = 2600, 2200
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    
    # Drop shadow
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse([250, 1750, 2350, 2100], fill=(0, 0, 0, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(35))
    img = Image.alpha_composite(img, shadow)
    d = ImageDraw.Draw(img)
    
    # Golden Toasted Bread Slices
    for tx in [580, 1420]:
        d.rounded_rectangle([tx, 160, tx + 600, 1050], radius=90, fill=(220, 155, 85, 255), outline=(150, 90, 40, 255), width=18)
        # Golden crust highlights
        d.rounded_rectangle([tx + 30, 185, tx + 570, 480], radius=70, fill=(195, 120, 55, 255))
        for by in range(320, 950, 100):
            d.line([(tx + 90, by), (tx + 510, by)], fill=(165, 98, 42, 180), width=20)
    
    # Main Chrome Toaster Body
    d.rounded_rectangle([260, 680, 2340, 1880], radius=180, fill=(232, 240, 250, 255), outline=(140, 150, 165, 255), width=26)
    # Shiny metallic reflection strokes
    for x in range(320, 2280, 45):
        d.line([(x, 700), (x, 1860)], fill=(255, 255, 255, 38), width=18)
    
    # Top Slots
    d.rounded_rectangle([520, 650, 1220, 760], radius=35, fill=(45, 50, 60, 255), outline=(110, 120, 135, 255), width=12)
    d.rounded_rectangle([1360, 650, 2060, 760], radius=35, fill=(45, 50, 60, 255), outline=(110, 120, 135, 255), width=12)
    
    # Chrome Side Lever
    d.rounded_rectangle([2320, 980, 2560, 1140], radius=40, fill=(40, 45, 55, 255), outline=(170, 180, 195, 255), width=10)
    d.rectangle([2160, 1030, 2330, 1080], fill=(160, 170, 185, 255))
    
    # Dial
    cx, cy = 1300, 1360
    d.ellipse([cx - 200, cy - 200, cx + 200, cy + 200], fill=(60, 68, 80, 255), outline=(190, 200, 215, 255), width=20)
    d.ellipse([cx - 150, cy - 150, cx + 150, cy + 150], fill=(225, 232, 242, 255))
    d.line([(cx, cy), (cx + 80, cy - 80)], fill=(235, 60, 40, 255), width=18)
    
    # Rubber Feet
    d.rounded_rectangle([450, 1860, 780, 1980], radius=35, fill=(35, 40, 50, 255))
    d.rounded_rectangle([1820, 1860, 2150, 1980], radius=35, fill=(35, 40, 50, 255))
    
    # Specular Chrome Highlights
    refl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(refl)
    rd.polygon([(650, 680), (1150, 680), (800, 1880), (300, 1880)], fill=(255, 255, 255, 80))
    img = Image.alpha_composite(img, refl)
    
    save_supersampled(img, 'public/assets/obj_toaster.png', 1000)

# 3. LAMP SWITCH (Zone 1 Decoy)
def render_lamp_switch():
    W, H = 2200, 3400
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    
    # Lampshade (Textured Warm Linen)
    d.polygon([(700, 320), (1500, 320), (1950, 1300), (250, 1300)], fill=(248, 238, 215, 255), outline=(200, 180, 145, 255))
    d.ellipse([250, 1200, 1950, 1400], fill=(255, 248, 200, 255), outline=(200, 180, 145, 255), width=18)
    
    # Warm Radial Light Cone
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.polygon([(250, 1300), (1950, 1300), (2150, 2900), (50, 2900)], fill=(255, 240, 170, 50))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)
    
    # Brass Stem
    d.rectangle([1030, 1400, 1170, 2800], fill=(220, 180, 80, 255), outline=(160, 125, 45, 255), width=10)
    
    # Physical Rocker Switch Unit
    d.rounded_rectangle([920, 1880, 1280, 2220], radius=35, fill=(40, 45, 55, 255), outline=(130, 140, 155, 255), width=10)
    d.polygon([(970, 1940), (1230, 1940), (1190, 2080), (940, 2080)], fill=(235, 55, 45, 255))
    d.rectangle([(1080, 1960), (1120, 1995)], fill=(255, 255, 255, 255))
    
    # Polished Brass Base
    d.ellipse([480, 2700, 1720, 3100], fill=(210, 170, 65, 255), outline=(150, 115, 38, 255), width=20)
    d.ellipse([580, 2740, 1620, 3030], fill=(240, 200, 100, 255))
    
    save_supersampled(img, 'public/assets/obj_lamp_switch.png', 1000)

# 4. ANALOG CLOCK (Zone 1 Decoy)
def render_analog_clock():
    W, H = 2600, 2600
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    
    # Drop shadow
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse([140, 140, 2460, 2460], fill=(0, 0, 0, 100))
    shadow = shadow.filter(ImageFilter.GaussianBlur(40))
    img = Image.alpha_composite(img, shadow)
    d = ImageDraw.Draw(img)
    
    cx, cy, r = 1300, 1300, 1120
    # Outer Walnut Rim
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(115, 70, 38, 255), outline=(70, 38, 18, 255), width=50)
    # Inner Brass Bezel
    r_brass = 1000
    d.ellipse([cx-r_brass, cy-r_brass, cx+r_brass, cy+r_brass], fill=(230, 190, 85, 255), outline=(165, 130, 50, 255), width=26)
    # Ivory Face
    r_face = 940
    d.ellipse([cx-r_face, cy-r_face, cx+r_face, cy+r_face], fill=(252, 252, 250, 255))
    
    # 60 Minute/Hour Ticks
    for i in range(60):
        angle = math.radians(i * 6)
        is_hour = (i % 5 == 0)
        len_tick = 90 if is_hour else 45
        w_tick = 22 if is_hour else 9
        col_tick = (25, 30, 42, 255) if is_hour else (125, 135, 150, 255)
        
        x1 = cx + math.sin(angle) * (r_face - len_tick - 40)
        y1 = cy - math.cos(angle) * (r_face - len_tick - 40)
        x2 = cx + math.sin(angle) * (r_face - 40)
        y2 = cy - math.cos(angle) * (r_face - 40)
        d.line([(x1, y1), (x2, y2)], fill=col_tick, width=w_tick)
    
    # Hands (10:10)
    h_rad = math.radians(305)
    d.line([(cx - math.sin(h_rad)*90, cy + math.cos(h_rad)*90), (cx + math.sin(h_rad)*520, cy - math.cos(h_rad)*520)], fill=(20, 25, 35, 255), width=42)
    m_rad = math.radians(60)
    d.line([(cx - math.sin(m_rad)*110, cy + math.cos(m_rad)*110), (cx + math.sin(m_rad)*760, cy - math.cos(m_rad)*760)], fill=(20, 25, 35, 255), width=28)
    s_rad = math.radians(120)
    d.line([(cx - math.sin(s_rad)*220, cy + math.cos(s_rad)*220), (cx + math.sin(s_rad)*840, cy - math.cos(s_rad)*840)], fill=(235, 45, 45, 255), width=14)
    
    d.ellipse([cx-55, cy-55, cx+55, cy+55], fill=(230, 190, 85, 255), outline=(40, 45, 55, 255), width=10)
    
    # Glass Dome Convex Reflection
    refl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(refl)
    rd.chord([cx-r_face, cy-r_face, cx+r_face, cy+r_face], start=210, end=330, fill=(255, 255, 255, 48))
    img = Image.alpha_composite(img, refl)
    
    save_supersampled(img, 'public/assets/obj_analog_clock.png', 1000)

# 5. BLENDER (Zone 1 Decoy)
def render_blender():
    W, H = 2200, 3200
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    
    # Glass Pitcher
    d.polygon([(600, 500), (1600, 500), (1440, 2000), (760, 2000)], fill=(215, 238, 252, 195), outline=(135, 180, 215, 255))
    # Glass Handle
    d.arc([1380, 720, 1920, 1680], start=270, end=90, fill=(135, 180, 215, 255), width=70)
    
    # Black Rubber Lid & Clear Cap
    d.rounded_rectangle([520, 360, 1680, 530], radius=40, fill=(35, 40, 50, 255), outline=(15, 20, 28, 255), width=12)
    d.ellipse([980, 250, 1220, 390], fill=(205, 230, 250, 210), outline=(35, 40, 50, 255), width=10)
    
    # Ounce/ML Measurement Lines
    for ty in range(720, 1850, 130):
        d.line([(740, ty), (890, ty)], fill=(95, 145, 185, 255), width=14)
    
    # Stainless Steel Blades
    d.polygon([(1020, 1920), (1180, 1920), (1260, 1810), (940, 1810)], fill=(185, 195, 210, 255))
    
    # Metallic Red Base
    d.rounded_rectangle([560, 1990, 1640, 3020], radius=100, fill=(220, 48, 48, 255), outline=(150, 28, 28, 255), width=26)
    for x in range(600, 1600, 35):
        d.line([(x, 2010), (x, 3000)], fill=(255, 255, 255, 32), width=12)
    
    # Rotary Control Dial
    cx, cy = 1100, 2500
    d.ellipse([cx-165, cy-165, cx+165, cy+165], fill=(45, 50, 60, 255), outline=(205, 215, 230, 255), width=18)
    d.line([(cx, cy), (cx, cy-120)], fill=(255, 255, 255, 255), width=20)
    
    # Rubber Feet
    d.rounded_rectangle([650, 3000, 880, 3110], radius=28, fill=(25, 30, 38, 255))
    d.rounded_rectangle([1320, 3000, 1550, 3110], radius=28, fill=(25, 30, 38, 255))
    
    save_supersampled(img, 'public/assets/obj_blender.png', 1000)

if __name__ == '__main__':
    render_phone_face()
    render_toaster()
    render_lamp_switch()
    render_analog_clock()
    render_blender()
    print("Zone 1 assets rendered successfully!")
