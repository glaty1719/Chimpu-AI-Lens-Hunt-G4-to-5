import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def render_realistic_lamp():
    # 4x supersampling canvas: 2600 x 3400
    W, H = 2600, 3400
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))

    cx = W // 2  # 1300

    # -------------------------------------------------------------------------
    # 1. AMBIENT DOWNWARD LIGHT CONE & GROUND ILLUMINATION
    # -------------------------------------------------------------------------
    light_cone = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    lcd = ImageDraw.Draw(light_cone)

    shade_bottom_y = 1520
    base_bottom_y = 3050

    light_points = [
        (cx - 750, shade_bottom_y + 10),
        (cx + 750, shade_bottom_y + 10),
        (cx + 1180, base_bottom_y + 140),
        (cx - 1180, base_bottom_y + 140)
    ]
    lcd.polygon(light_points, fill=(255, 248, 220, 45))
    
    inner_light_points = [
        (cx - 520, shade_bottom_y + 10),
        (cx + 520, shade_bottom_y + 10),
        (cx + 850, base_bottom_y + 90),
        (cx - 850, base_bottom_y + 90)
    ]
    lcd.polygon(inner_light_points, fill=(255, 238, 185, 60))
    light_cone = light_cone.filter(ImageFilter.GaussianBlur(65))
    canvas = Image.alpha_composite(canvas, light_cone)

    # -------------------------------------------------------------------------
    # 2. BASE GROUND DROP SHADOW
    # -------------------------------------------------------------------------
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse([cx - 780, base_bottom_y - 70, cx + 780, base_bottom_y + 170], fill=(0, 0, 0, 140))
    sd.ellipse([cx - 550, base_bottom_y - 35, cx + 550, base_bottom_y + 115], fill=(0, 0, 0, 170))
    shadow = shadow.filter(ImageFilter.GaussianBlur(35))
    canvas = Image.alpha_composite(canvas, shadow)

    # -------------------------------------------------------------------------
    # 3. WEIGHTED BRASS BASE PEDESTAL
    # -------------------------------------------------------------------------
    base_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(base_layer)

    base_r_x = 720
    base_r_y = 200
    base_top_y = 2820

    # Felt bottom rim
    bd.ellipse([cx - base_r_x - 10, base_top_y + 60 - base_r_y, cx + base_r_x + 10, base_top_y + 60 + base_r_y], fill=(28, 24, 20, 255))

    # Lower Brass Rim
    bd.ellipse([cx - base_r_x, base_top_y + 35 - base_r_y, cx + base_r_x, base_top_y + 35 + base_r_y], fill=(155, 115, 42, 255))
    bd.ellipse([cx - base_r_x + 10, base_top_y + 35 - base_r_y + 6, cx + base_r_x - 10, base_top_y + 35 + base_r_y - 6], fill=(218, 178, 82, 255))

    # Main Upper Bevel Disc
    bd.ellipse([cx - base_r_x + 28, base_top_y - base_r_y, cx + base_r_x - 28, base_top_y + base_r_y], fill=(175, 135, 55, 255))
    bd.ellipse([cx - base_r_x + 38, base_top_y - base_r_y + 8, cx + base_r_x - 38, base_top_y + base_r_y - 8], fill=(238, 198, 98, 255))

    # Radial brass specular reflection lines
    for deg in range(0, 360, 2):
        rad = math.radians(deg)
        intensity = 0.5 + 0.5 * math.cos(rad * 2 - 0.8)
        val = int(160 + 85 * intensity)
        r_c = val
        g_c = int(val * 0.82)
        b_c = int(val * 0.40)
        
        px0 = cx + (base_r_x - 50) * math.cos(rad)
        py0 = base_top_y + (base_r_y - 15) * math.sin(rad)
        px1 = cx + 90 * math.cos(rad)
        py1 = base_top_y + 30 * math.sin(rad)
        bd.line([(px0, py0), (px1, py1)], fill=(r_c, g_c, b_c, 220), width=3)

    # Center Brass Collar
    collar_rx = 145
    collar_ry = 50
    collar_y = base_top_y - 20
    bd.ellipse([cx - collar_rx, collar_y - collar_ry + 15, cx + collar_rx, collar_y + collar_ry + 15], fill=(140, 100, 35, 255))
    bd.ellipse([cx - collar_rx, collar_y - collar_ry, cx + collar_rx, collar_y + collar_ry], fill=(245, 210, 110, 255))
    bd.ellipse([cx - collar_rx + 8, collar_y - collar_ry + 4, cx + collar_rx - 8, collar_y + collar_ry - 4], fill=(190, 150, 60, 255))

    canvas = Image.alpha_composite(canvas, base_layer)

    # -------------------------------------------------------------------------
    # 4. CONTINUOUS BRASS METALLIC STEM / POLE (Clean without button/switch)
    # -------------------------------------------------------------------------
    stem_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    stmd = ImageDraw.Draw(stem_layer)

    stem_w = 100
    stem_x0 = cx - stem_w // 2
    stem_x1 = cx + stem_w // 2
    stem_y0 = 1400
    stem_y1 = base_top_y - 30

    for x in range(stem_x0, stem_x1):
        rel = (x - stem_x0) / stem_w
        light = math.sin(rel * math.pi)
        highlight = math.exp(-((rel - 0.32) ** 2) / 0.02) * 95
        val = int(140 + 80 * light + highlight)
        val = max(100, min(255, val))
        r = val
        g = int(val * 0.82)
        b = int(val * 0.38)
        stmd.line([(x, stem_y0), (x, stem_y1)], fill=(r, g, b, 255), width=1)

    stmd.line([(stem_x0 + 28, stem_y0), (stem_x0 + 28, stem_y1)], fill=(255, 245, 195, 240), width=9)
    stmd.line([(stem_x0 + 34, stem_y0), (stem_x0 + 34, stem_y1)], fill=(255, 255, 230, 255), width=3)
    canvas = Image.alpha_composite(canvas, stem_layer)

    # -------------------------------------------------------------------------
    # 5. E26 BRASS SOCKET HOUSING & INTERNAL BULB
    # -------------------------------------------------------------------------
    socket_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    skd = ImageDraw.Draw(socket_layer)

    sock_w = 160
    sock_x0 = cx - sock_w // 2
    sock_x1 = cx + sock_w // 2
    sock_y0 = 1350
    sock_y1 = 1530

    for x in range(sock_x0, sock_x1):
        rel = (x - sock_x0) / sock_w
        intensity = 0.5 + 0.5 * math.sin(rel * math.pi)
        val = int(140 + 95 * intensity)
        skd.line([(x, sock_y0), (x, sock_y1)], fill=(val, int(val * 0.82), int(val * 0.38), 255), width=1)

    for ry in [sock_y0 + 45, sock_y0 + 90, sock_y0 + 135]:
        skd.line([(sock_x0 + 4, ry), (sock_x1 - 4, ry)], fill=(110, 80, 25, 255), width=4)
        skd.line([(sock_x0 + 4, ry + 2), (sock_x1 - 4, ry + 2)], fill=(255, 225, 120, 255), width=3)

    bulb_cx = cx
    bulb_cy = 1500
    bulb_r = 120

    bulb_glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bgd = ImageDraw.Draw(bulb_glow)
    bgd.ellipse([bulb_cx - 260, bulb_cy - 220, bulb_cx + 260, bulb_cy + 300], fill=(255, 220, 130, 190))
    bgd.ellipse([bulb_cx - 160, bulb_cy - 130, bulb_cx + 160, bulb_cy + 220], fill=(255, 245, 190, 235))
    bulb_glow = bulb_glow.filter(ImageFilter.GaussianBlur(30))
    socket_layer = Image.alpha_composite(socket_layer, bulb_glow)

    skd.ellipse([bulb_cx - bulb_r, bulb_cy - bulb_r, bulb_cx + bulb_r, bulb_cy + bulb_r], fill=(255, 250, 220, 240))
    skd.ellipse([bulb_cx - bulb_r + 15, bulb_cy - bulb_r + 15, bulb_cx + bulb_r - 15, bulb_cy + bulb_r - 15], fill=(255, 255, 245, 255))
    skd.arc([bulb_cx - 45, bulb_cy - 35, bulb_cx + 45, bulb_cy + 55], start=20, end=160, fill=(255, 180, 50, 255), width=9)

    canvas = Image.alpha_composite(canvas, socket_layer)

    # -------------------------------------------------------------------------
    # 6. PREMIUM OPAQUE LINEN LAMPSHADE
    # -------------------------------------------------------------------------
    shade_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    shd = ImageDraw.Draw(shade_layer)

    top_w = 820
    bottom_w = 1560
    top_y = 260
    bottom_y = 1460

    tx0 = cx - top_w // 2
    tx1 = cx + top_w // 2
    bx0 = cx - bottom_w // 2
    bx1 = cx + bottom_w // 2

    # Bottom Aperture Oval & Inner Gold Reflector
    bottom_ry = 100
    shd.ellipse([bx0, bottom_y - bottom_ry, bx1, bottom_y + bottom_ry], fill=(255, 230, 160, 255))
    shd.ellipse([bx0 + 25, bottom_y - bottom_ry + 10, bx1 - 25, bottom_y + bottom_ry - 10], fill=(255, 248, 215, 255))

    # Main Conical Lampshade Surface
    steps = 60
    shade_poly = []
    
    # Bottom arc
    for i in range(steps + 1):
        t = i / steps
        px = bx1 - t * bottom_w
        py = bottom_y + math.sin(t * math.pi) * bottom_ry
        shade_poly.append((px, py))
        
    # Top arc
    top_ry = 55
    for i in range(steps + 1):
        t = i / steps
        px = tx0 + t * top_w
        py = top_y + math.sin(t * math.pi) * top_ry
        shade_poly.append((px, py))

    # Base Linen Fabric Layer
    linen_base = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    lbd = ImageDraw.Draw(linen_base)
    lbd.polygon(shade_poly, fill=(242, 235, 218, 255))

    # Cylindrical lighting shading across lampshade
    for col in range(bx0, bx1):
        rel = (col - bx0) / bottom_w
        edge_shadow = 35 * (1.0 - math.sin(rel * math.pi)) ** 1.5
        glow_add = 20 * math.exp(-((rel - 0.5) ** 2) / 0.08)
        
        c_r = int(max(200, min(255, 244 - edge_shadow + glow_add)))
        c_g = int(max(190, min(255, 236 - edge_shadow * 1.1 + glow_add * 0.8)))
        c_b = int(max(170, min(255, 218 - edge_shadow * 1.2)))
        lbd.line([(col, top_y - 20), (col, bottom_y + bottom_ry + 20)], fill=(c_r, c_g, c_b, 255), width=1)

    # Warm inner bulb backlight glow
    bulb_pass = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bpd = ImageDraw.Draw(bulb_pass)
    bpd.ellipse([cx - 580, 600, cx + 580, 1500], fill=(255, 215, 130, 140))
    bpd.ellipse([cx - 380, 800, cx + 380, 1450], fill=(255, 238, 175, 160))
    bulb_pass = bulb_pass.filter(ImageFilter.GaussianBlur(50))
    linen_shaded = Image.alpha_composite(linen_base, bulb_pass)

    # Linen weave fiber texture
    noise_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    nd = ImageDraw.Draw(noise_layer)
    random.seed(777)
    for _ in range(6000):
        nx = random.randint(bx0, bx1)
        ny = random.randint(top_y, bottom_y + bottom_ry)
        nalpha = random.randint(15, 45)
        ncol = (255, 255, 255, nalpha) if random.random() > 0.45 else (150, 130, 105, nalpha)
        nd.line([(nx, ny), (nx + random.choice([2, 3, 4]), ny)], fill=ncol, width=1)
        nd.line([(nx, ny), (nx, ny + random.choice([2, 3, 4]))], fill=ncol, width=1)

    linen_textured = Image.alpha_composite(linen_shaded, noise_layer)

    # Mask strictly to shade polygon
    shade_mask = Image.new('L', (W, H), 0)
    smd = ImageDraw.Draw(shade_mask)
    smd.polygon(shade_poly, fill=255)

    shade_layer.paste(linen_textured, (0, 0), shade_mask)
    shd = ImageDraw.Draw(shade_layer)

    # Rolled Hem Borders & Brass Finial
    shd.ellipse([tx0, top_y - top_ry, tx1, top_y + top_ry], outline=(175, 135, 52, 255), width=8)
    shd.ellipse([tx0 + 4, top_y - top_ry + 3, tx1 - 4, top_y + top_ry - 3], fill=(42, 36, 26, 255))
    shd.ellipse([tx0 + 18, top_y - top_ry + 10, tx1 - 18, top_y + top_ry - 10], fill=(255, 225, 145, 255))

    finial_r = 42
    shd.ellipse([cx - finial_r, top_y - 75, cx + finial_r, top_y + 10], fill=(235, 195, 88, 255))
    shd.ellipse([cx - finial_r + 8, top_y - 70, cx + finial_r - 8, top_y - 5], fill=(255, 240, 155, 255))
    shd.line([(cx, top_y - 5), (cx, top_y + 45)], fill=(165, 125, 48, 255), width=12)

    for i in range(steps + 1):
        t = i / steps
        px = bx1 - t * bottom_w
        py = bottom_y + math.sin(t * math.pi) * bottom_ry
        shd.ellipse([px - 6, py - 5, px + 6, py + 5], fill=(215, 180, 95, 255))

    canvas = Image.alpha_composite(canvas, shade_layer)

    # -------------------------------------------------------------------------
    # 7. CROPPING & SUPERSAMPLED DOWNSCALING
    # -------------------------------------------------------------------------
    bbox = canvas.getbbox()
    if bbox:
        pad = 40
        crop_box = (
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(W, bbox[2] + pad),
            min(H, bbox[3] + pad)
        )
        canvas = canvas.crop(crop_box)

    target_w = 900
    target_h = int(canvas.height * (target_w / canvas.width))
    final_img = canvas.resize((target_w, target_h), resample=Image.Resampling.LANCZOS)

    out_path = 'public/assets/obj_lamp_switch.png'
    final_img.save(out_path, 'PNG', optimize=True)
    print(f"Saved {out_path} with size {final_img.size}")

if __name__ == '__main__':
    render_realistic_lamp()
    print("Realistic Lamp asset (switch removed) rendered successfully!")
