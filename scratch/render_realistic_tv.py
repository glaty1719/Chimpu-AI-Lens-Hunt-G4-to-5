import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def get_font(size, bold=True):
    try:
        font_path = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
        return ImageFont.truetype(font_path, size)
    except Exception:
        return ImageFont.load_default()

def render_realistic_tv():
    W, H = 3840, 2600
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))

    f_title = get_font(34, bold=True)
    f_sub = get_font(22, bold=False)
    f_badge = get_font(18, bold=True)
    f_time = get_font(20, bold=True)
    f_card_title = get_font(24, bold=True)
    f_card_sub = get_font(18, bold=False)

    screen_x0 = 360
    screen_y0 = 240
    screen_w = 3120
    screen_h = 1755
    screen_x1 = screen_x0 + screen_w
    screen_y1 = screen_y0 + screen_h

    # -------------------------------------------------------------------------
    # 0. AMBILIGHT BACKLIGHTING
    # -------------------------------------------------------------------------
    ambilight = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ad = ImageDraw.Draw(ambilight)

    ad.ellipse([screen_x0 - 250, screen_y0 - 150, screen_x0 + 1200, screen_y0 + 900], fill=(0, 240, 160, 110))
    ad.ellipse([screen_x1 - 1200, screen_y0 - 100, screen_x1 + 250, screen_y0 + 800], fill=(70, 140, 255, 100))
    ad.ellipse([screen_x1 - 1000, screen_y1 - 800, screen_x1 + 300, screen_y1 + 100], fill=(255, 110, 40, 95))
    ad.ellipse([screen_x0 - 200, screen_y1 - 600, screen_x0 + 900, screen_y1 + 200], fill=(0, 160, 200, 80))

    ambilight = ambilight.filter(ImageFilter.GaussianBlur(110))
    canvas = Image.alpha_composite(canvas, ambilight)

    # -------------------------------------------------------------------------
    # 1. GROUND DROP SHADOW
    # -------------------------------------------------------------------------
    stand_base_y = 2320
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse([W // 2 - 900, stand_base_y - 40, W // 2 + 900, stand_base_y + 140], fill=(0, 0, 0, 140))
    sd.ellipse([W // 2 - 600, stand_base_y - 10, W // 2 + 600, stand_base_y + 90], fill=(0, 0, 0, 170))
    shadow = shadow.filter(ImageFilter.GaussianBlur(35))
    canvas = Image.alpha_composite(canvas, shadow)

    # -------------------------------------------------------------------------
    # 2. METALLIC STAND & PEDESTAL
    # -------------------------------------------------------------------------
    stand_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    std = ImageDraw.Draw(stand_layer)

    cx = W // 2
    neck_w = 320
    neck_top_y = screen_y1 - 100
    neck_bottom_y = stand_base_y - 60

    std.rounded_rectangle([cx - neck_w // 2, neck_top_y, cx + neck_w // 2, neck_bottom_y], radius=20, fill=(35, 38, 45, 255))
    for x in range(cx - neck_w // 2, cx + neck_w // 2):
        rel = (x - (cx - neck_w // 2)) / neck_w
        intensity = math.sin(rel * math.pi)
        highlight = math.exp(-((rel - 0.3) ** 2) / 0.02) * 60
        val = int(35 + 40 * intensity + highlight)
        std.line([(x, neck_top_y), (x, neck_bottom_y)], fill=(val, val + 2, val + 5, 255), width=1)

    base_w = 1280
    base_h = 75
    bx0 = cx - base_w // 2
    bx1 = cx + base_w // 2
    by0 = neck_bottom_y - 10
    by1 = by0 + base_h

    std.rounded_rectangle([bx0, by0, bx1, by1], radius=24, fill=(20, 22, 26, 255))
    std.rounded_rectangle([bx0 + 6, by0 + 4, bx1 - 6, by1 - 4], radius=20, fill=(45, 50, 58, 255))
    
    for x in range(bx0 + 10, bx1 - 10):
        rel = (x - bx0) / base_w
        c_val = int(45 + 30 * math.sin(rel * math.pi) + 35 * math.exp(-((rel - 0.25) ** 2) / 0.015))
        std.line([(x, by0 + 6), (x, by1 - 6)], fill=(c_val, c_val + 2, c_val + 6, 255), width=1)

    std.line([(bx0 + 30, by0 + 6), (bx1 - 30, by0 + 6)], fill=(160, 175, 195, 220), width=3)
    std.line([(bx0 + 40, by1 - 6), (bx1 - 40, by1 - 6)], fill=(15, 16, 18, 255), width=3)

    canvas = Image.alpha_composite(canvas, stand_layer)

    # -------------------------------------------------------------------------
    # 3. TV CHASSIS & ULTRA-THIN BEZEL
    # -------------------------------------------------------------------------
    chassis_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(chassis_layer)

    bezel_thickness = 24
    outer_x0 = screen_x0 - bezel_thickness
    outer_y0 = screen_y0 - bezel_thickness
    outer_x1 = screen_x1 + bezel_thickness
    outer_y1 = screen_y1 + bezel_thickness

    cd.rounded_rectangle([outer_x0, outer_y0, outer_x1, outer_y1], radius=32, fill=(28, 30, 36, 255))
    cd.rounded_rectangle([outer_x0, outer_y0, outer_x1, outer_y1], radius=32, outline=(85, 95, 110, 255), width=4)
    cd.rounded_rectangle([outer_x0 + 4, outer_y0 + 4, outer_x1 - 4, outer_y1 - 4], radius=28, outline=(14, 15, 18, 255), width=3)

    cd.rectangle([outer_x0, screen_y1 - 6, outer_x1, outer_y1], fill=(22, 24, 28, 255))
    cd.line([(outer_x0 + 40, outer_y1 - 10), (outer_x1 - 40, outer_y1 - 10)], fill=(65, 72, 85, 255), width=2)

    led_cx = cx
    led_cy = outer_y1 - 8
    cd.ellipse([led_cx - 16, led_cy - 4, led_cx + 16, led_cy + 4], fill=(0, 210, 255, 255))
    cd.ellipse([led_cx - 6, led_cy - 2, led_cx + 6, led_cy + 2], fill=(255, 255, 255, 255))

    canvas = Image.alpha_composite(canvas, chassis_layer)

    # -------------------------------------------------------------------------
    # 4. CINEMATIC 4K HDR REALISTIC ALPINE NATURE SCENE
    # -------------------------------------------------------------------------
    video_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(video_layer)

    horizon_y = screen_y0 + int(screen_h * 0.58)

    # 4.1 Twilight Dusk Sky
    for y in range(screen_y0, horizon_y + 1):
        rel = (y - screen_y0) / (horizon_y - screen_y0)
        if rel < 0.45:
            t = rel / 0.45
            r = int(8 + 14 * t)
            g = int(12 + 18 * t)
            b = int(32 + 35 * t)
        else:
            t = (rel - 0.45) / 0.55
            r = int(22 + 140 * (t ** 2.0))
            g = int(30 + 80 * (t ** 1.6))
            b = int(67 + 25 * (1.0 - t))
        vd.line([(screen_x0, y), (screen_x1, y)], fill=(r, g, b, 255), width=1)

    # 4.2 Stars
    random.seed(101)
    for _ in range(650):
        sx = random.randint(screen_x0, screen_x1)
        sy = random.randint(screen_y0, horizon_y - 120)
        s_bright = random.randint(150, 255)
        s_rad = 1 if random.random() > 0.12 else 2
        vd.ellipse([sx - s_rad, sy - s_rad, sx + s_rad, sy + s_rad], fill=(s_bright, s_bright, 255, s_bright))

    # 4.3 Multi-Layer Aurora Borealis Curtains
    aurora_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ad = ImageDraw.Draw(aurora_layer)

    aurora_ribbons = [
        (screen_y0 + 360, (0, 255, 160, 160), 120),
        (screen_y0 + 290, (0, 230, 245, 140), 90),
        (screen_y0 + 230, (160, 60, 255, 110), 140),
        (screen_y0 + 430, (40, 255, 130, 150), 100)
    ]

    for a_idx, (y_center, col, thickness) in enumerate(aurora_ribbons):
        curve_points = []
        for x in range(screen_x0, screen_x1, 10):
            rel_x = (x - screen_x0) / screen_w
            offset_y = math.sin(rel_x * math.pi * 3.8 + a_idx * 1.5) * 85 + math.cos(rel_x * math.pi * 7.2) * 40
            cur_y = y_center + offset_y
            curve_points.append((x, cur_y))
            
            ray_len = 220 + int(math.sin(rel_x * 24 + a_idx * 2) * 80)
            ad.line([(x, cur_y - ray_len // 2), (x, cur_y + ray_len // 2)], fill=(*col[:3], int(col[3] * 0.45)), width=8)

        for p in range(len(curve_points) - 1):
            ad.line([curve_points[p], curve_points[p + 1]], fill=col, width=thickness)

    aurora_layer = aurora_layer.filter(ImageFilter.GaussianBlur(32))
    video_layer = Image.alpha_composite(video_layer, aurora_layer)
    vd = ImageDraw.Draw(video_layer)

    # 4.4 Procedural Alpine Mountains (Multi-octave natural jagged terrain)
    # Generate realistic heights for each column
    def generate_mountain_ridge(seed, base_y, peak_height, roughness):
        random.seed(seed)
        heights = []
        # Sum of harmonic sines + fractal noise
        phase1 = random.uniform(0, 10)
        phase2 = random.uniform(0, 10)
        phase3 = random.uniform(0, 10)
        phase4 = random.uniform(0, 10)
        
        for x in range(screen_x0, screen_x1 + 1):
            rel_x = (x - screen_x0) / screen_w
            # Macro peaks
            h1 = math.sin(rel_x * math.pi * 3.2 + phase1) * 0.45
            h2 = math.cos(rel_x * math.pi * 6.5 + phase2) * 0.25
            # Sharp ridges (inverted abs sines give sharp pyramid peaks)
            h3 = (1.0 - abs(math.sin(rel_x * math.pi * 5.0 + phase3))) * 0.35
            h4 = math.sin(rel_x * math.pi * 14.0 + phase4) * 0.12
            h5 = math.sin(rel_x * math.pi * 35.0) * 0.05
            
            total_h = (h1 + h2 + h3 + h4 + h5) * peak_height
            heights.append(base_y - total_h)
        return heights

    # Distant Mountain Range (Soft atmospheric blue haze)
    dist_heights = generate_mountain_ridge(555, horizon_y - 80, 420, 0.4)
    dist_poly = [(screen_x0, horizon_y)]
    for idx, x in enumerate(range(screen_x0, screen_x1 + 1)):
        dist_poly.append((x, dist_heights[idx]))
    dist_poly.append((screen_x1, horizon_y))
    vd.polygon(dist_poly, fill=(38, 35, 62, 255))

    # Grand Foreground Mountain Range with Slope Shading (Cool Aurora vs Warm Alpenglow)
    fore_heights = generate_mountain_ridge(888, horizon_y, 560, 0.6)
    
    # Draw vertical cliff strips with realistic lighting depending on slope gradient
    for idx, x in enumerate(range(screen_x0, screen_x1)):
        y_top = int(fore_heights[idx])
        # Compute slope
        next_y = fore_heights[idx + 1] if idx + 1 < len(fore_heights) else fore_heights[idx]
        slope = next_y - fore_heights[idx]
        
        # Shading: Slopes facing right (positive slope / downwards to right) catch sunset alpenglow
        # Slopes facing left catch cool aurora ambient
        if slope < -0.2: # Facing left / upward slope
            col_rock = (24, 28, 48)
            col_snow = (185, 230, 255)
        elif slope > 0.2: # Facing right / downward slope
            col_rock = (48, 28, 32)
            col_snow = (255, 175, 130)
        else:
            col_rock = (32, 30, 42)
            col_snow = (230, 220, 225)

        # Draw rock body
        vd.line([(x, y_top), (x, horizon_y)], fill=(*col_rock, 255), width=2)
        
        # Snow on upper 45% of peak
        peak_depth = horizon_y - y_top
        snow_depth = int(peak_depth * (0.35 + 0.15 * math.sin(x * 0.1)))
        if snow_depth > 15:
            vd.line([(x, y_top), (x, y_top + snow_depth)], fill=(*col_snow, 245), width=2)

    # Atmospheric mist at base of mountains
    mist = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    md = ImageDraw.Draw(mist)
    md.ellipse([screen_x0 - 200, horizon_y - 140, screen_x1 + 200, horizon_y + 60], fill=(245, 135, 75, 75))
    md.ellipse([screen_x0 + 400, horizon_y - 100, screen_x1 - 400, horizon_y + 30], fill=(255, 195, 135, 95))
    mist = mist.filter(ImageFilter.GaussianBlur(25))
    video_layer = Image.alpha_composite(video_layer, mist)
    vd = ImageDraw.Draw(video_layer)

    # 4.5 Dense Pine Forest Silhouette along Shoreline
    random.seed(333)
    for x in range(screen_x0, screen_x1, 8):
        th = random.randint(40, 110)
        tw = random.randint(12, 22)
        vd.polygon([(x, horizon_y), (x + tw // 2, horizon_y - th), (x + tw, horizon_y)], fill=(12, 16, 24, 255))

    # 4.6 Mirror Alpine Lake with Shimmering Water & Reflections
    lake_h = screen_y1 - horizon_y
    for y in range(horizon_y, screen_y1):
        rel = (y - horizon_y) / lake_h
        r = int(14 + 20 * (1.0 - rel) + 8 * math.sin(rel * 60))
        g = int(24 + 35 * (1.0 - rel) + 12 * math.sin(rel * 60))
        b = int(45 + 35 * (1.0 - rel) + 15 * math.sin(rel * 60))
        vd.line([(screen_x0, y), (screen_x1, y)], fill=(r, g, b, 255), width=1)

    # Mirrored reflections of Aurora & Sunset Glow
    lake_refl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    lrd = ImageDraw.Draw(lake_refl)
    lrd.ellipse([screen_x0 + 350, horizon_y - 10, screen_x0 + 1750, horizon_y + 360], fill=(0, 240, 160, 100))
    lrd.ellipse([screen_x1 - 1500, horizon_y - 10, screen_x1 - 300, horizon_y + 320], fill=(255, 125, 55, 90))
    lake_refl = lake_refl.filter(ImageFilter.GaussianBlur(30))
    video_layer = Image.alpha_composite(video_layer, lake_refl)
    vd = ImageDraw.Draw(video_layer)

    # Shimmering water ripples
    random.seed(777)
    for _ in range(400):
        wx = random.randint(screen_x0, screen_x1 - 120)
        wy = random.randint(horizon_y + 10, screen_y1 - 10)
        wlen = random.randint(35, 200)
        walpha = random.randint(25, 80)
        wcol = (175, 245, 255, walpha) if wx < cx else (255, 195, 135, walpha)
        vd.line([(wx, wy), (wx + wlen, wy)], fill=wcol, width=random.choice([1, 2]))

    # -------------------------------------------------------------------------
    # 5. SLEEK MODERN STREAMING HUD OVERLAY
    # -------------------------------------------------------------------------
    hud_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hud_layer)

    # 5.1 Top Bar
    top_bar_h = 200
    for y in range(screen_y0, screen_y0 + top_bar_h):
        alpha = int(195 * (1.0 - (y - screen_y0) / top_bar_h) ** 1.4)
        hd.line([(screen_x0, y), (screen_x1, y)], fill=(0, 0, 0, alpha), width=1)

    title_x = screen_x0 + 80
    title_y = screen_y0 + 55

    # Back Chevron
    hd.line([(title_x, title_y + 18), (title_x + 16, title_y + 4)], fill=(255, 255, 255, 255), width=4)
    hd.line([(title_x, title_y + 18), (title_x + 16, title_y + 32)], fill=(255, 255, 255, 255), width=4)

    # Program Title
    hd.text((title_x + 36, title_y), "PLANET EARTH III: AURORA ALPS", font=f_title, fill=(255, 255, 255, 255))
    hd.text((title_x + 36, title_y + 48), "Episode 3 \"Wilderness Under Aurora\"", font=f_sub, fill=(205, 218, 235, 240))
    
    # AI Match Badge
    match_tag_x = title_x + 480
    match_tag_y = title_y + 45
    hd.rounded_rectangle([match_tag_x, match_tag_y, match_tag_x + 220, match_tag_y + 32], radius=16, fill=(0, 210, 150, 60), outline=(0, 240, 180, 220), width=2)
    hd.text((match_tag_x + 18, match_tag_y + 6), "✨ 99.4% AI Match", font=f_badge, fill=(0, 255, 200, 255))

    # Format Badges
    badges = ["4K ULTRA HD", "HDR10+", "DOLBY VISION", "DOLBY ATMOS"]
    cur_bx = screen_x1 - 80
    for badge in reversed(badges):
        bbox = f_badge.getbbox(badge)
        bw_w = bbox[2] - bbox[0] + 28
        bx0 = cur_bx - bw_w
        hd.rounded_rectangle([bx0, title_y + 8, cur_bx, title_y + 42], radius=10, fill=(25, 32, 45, 190), outline=(110, 130, 160, 180), width=2)
        hd.text((bx0 + 14, title_y + 14), badge, font=f_badge, fill=(240, 245, 255, 255))
        cur_bx -= bw_w + 16

    # 5.2 Top-Right Picture-in-Picture "AI Up Next" Recommendation Card
    card_w = 580
    card_h = 190
    card_x1 = screen_x1 - 70
    card_x0 = card_x1 - card_w
    card_y0 = screen_y0 + 150
    card_y1 = card_y0 + card_h

    hd.rounded_rectangle([card_x0, card_y0, card_x1, card_y1], radius=24, fill=(15, 20, 30, 220), outline=(0, 195, 255, 190), width=3)
    hd.rounded_rectangle([card_x0 + 3, card_y0 + 3, card_x1 - 3, card_y0 + 44], radius=20, fill=(0, 140, 220, 180))
    hd.text((card_x0 + 20, card_y0 + 12), "✨ AI RECOMMENDATION • UP NEXT IN 15s", font=f_badge, fill=(255, 255, 255, 255))

    thumb_x0 = card_x0 + 20
    thumb_y0 = card_y0 + 58
    thumb_w = 170
    thumb_h = 112
    hd.rounded_rectangle([thumb_x0, thumb_y0, thumb_x0 + thumb_w, thumb_y0 + thumb_h], radius=14, fill=(14, 40, 68, 255), outline=(0, 220, 255, 200), width=2)
    hd.ellipse([thumb_x0 + 60, thumb_y0 + 30, thumb_x0 + 110, thumb_y0 + 80], fill=(0, 195, 255, 240))
    hd.polygon([
        (thumb_x0 + 80, thumb_y0 + 43),
        (thumb_x0 + 80, thumb_y0 + 67),
        (thumb_x0 + 98, thumb_y0 + 55)
    ], fill=(255, 255, 255, 255))

    hd.text((thumb_x0 + thumb_w + 20, thumb_y0 + 10), "SAVANNA LIONS 4K", font=f_card_title, fill=(255, 255, 255, 255))
    hd.text((thumb_x0 + thumb_w + 20, thumb_y0 + 42), "✨ 98.8% Match for You", font=f_card_sub, fill=(0, 240, 180, 255))
    hd.text((thumb_x0 + thumb_w + 20, thumb_y0 + 68), "Nature Doc • 54 min", font=f_card_sub, fill=(180, 195, 215, 220))

    # 5.3 Bottom Timeline Scrubber
    bottom_bar_h = 240
    for y in range(screen_y1 - bottom_bar_h, screen_y1):
        alpha = int(220 * ((y - (screen_y1 - bottom_bar_h)) / bottom_bar_h) ** 1.3)
        hd.line([(screen_x0, y), (screen_x1, y)], fill=(0, 0, 0, alpha), width=1)

    scrub_x0 = screen_x0 + 80
    scrub_x1 = screen_x1 - 80
    scrub_w = scrub_x1 - scrub_x0
    scrub_y = screen_y1 - 130
    scrub_h = 10

    hd.rounded_rectangle([scrub_x0, scrub_y, scrub_x1, scrub_y + scrub_h], radius=5, fill=(80, 95, 115, 160))
    
    buf_w = int(scrub_w * 0.72)
    hd.rounded_rectangle([scrub_x0, scrub_y, scrub_x0 + buf_w, scrub_y + scrub_h], radius=5, fill=(140, 160, 185, 200))
    
    play_w = int(scrub_w * 0.46)
    hd.rounded_rectangle([scrub_x0, scrub_y, scrub_x0 + play_w, scrub_y + scrub_h], radius=5, fill=(0, 215, 255, 255))

    knob_cx = scrub_x0 + play_w
    knob_cy = scrub_y + scrub_h // 2
    hd.ellipse([knob_cx - 16, knob_cy - 16, knob_cx + 16, knob_cy + 16], fill=(0, 230, 255, 255), outline=(255, 255, 255, 255), width=4)
    hd.ellipse([knob_cx - 6, knob_cy - 6, knob_cx + 6, knob_cy + 6], fill=(255, 255, 255, 255))

    ctrl_y = scrub_y + 45
    
    # Pause Button
    hd.ellipse([scrub_x0 - 5, ctrl_y - 20, scrub_x0 + 35, ctrl_y + 20], fill=(0, 195, 255, 240))
    hd.rectangle([scrub_x0 + 8, ctrl_y - 9, scrub_x0 + 13, ctrl_y + 9], fill=(255, 255, 255, 255))
    hd.rectangle([scrub_x0 + 17, ctrl_y - 9, scrub_x0 + 22, ctrl_y + 9], fill=(255, 255, 255, 255))

    # Next / Forward Icon
    hd.polygon([(scrub_x0 + 55, ctrl_y - 8), (scrub_x0 + 55, ctrl_y + 8), (scrub_x0 + 68, ctrl_y)], fill=(255, 255, 255, 240))
    hd.polygon([(scrub_x0 + 68, ctrl_y - 8), (scrub_x0 + 68, ctrl_y + 8), (scrub_x0 + 81, ctrl_y)], fill=(255, 255, 255, 240))

    # Speaker Volume Icon
    hd.polygon([
        (scrub_x0 + 110, ctrl_y - 5),
        (scrub_x0 + 118, ctrl_y - 5),
        (scrub_x0 + 128, ctrl_y - 10),
        (scrub_x0 + 128, ctrl_y + 10),
        (scrub_x0 + 118, ctrl_y + 5),
        (scrub_x0 + 110, ctrl_y + 5)
    ], fill=(255, 255, 255, 240))
    hd.arc([scrub_x0 + 124, ctrl_y - 8, scrub_x0 + 136, ctrl_y + 8], start=290, end=70, fill=(255, 255, 255, 240), width=2)
    hd.rounded_rectangle([scrub_x0 + 145, ctrl_y - 3, scrub_x0 + 215, ctrl_y + 3], radius=3, fill=(255, 255, 255, 220))

    # Timecode
    hd.text((scrub_x0 + 245, ctrl_y - 12), "36:42 / 58:15", font=f_time, fill=(240, 245, 255, 255))

    # Right side controls
    r_ctrl_x = scrub_x1
    hd.rectangle([r_ctrl_x - 24, ctrl_y - 12, r_ctrl_x, ctrl_y + 12], outline=(255, 255, 255, 240), width=2)
    hd.rounded_rectangle([r_ctrl_x - 110, ctrl_y - 16, r_ctrl_x - 40, ctrl_y + 16], radius=8, fill=(35, 45, 60, 200), outline=(120, 140, 170, 200), width=2)
    hd.text((r_ctrl_x - 100, ctrl_y - 10), "AUDIO", font=f_badge, fill=(240, 248, 255, 255))
    hd.rounded_rectangle([r_ctrl_x - 175, ctrl_y - 16, r_ctrl_x - 125, ctrl_y + 16], radius=8, fill=(0, 195, 255, 240))
    hd.text((r_ctrl_x - 165, ctrl_y - 10), "CC", font=f_badge, fill=(15, 20, 28, 255))

    video_layer = Image.alpha_composite(video_layer, hud_layer)

    # -------------------------------------------------------------------------
    # 6. ANTI-REFLECTIVE GLASS SPECULAR REFLECTIONS
    # -------------------------------------------------------------------------
    glass_glare = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ggd = ImageDraw.Draw(glass_glare)

    glare_points = [
        (screen_x0 + 80, screen_y0),
        (screen_x0 + 720, screen_y0),
        (screen_x0 + 380, screen_y1),
        (screen_x0, screen_y1)
    ]
    ggd.polygon(glare_points, fill=(255, 255, 255, 20))
    glass_glare = glass_glare.filter(ImageFilter.GaussianBlur(30))
    video_layer = Image.alpha_composite(video_layer, glass_glare)

    screen_mask = Image.new('L', (W, H), 0)
    smd = ImageDraw.Draw(screen_mask)
    smd.rounded_rectangle([screen_x0, screen_y0, screen_x1, screen_y1], radius=8, fill=255)

    canvas.paste(video_layer, (0, 0), screen_mask)

    inner_shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    isd = ImageDraw.Draw(inner_shadow)
    isd.rounded_rectangle([screen_x0, screen_y0, screen_x1, screen_y1], radius=8, outline=(0, 0, 0, 160), width=4)
    canvas = Image.alpha_composite(canvas, inner_shadow)

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

    target_w = 1400
    target_h = int(canvas.height * (target_w / canvas.width))
    final_img = canvas.resize((target_w, target_h), resample=Image.Resampling.LANCZOS)

    out_path = 'public/assets/obj_streaming_tv.png'
    final_img.save(out_path, 'PNG', optimize=True)
    print(f"Saved {out_path} with size {final_img.size}")

if __name__ == '__main__':
    render_realistic_tv()
    print("Realistic OLED Streaming TV asset rendered successfully!")
