import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def get_font(size, bold=True):
    try:
        font_path = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
        return ImageFont.truetype(font_path, size)
    except Exception:
        return ImageFont.load_default()

def render_realistic_toaster():
    # 4x supersampling canvas: 3600 x 3000
    W, H = 3600, 3000
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))

    f_num = get_font(34, bold=True)
    f_btn = get_font(26, bold=True)
    f_brand = get_font(32, bold=True)
    f_brand_sub = get_font(20, bold=False)

    # -------------------------------------------------------------------------
    # 1. GROUND AMBIENT DROP SHADOW
    # -------------------------------------------------------------------------
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse([450, 2520, 3100, 2780], fill=(0, 0, 0, 130))
    sd.ellipse([700, 2560, 2850, 2740], fill=(0, 0, 0, 160))
    shadow = shadow.filter(ImageFilter.GaussianBlur(35))
    canvas = Image.alpha_composite(canvas, shadow)

    # -------------------------------------------------------------------------
    # 2. DELICIOUS ARTISAN TOAST SLICES
    # -------------------------------------------------------------------------
    toast_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    
    toast_configs = [
        (1160, 200, 720, 1050, -2.5, 101),
        (2140, 160, 720, 1050, 2.0, 202)
    ]

    for cx, ty, tw, th, angle, seed in toast_configs:
        t_img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        td = ImageDraw.Draw(t_img)
        
        bx0 = cx - tw // 2
        bx1 = cx + tw // 2
        by0 = ty
        by1 = ty + th

        # Sourdough curved crown
        points = []
        steps = 50
        for i in range(steps + 1):
            t = i / steps
            px = bx0 + t * tw
            # Natural loaf curvature with slight ear/blister peak
            arch = math.sin(t * math.pi) * 125 + math.sin(t * math.pi * 3) * 10
            py = by0 + 125 - arch
            points.append((px, py))
        
        # Soft waist and rounded corners
        points.append((bx1 + 12, by0 + 260))
        points.append((bx1 - 15, by0 + 650))
        points.append((bx1 - 25, by1))
        points.append((bx0 + 25, by1))
        points.append((bx0 - 15, by0 + 650))
        points.append((bx0 - 12, by0 + 260))

        # Crust base (rich baked honey-brown)
        td.polygon(points, fill=(148, 76, 25, 255))
        for i in range(len(points) - 1):
            td.line([points[i], points[i+1]], fill=(102, 48, 12, 255), width=18)

        # Inner crumb base (creamy golden warmth)
        inner_points = []
        for px, py in points:
            dx = px - cx
            dy = py - (ty + th * 0.45)
            inner_points.append((cx + dx * 0.91, (ty + th * 0.45) + dy * 0.91))

        td.polygon(inner_points, fill=(244, 204, 148, 255))

        # Soft realistic browning gradients (Gaussian blurred toast heatmap)
        heat_img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        hd = ImageDraw.Draw(heat_img)
        
        # Golden glow zone
        hd.ellipse([cx - 270, ty + 160, cx + 270, ty + 780], fill=(218, 148, 72, 220))
        # Warm toasted center
        hd.ellipse([cx - 210, ty + 230, cx + 210, ty + 690], fill=(182, 105, 42, 220))
        # Deep crispy caramelized spots
        hd.ellipse([cx - 160, ty + 300, cx + 160, ty + 610], fill=(145, 75, 26, 210))
        hd.ellipse([cx - 110, ty + 360, cx + 110, ty + 530], fill=(120, 58, 18, 200))
        
        # Subtle diagonal grill rack toasting marks
        for g_offset in [-140, -40, 60, 160]:
            hd.line([(cx - 220, ty + 420 + g_offset), (cx + 220, ty + 320 + g_offset)], fill=(110, 50, 16, 140), width=32)

        heat_img = heat_img.filter(ImageFilter.GaussianBlur(28))
        
        # Mask heat to inner crumb area
        crumb_mask = Image.new('L', (W, H), 0)
        cmd = ImageDraw.Draw(crumb_mask)
        cmd.polygon(inner_points, fill=255)
        
        t_img.paste(Image.alpha_composite(Image.new('RGBA', (W, H), (0,0,0,0)), heat_img), (0, 0), crumb_mask)
        td = ImageDraw.Draw(t_img)

        # Artisan bread crumb pores & air pockets
        random.seed(seed)
        for _ in range(550):
            rx = random.randint(int(bx0 + 50), int(bx1 - 50))
            ry = random.randint(int(by0 + 80), int(by1 - 80))
            rad = random.randint(2, 8)
            
            # Check if point is inside inner crumb
            dist = math.hypot(rx - cx, ry - (ty + 440))
            if dist < 240:
                pcol = (100, 46, 14, random.randint(110, 200)) if random.random() > 0.35 else (255, 225, 170, 170)
            elif dist < 360:
                pcol = (135, 70, 24, random.randint(90, 180)) if random.random() > 0.45 else (255, 235, 190, 180)
            else:
                pcol = (180, 115, 55, random.randint(70, 150)) if random.random() > 0.55 else (255, 240, 205, 190)
                
            td.ellipse([rx - rad, ry - rad, rx + rad, ry + rad], fill=pcol)

        # Crust top blister ear / flour dusting
        td.arc([cx - 240, ty + 35, cx + 240, ty + 210], start=195, end=345, fill=(255, 240, 210, 190), width=12)
        td.arc([cx - 210, ty + 55, cx + 210, ty + 215], start=205, end=335, fill=(85, 38, 10, 240), width=9)

        if angle != 0:
            t_img = t_img.rotate(angle, resample=Image.Resampling.BICUBIC, center=(cx, ty + th // 2))

        toast_layer = Image.alpha_composite(toast_layer, t_img)

    canvas = Image.alpha_composite(canvas, toast_layer)

    # -------------------------------------------------------------------------
    # 3. TOASTER CHASSIS & 3D METALLIC BODY
    # -------------------------------------------------------------------------
    x0, y0 = 400, 850
    x1, y1 = 2950, 2520
    bw = x1 - x0
    bh = y1 - y0

    # 3.1 Rubber Feet
    feet_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    fd = ImageDraw.Draw(feet_layer)
    feet_coords = [
        (560, y1 - 20, 780, y1 + 100),
        (2570, y1 - 20, 2790, y1 + 100)
    ]
    for fx0, fy0, fx1, fy1 in feet_coords:
        fd.rounded_rectangle([fx0, fy0, fx1, fy1], radius=24, fill=(28, 30, 34, 255))
        for gx in range(fx0 + 30, fx1 - 20, 35):
            fd.line([(gx, fy0 + 30), (gx, fy1 - 10)], fill=(15, 16, 18, 255), width=8)
            fd.line([(gx + 4, fy0 + 30), (gx + 4, fy1 - 10)], fill=(50, 54, 60, 255), width=3)
        fd.line([(fx0 + 10, fy0 + 5), (fx1 - 10, fy0 + 5)], fill=(75, 80, 88, 255), width=6)
    canvas = Image.alpha_composite(canvas, feet_layer)

    # 3.2 Main Chassis Brushed Stainless Steel Body
    body_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))

    chassis_mask = Image.new('L', (W, H), 0)
    cmd = ImageDraw.Draw(chassis_mask)
    cmd.rounded_rectangle([x0, y0, x1, y1], radius=150, fill=255)

    steel_base = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sbd = ImageDraw.Draw(steel_base)
    for col in range(x0, x1):
        rel_x = (col - x0) / bw
        base_light = 220 + 25 * math.sin(rel_x * math.pi)
        highlight = 35 * math.exp(-((rel_x - 0.28) ** 2) / 0.015) + 20 * math.exp(-((rel_x - 0.75) ** 2) / 0.03)
        shadow_edge = 45 * ((1.0 - math.sin(rel_x * math.pi)) ** 1.8)
        
        val = max(140, min(255, base_light + highlight - shadow_edge))
        r_val = int(max(0, min(255, val * 0.96)))
        g_val = int(max(0, min(255, val * 0.98)))
        b_val = int(max(0, min(255, val * 1.01)))
        
        sbd.line([(col, y0), (col, y1)], fill=(r_val, g_val, b_val, 255), width=1)

    noise_img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    nd = ImageDraw.Draw(noise_img)
    random.seed(42)
    for _ in range(4000):
        nx = random.randint(x0, x1)
        ny = random.randint(y0, y1 - 200)
        nlen = random.randint(80, 350)
        nalpha = random.randint(6, 18)
        nlight = random.choice([(255, 255, 255, nalpha), (30, 35, 45, nalpha)])
        nd.line([(nx, ny), (nx, min(ny + nlen, y1))], fill=nlight, width=random.choice([1, 2]))

    noise_img = noise_img.filter(ImageFilter.GaussianBlur(0.8))
    steel_textured = Image.alpha_composite(steel_base, noise_img)

    body_layer.paste(steel_textured, (0, 0), chassis_mask)
    bd = ImageDraw.Draw(body_layer)

    bd.rounded_rectangle([x0, y0, x1, y1], radius=150, outline=(140, 150, 165, 255), width=12)
    bd.rounded_rectangle([x0 + 6, y0 + 6, x1 - 6, y1 - 6], radius=144, outline=(255, 255, 255, 200), width=6)
    
    # Bottom chassis black trim
    base_bar_h = 100
    base_bar = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bbd = ImageDraw.Draw(base_bar)
    bbd.rounded_rectangle([x0 - 15, y1 - base_bar_h, x1 + 15, y1 + 35], radius=50, fill=(24, 26, 30, 255))
    bbd.line([(x0 + 40, y1 - base_bar_h + 12), (x1 - 40, y1 - base_bar_h + 12)], fill=(120, 128, 140, 255), width=5)
    bbd.line([(x0 + 40, y1 - base_bar_h + 17), (x1 - 40, y1 - base_bar_h + 17)], fill=(230, 235, 245, 220), width=4)
    body_layer = Image.alpha_composite(body_layer, base_bar)

    # -------------------------------------------------------------------------
    # 4. TOP CHROMED CAP & TOAST SLOTS
    # -------------------------------------------------------------------------
    top_cap = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    tcd = ImageDraw.Draw(top_cap)

    t_cap_y0 = y0 - 30
    t_cap_y1 = y0 + 190
    tcd.rounded_rectangle([x0 + 20, t_cap_y0, x1 - 20, t_cap_y1], radius=90, fill=(35, 38, 44, 255))
    tcd.rounded_rectangle([x0 + 24, t_cap_y0 + 4, x1 - 24, t_cap_y1 - 4], radius=86, fill=(220, 226, 235, 255))

    for col in range(x0 + 30, x1 - 30):
        rx = (col - (x0 + 30)) / (bw - 60)
        c_val = int(195 + 50 * math.sin(rx * math.pi * 3) + 30 * math.exp(-((rx - 0.3) ** 2) / 0.02))
        c_val = max(150, min(255, c_val))
        tcd.line([(col, t_cap_y0 + 8), (col, t_cap_y1 - 8)], fill=(c_val, min(255, c_val + 2), min(255, c_val + 5), 255), width=1)

    tcd.line([(x0 + 80, t_cap_y0 + 15), (x1 - 80, t_cap_y0 + 15)], fill=(255, 255, 255, 240), width=8)
    tcd.line([(x0 + 100, t_cap_y0 + 25), (x1 - 100, t_cap_y0 + 25)], fill=(255, 255, 255, 140), width=4)

    slot1_box = [800, t_cap_y0 + 50, 1520, t_cap_y1 - 45]
    slot2_box = [1780, t_cap_y0 + 50, 2500, t_cap_y1 - 45]

    for sbox in [slot1_box, slot2_box]:
        tcd.rounded_rectangle([sbox[0] - 12, sbox[1] - 10, sbox[2] + 12, sbox[3] + 10], radius=28, fill=(130, 138, 150, 255))
        tcd.rounded_rectangle([sbox[0] - 6, sbox[1] - 5, sbox[2] + 6, sbox[3] + 5], radius=24, fill=(255, 255, 255, 220))
        tcd.rounded_rectangle(sbox, radius=20, fill=(12, 14, 18, 255))
        tcd.rounded_rectangle([sbox[0] + 4, sbox[1] + 4, sbox[2] - 4, sbox[3] - 4], radius=16, fill=(5, 6, 8, 255))
        
        mid_y = (sbox[1] + sbox[3]) // 2
        tcd.line([(sbox[0] + 30, mid_y), (sbox[2] - 30, mid_y)], fill=(255, 110, 20, 220), width=6)
        tcd.line([(sbox[0] + 60, mid_y), (sbox[2] - 60, mid_y)], fill=(255, 210, 90, 240), width=2)

    body_layer = Image.alpha_composite(body_layer, top_cap)
    canvas = Image.alpha_composite(canvas, body_layer)

    # -------------------------------------------------------------------------
    # 5. FRONT APPLIANCE CONTROL PANEL
    # -------------------------------------------------------------------------
    px0, py0 = 580, 1220
    px1, py1 = 2770, 2280
    
    panel_base = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    pbd = ImageDraw.Draw(panel_base)
    pbd.rounded_rectangle([px0 - 6, py0 - 6, px1 + 6, py1 + 6], radius=56, fill=(150, 160, 172, 255))
    pbd.rounded_rectangle([px0, py0, px1, py1], radius=50, fill=(238, 243, 250, 255))

    for row in range(py0 + 2, py1 - 2):
        ry = (row - py0) / (py1 - py0)
        c = int(246 - 20 * ry)
        pbd.line([(px0 + 4, row), (px1 - 4, row)], fill=(c - 2, c, c + 4, 255), width=1)
    
    pbd.text((px0 + 70, py0 + 45), "CHIMPU KITCHEN PRO", font=f_brand, fill=(60, 68, 80, 255))
    pbd.text((px0 + 70, py0 + 84), "PRECISE HEAT MECHANICAL CONVECTION • 1200W", font=f_brand_sub, fill=(120, 130, 145, 255))
    pbd.line([(px0 + 65, py0 + 125), (px1 - 65, py0 + 125)], fill=(190, 198, 210, 255), width=3)
    pbd.line([(px0 + 65, py0 + 128), (px1 - 65, py0 + 128)], fill=(255, 255, 255, 200), width=2)
    canvas = Image.alpha_composite(canvas, panel_base)

    # -------------------------------------------------------------------------
    # 5.1 ROTARY BROWNING DIAL
    # -------------------------------------------------------------------------
    dial_cx = px0 + 450
    dial_cy = py0 + 560
    dial_r = 250

    dial_shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dsd = ImageDraw.Draw(dial_shadow)
    dsd.ellipse([dial_cx - dial_r - 20, dial_cy - dial_r - 10, dial_cx + dial_r + 20, dial_cy + dial_r + 30], fill=(0, 0, 0, 90))
    dial_shadow = dial_shadow.filter(ImageFilter.GaussianBlur(16))
    canvas = Image.alpha_composite(canvas, dial_shadow)

    dial_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dd = ImageDraw.Draw(dial_layer)

    dd.ellipse([dial_cx - dial_r, dial_cy - dial_r, dial_cx + dial_r, dial_cy + dial_r], fill=(42, 46, 54, 255))
    
    for deg in range(0, 360, 5):
        rad = math.radians(deg)
        k_x0 = dial_cx + (dial_r - 28) * math.cos(rad)
        k_y0 = dial_cy + (dial_r - 28) * math.sin(rad)
        k_x1 = dial_cx + (dial_r - 4) * math.cos(rad)
        k_y1 = dial_cy + (dial_r - 4) * math.sin(rad)
        k_col = (180, 190, 205, 255) if deg % 10 == 0 else (90, 98, 110, 255)
        dd.line([(k_x0, k_y0), (k_x1, k_y1)], fill=k_col, width=5)

    dd.ellipse([dial_cx - dial_r + 30, dial_cy - dial_r + 30, dial_cx + dial_r - 30, dial_cy + dial_r - 30], fill=(160, 168, 180, 255))
    dd.ellipse([dial_cx - dial_r + 36, dial_cy - dial_r + 36, dial_cx + dial_r - 36, dial_cy + dial_r - 36], fill=(245, 248, 255, 255))

    inner_r = dial_r - 48
    dd.ellipse([dial_cx - inner_r, dial_cy - inner_r, dial_cx + inner_r, dial_cy + inner_r], fill=(32, 36, 44, 255))

    dial_start_deg = 145
    dial_end_deg = 395
    num_positions = [
        (1, 150),
        (2, 200),
        (3, 250),
        (4, 295),
        (5, 340),
        (6, 390)
    ]

    for num, deg in num_positions:
        rad = math.radians(deg)
        tx0 = dial_cx + (inner_r - 25) * math.cos(rad)
        ty0 = dial_cy + (inner_r - 25) * math.sin(rad)
        tx1 = dial_cx + (inner_r - 6) * math.cos(rad)
        ty1 = dial_cy + (inner_r - 6) * math.sin(rad)
        dd.line([(tx0, ty0), (tx1, ty1)], fill=(225, 232, 245, 255), width=6)
        
        nx = dial_cx + (inner_r - 62) * math.cos(rad)
        ny = dial_cy + (inner_r - 62) * math.sin(rad)
        num_str = str(num)
        bbox = f_num.getbbox(num_str)
        nw = bbox[2] - bbox[0]
        nh = bbox[3] - bbox[1]
        dd.text((nx - nw / 2, ny - nh / 2), num_str, font=f_num, fill=(240, 245, 255, 255))

    for deg in range(dial_start_deg, dial_end_deg + 1, 10):
        if not any(abs(deg - p[1]) < 4 for p in num_positions):
            rad = math.radians(deg)
            tx0 = dial_cx + (inner_r - 18) * math.cos(rad)
            ty0 = dial_cy + (inner_r - 18) * math.sin(rad)
            tx1 = dial_cx + (inner_r - 6) * math.cos(rad)
            ty1 = dial_cy + (inner_r - 6) * math.sin(rad)
            dd.line([(tx0, ty0), (tx1, ty1)], fill=(130, 140, 155, 220), width=3)

    cap_r = inner_r - 90
    dd.ellipse([dial_cx - cap_r, dial_cy - cap_r, dial_cx + cap_r, dial_cy + cap_r], fill=(50, 56, 68, 255))
    dd.ellipse([dial_cx - cap_r + 6, dial_cy - cap_r + 6, dial_cx + cap_r - 6, dial_cy + cap_r - 6], fill=(185, 194, 206, 255))
    dd.ellipse([dial_cx - cap_r + 14, dial_cy - cap_r + 14, dial_cx + cap_r - 14, dial_cy + cap_r - 14], fill=(28, 32, 40, 255))

    ptr_deg = 270
    ptr_rad = math.radians(ptr_deg)
    p_x0 = dial_cx + 20 * math.cos(ptr_rad)
    p_y0 = dial_cy + 20 * math.sin(ptr_rad)
    p_x1 = dial_cx + (inner_r - 20) * math.cos(ptr_rad)
    p_y1 = dial_cy + (inner_r - 20) * math.sin(ptr_rad)
    dd.line([(p_x0, p_y0), (p_x1, p_y1)], fill=(255, 60, 45, 255), width=9)
    dd.ellipse([dial_cx - 18, dial_cy - 18, dial_cx + 18, dial_cy + 18], fill=(255, 60, 45, 255))

    dd.text((dial_cx - 120, dial_cy + dial_r + 20), "BROWNING CONTROL", font=f_brand_sub, fill=(90, 100, 115, 255))
    canvas = Image.alpha_composite(canvas, dial_layer)

    # -------------------------------------------------------------------------
    # 5.2 FUNCTION BUTTONS
    # -------------------------------------------------------------------------
    btn_x0 = px0 + 1180
    btn_w = 840
    btn_h = 110
    btn_start_y = py0 + 200
    btn_spacing = 140

    buttons = [
        ("BAGEL", (56, 64, 76), (28, 32, 40), (0, 190, 255), True),
        ("DEFROST", (56, 64, 76), (28, 32, 40), (80, 90, 100), False),
        ("REHEAT", (56, 64, 76), (28, 32, 40), (80, 90, 100), False),
        ("CANCEL", (215, 45, 38), (170, 28, 22), (255, 75, 60), True)
    ]

    btn_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(btn_layer)

    led_glow_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    lgd = ImageDraw.Draw(led_glow_layer)

    for idx, (label, col_body, col_bevel, led_col, is_lit) in enumerate(buttons):
        by = btn_start_y + idx * btn_spacing
        bx = btn_x0
        
        bd.rounded_rectangle([bx - 4, by - 4, bx + btn_w + 4, by + btn_h + 4], radius=28, fill=(165, 175, 188, 255))
        bd.rounded_rectangle([bx, by, bx + btn_w, by + btn_h], radius=24, fill=col_body)
        
        bd.line([(bx + 20, by + 4), (bx + btn_w - 20, by + 4)], fill=(255, 255, 255, 90), width=3)
        bd.line([(bx + 20, by + btn_h - 4), (bx + btn_w - 20, by + btn_h - 4)], fill=(0, 0, 0, 120), width=3)

        led_cx = bx + 60
        led_cy = by + btn_h // 2
        led_r = 18
        
        bd.ellipse([led_cx - led_r - 4, led_cy - led_r - 4, led_cx + led_r + 4, led_cy + led_r + 4], fill=(120, 130, 142, 255))
        bd.ellipse([led_cx - led_r, led_cy - led_r, led_cx + led_r, led_cy + led_r], fill=led_col)
        
        if is_lit:
            bd.ellipse([led_cx - 7, led_cy - 7, led_cx + 7, led_cy + 7], fill=(255, 255, 255, 230))
            lgd.ellipse([led_cx - 40, led_cy - 40, led_cx + 40, led_cy + 40], fill=(*led_col[:3], 150))

        bbox = f_btn.getbbox(label)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        text_x = bx + 130
        text_y = by + (btn_h - th) // 2 - 2
        bd.text((text_x, text_y), label, font=f_btn, fill=(245, 248, 255, 255))

    led_glow_layer = led_glow_layer.filter(ImageFilter.GaussianBlur(12))
    canvas = Image.alpha_composite(canvas, led_glow_layer)
    canvas = Image.alpha_composite(canvas, btn_layer)

    # -------------------------------------------------------------------------
    # 6. MECHANICAL CARRIAGE LEVER
    # -------------------------------------------------------------------------
    lever_slot_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    lsd = ImageDraw.Draw(lever_slot_layer)

    slot_x = x1 - 105
    slot_y0 = y0 + 350
    slot_y1 = y1 - 250
    
    lsd.rounded_rectangle([slot_x - 12, slot_y0 - 8, slot_x + 12, slot_y1 + 8], radius=12, fill=(150, 160, 175, 255))
    lsd.rounded_rectangle([slot_x - 8, slot_y0, slot_x + 8, slot_y1], radius=8, fill=(18, 20, 24, 255))
    canvas = Image.alpha_composite(canvas, lever_slot_layer)

    lever_y = slot_y0 + 420
    shaft_x0 = slot_x
    shaft_x1 = x1 + 220
    
    handle_x0 = shaft_x1 - 20
    handle_x1 = shaft_x1 + 240
    handle_y0 = lever_y - 60
    handle_y1 = lever_y + 60

    handle_shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    hsd = ImageDraw.Draw(handle_shadow)
    hsd.rounded_rectangle([handle_x0 + 10, handle_y0 + 15, handle_x1 + 20, handle_y1 + 25], radius=30, fill=(0, 0, 0, 110))
    handle_shadow = handle_shadow.filter(ImageFilter.GaussianBlur(15))
    canvas = Image.alpha_composite(canvas, handle_shadow)

    lever_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lever_layer)

    ld.line([(shaft_x0 + 10, lever_y + 12), (shaft_x1, lever_y + 12)], fill=(0, 0, 0, 90), width=18)
    ld.line([(shaft_x0, lever_y), (shaft_x1, lever_y)], fill=(140, 150, 162, 255), width=24)
    ld.line([(shaft_x0, lever_y - 3), (shaft_x1, lever_y - 3)], fill=(245, 250, 255, 255), width=10)

    ld.rounded_rectangle([handle_x0, handle_y0, handle_x1, handle_y1], radius=28, fill=(28, 30, 36, 255))
    ld.line([(handle_x0 + 15, handle_y0 + 14), (handle_x1 - 15, handle_y0 + 14)], fill=(110, 120, 135, 255), width=8)
    ld.line([(handle_x0 + 20, handle_y0 + 18), (handle_x1 - 20, handle_y0 + 18)], fill=(220, 230, 245, 220), width=4)
    ld.rounded_rectangle([handle_x1 - 18, handle_y0 + 6, handle_x1 - 4, handle_y1 - 6], radius=8, fill=(210, 220, 235, 255))

    canvas = Image.alpha_composite(canvas, lever_layer)

    # -------------------------------------------------------------------------
    # 7. CHROME LIGHT GLARE / SPECULAR REFLECTION
    # -------------------------------------------------------------------------
    glare_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glare_layer)

    glare_points = [
        (x0 + 80, y0 + 180),
        (x0 + 480, y0 + 180),
        (x0 + 280, y1 - 120),
        (x0 + 40, y1 - 120)
    ]
    gd.polygon(glare_points, fill=(255, 255, 255, 28))
    glare_layer = glare_layer.filter(ImageFilter.GaussianBlur(25))
    canvas = Image.alpha_composite(canvas, glare_layer)

    # -------------------------------------------------------------------------
    # 8. CROPPING & SUPERSAMPLED DOWNSCALING
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

    target_w = 1000
    target_h = int(canvas.height * (target_w / canvas.width))
    final_img = canvas.resize((target_w, target_h), resample=Image.Resampling.LANCZOS)

    out_path = 'public/assets/obj_toaster.png'
    final_img.save(out_path, 'PNG', optimize=True)
    print(f"Saved {out_path} with size {final_img.size}")

if __name__ == '__main__':
    render_realistic_toaster()
    print("Realistic Toaster asset rendered successfully!")
