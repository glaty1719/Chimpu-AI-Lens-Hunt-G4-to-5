import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def get_font(size, bold=True):
    try:
        font_path = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
        return ImageFont.truetype(font_path, size)
    except Exception:
        return ImageFont.load_default()

def create_mask_from_rect(size, rect, radius=0):
    mask = Image.new('L', size, 0)
    d = ImageDraw.Draw(mask)
    if radius > 0:
        d.rounded_rectangle(rect, radius=radius, fill=255)
    else:
        d.rectangle(rect, fill=255)
    return mask

def render_streaming_tv():
    W, H = 3600, 2400
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))

    # Fonts
    f_h1 = get_font(50, bold=True)
    f_title = get_font(42, bold=True)
    f_sub = get_font(28, bold=True)
    f_body = get_font(24, bold=False)
    f_chip = get_font(24, bold=True)
    f_btn = get_font(26, bold=True)
    f_badge = get_font(22, bold=True)
    f_time = get_font(28, bold=True)

    # Geometry
    screen_x0, screen_y0 = 240, 160
    screen_x1, screen_y1 = 3360, 2040
    
    bezel_x0, bezel_y0 = 200, 120
    bezel_x1, bezel_y1 = 3400, 2080

    # -------------------------------------------------------------------------
    # 0. AMBILIGHT GLOW & CONTACT DROP SHADOW
    # -------------------------------------------------------------------------
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    
    # Ambilight dynamic glow from the playing video
    sd.ellipse([bezel_x0 - 180, bezel_y0 - 120, bezel_x1 + 180, bezel_y1 + 120], fill=(0, 140, 255, 75))
    sd.ellipse([bezel_x0 + 300, bezel_y0 - 100, bezel_x1 - 300, bezel_y1 + 100], fill=(160, 40, 240, 65))
    sd.ellipse([bezel_x0 + 700, bezel_y0 + 200, bezel_x1 + 150, bezel_y1 + 180], fill=(255, 90, 40, 55))
    
    # TV Frame Shadow
    sd.rounded_rectangle([bezel_x0 - 20, bezel_y0 + 40, bezel_x1 + 20, bezel_y1 + 80], radius=60, fill=(0, 0, 0, 140))
    # Stand Base Shadow
    sd.ellipse([1000, 2220, 2600, 2380], fill=(0, 0, 0, 170))
    shadow = shadow.filter(ImageFilter.GaussianBlur(55))
    canvas = Image.alpha_composite(canvas, shadow)

    # -------------------------------------------------------------------------
    # 1. STAND & PEDESTAL (Brushed Aerospace Titanium Base)
    # -------------------------------------------------------------------------
    stand_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    st_d = ImageDraw.Draw(stand_layer)

    # Vertical Column Neck
    st_d.polygon([(1680, 1950), (1920, 1950), (1960, 2240), (1640, 2240)], fill=(32, 38, 48, 255), outline=(15, 18, 24, 255), width=8)
    st_d.polygon([(1760, 1950), (1840, 1950), (1860, 2240), (1740, 2240)], fill=(65, 78, 98, 255))
    st_d.polygon([(1790, 1950), (1810, 1950), (1820, 2240), (1780, 2240)], fill=(120, 140, 170, 255))

    # Base Pedestal
    base_rect = [1150, 2200, 2450, 2320]
    st_d.rounded_rectangle(base_rect, radius=55, fill=(28, 33, 42, 255), outline=(15, 18, 24, 255), width=10)
    st_d.rounded_rectangle([1170, 2210, 2430, 2290], radius=45, fill=(45, 54, 68, 255), outline=(75, 90, 112, 255), width=6)
    st_d.line([(1200, 2235), (2400, 2235)], fill=(160, 180, 210, 255), width=8)
    st_d.line([(1350, 2240), (2250, 2240)], fill=(225, 240, 255, 255), width=4)
    st_d.rounded_rectangle([1250, 2300, 1450, 2330], radius=12, fill=(15, 18, 24, 255))
    st_d.rounded_rectangle([2150, 2300, 2350, 2330], radius=12, fill=(15, 18, 24, 255))

    canvas = Image.alpha_composite(canvas, stand_layer)

    # -------------------------------------------------------------------------
    # 2. TV OUTER BEZEL & METALLIC EDGES
    # -------------------------------------------------------------------------
    tv_body = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    tvd = ImageDraw.Draw(tv_body)

    tvd.rounded_rectangle([bezel_x0, bezel_y0, bezel_x1, bezel_y1], radius=45, fill=(24, 28, 36, 255), outline=(10, 12, 16, 255), width=12)
    tvd.rounded_rectangle([bezel_x0 + 4, bezel_y0 + 4, bezel_x1 - 4, bezel_y1 - 4], radius=42, outline=(85, 100, 125, 255), width=4)
    tvd.rounded_rectangle([screen_x0 - 10, screen_y0 - 10, screen_x1 + 10, screen_y1 + 10], radius=24, fill=(8, 10, 16, 255))

    # Bottom Edge Status Micro-LED
    tvd.rounded_rectangle([1650, 2050, 1950, 2068], radius=8, fill=(16, 20, 28, 255))
    tvd.ellipse([1790, 2054, 1810, 2064], fill=(0, 220, 255, 255))

    canvas = Image.alpha_composite(canvas, tv_body)

    # -------------------------------------------------------------------------
    # 3. FULL-SCREEN PLAYING VIDEO: CINEMATIC SCI-FI SPACE EXPEDITION
    # -------------------------------------------------------------------------
    screen_mask = create_mask_from_rect((W, H), [screen_x0, screen_y0, screen_x1, screen_y1], radius=20)
    video_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(video_layer)

    # A. Deep Cinematic Sky / Space
    vd.rectangle([screen_x0, screen_y0, screen_x1, screen_y1], fill=(8, 6, 24, 255))

    # B. Smooth Blurred Cosmic Nebula Layer
    nebula_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    nd = ImageDraw.Draw(nebula_layer)
    nebula_clouds = [
        (750, 600, 850, (130, 20, 210, 180)),
        (1650, 450, 950, (0, 130, 255, 160)),
        (2750, 650, 900, (255, 50, 120, 170)),
        (1350, 1050, 800, (0, 220, 170, 130)),
        (2350, 1150, 850, (255, 140, 20, 140))
    ]
    for nx, ny, nr, ncol in nebula_clouds:
        nd.ellipse([nx - nr, ny - nr, nx + nr, ny + nr], fill=ncol)
    
    nebula_layer = nebula_layer.filter(ImageFilter.GaussianBlur(90))
    video_layer = Image.alpha_composite(video_layer, nebula_layer)
    vd = ImageDraw.Draw(video_layer)

    # C. Distant Starfield Clusters
    random.seed(1337)
    for _ in range(200):
        sx = random.randint(screen_x0 + 20, screen_x1 - 20)
        sy = random.randint(screen_y0 + 20, screen_y1 - 80)
        sr = random.randint(2, 6)
        star_alpha = random.randint(140, 255)
        vd.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(255, 255, 255, star_alpha))
        if sr >= 5:
            vd.line([(sx - 14, sy), (sx + 14, sy)], fill=(200, 240, 255, 190), width=2)
            vd.line([(sx, sy - 14), (sx, sy + 14)], fill=(200, 240, 255, 190), width=2)

    # D. Giant Ringed Exoplanet
    px, py, pr = 1000, 1250, 560
    # Planet Base
    vd.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(26, 16, 58, 255), outline=(130, 75, 240, 255), width=8)
    vd.ellipse([px - pr + 35, py - pr + 35, px + pr - 35, py + pr - 35], fill=(42, 24, 90, 255))
    # Glowing Turquoise Atmospheric Halo
    vd.arc([px - pr, py - pr, px + pr, py + pr], start=195, end=345, fill=(0, 240, 255, 255), width=22)
    # Luminous Rings
    vd.ellipse([px - 880, py - 140, px + 880, py + 140], outline=(0, 220, 255, 220), width=20)
    vd.ellipse([px - 950, py - 180, px + 950, py + 180], outline=(255, 90, 210, 160), width=10)
    vd.ellipse([px - 1020, py - 220, px + 1020, py + 220], outline=(0, 255, 200, 120), width=6)

    # E. Futuristic Sci-Fi Exploration Cruiser (Hero Ship)
    ship_x, ship_y = 2220, 880
    
    # Engine Plasma Glow / Thruster Plumes
    thruster_glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    tgd = ImageDraw.Draw(thruster_glow)
    # Upper engine plume
    tgd.polygon([(ship_x - 300, ship_y - 50), (ship_x - 820, ship_y - 90), (ship_x - 300, ship_y - 10)], fill=(0, 220, 255, 220))
    # Lower engine plume
    tgd.polygon([(ship_x - 300, ship_y + 10), (ship_x - 820, ship_y + 90), (ship_x - 300, ship_y + 50)], fill=(0, 220, 255, 220))
    # Core hot white trails
    tgd.line([(ship_x - 280, ship_y - 30), (ship_x - 900, ship_y - 50)], fill=(255, 255, 255, 255), width=14)
    tgd.line([(ship_x - 280, ship_y + 30), (ship_x - 900, ship_y + 50)], fill=(255, 255, 255, 255), width=14)
    thruster_glow = thruster_glow.filter(ImageFilter.GaussianBlur(12))
    video_layer = Image.alpha_composite(video_layer, thruster_glow)
    vd = ImageDraw.Draw(video_layer)

    # Sleek Titanium Hull
    hull_pts = [
        (ship_x + 400, ship_y),            # Nose tip
        (ship_x + 100, ship_y - 75),        # Forward hull top
        (ship_x - 200, ship_y - 170),       # Port wingtip
        (ship_x - 340, ship_y - 75),        # Port engine nacelle
        (ship_x - 300, ship_y),             # Rear centerline
        (ship_x - 340, ship_y + 75),        # Starboard engine nacelle
        (ship_x - 200, ship_y + 170),       # Starboard wingtip
        (ship_x + 100, ship_y + 75)         # Forward hull bottom
    ]
    vd.polygon(hull_pts, fill=(236, 244, 254, 255), outline=(75, 95, 122, 255), width=8)
    
    # Dark Titanium Hull Panels
    vd.polygon([(ship_x + 160, ship_y - 42), (ship_x + 340, ship_y), (ship_x + 160, ship_y + 42), (ship_x - 100, ship_y)], fill=(30, 38, 54, 255))
    # Glowing Cyan Cockpit Canopy
    vd.polygon([(ship_x + 200, ship_y - 18), (ship_x + 300, ship_y), (ship_x + 200, ship_y + 18)], fill=(0, 230, 255, 255), outline=(255, 255, 255, 255), width=4)
    # Wing Strobe Beacons
    vd.ellipse([ship_x - 210, ship_y - 180, ship_x - 190, ship_y - 160], fill=(255, 60, 100, 255))
    vd.ellipse([ship_x - 210, ship_y + 160, ship_x - 190, ship_y + 180], fill=(0, 255, 180, 255))

    # Expanding Energy Shield Wave
    vd.ellipse([ship_x - 260, ship_y - 260, ship_x + 460, ship_y + 260], outline=(0, 220, 255, 100), width=6)

    # ---------------------------------------------------------
    # 4. VIDEO PLAYER HUD OVERLAY (Cinematic Scrims & Controls)
    # ---------------------------------------------------------
    
    # A. Top Gradient Scrim
    top_scrim = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    tsd = ImageDraw.Draw(top_scrim)
    tsd.rectangle([screen_x0, screen_y0, screen_x1, screen_y0 + 260], fill=(6, 10, 20, 200))
    top_scrim = top_scrim.filter(ImageFilter.GaussianBlur(12))
    video_layer = Image.alpha_composite(video_layer, top_scrim)
    vd = ImageDraw.Draw(video_layer)

    # Back Button & Title
    vd.polygon([(screen_x0 + 60, screen_y0 + 75), (screen_x0 + 85, screen_y0 + 52), (screen_x0 + 85, screen_y0 + 98)], fill=(255, 255, 255, 255))
    vd.text((screen_x0 + 115, screen_y0 + 52), "COSMIC ODYSSEY: AI VOYAGE", fill=(255, 255, 255, 255), font=f_h1)
    vd.text((screen_x0 + 115, screen_y0 + 115), "Season 1 • Episode 8 \"The Neural Singularity\" • AI Match 99%", fill=(0, 220, 255, 255), font=f_sub)

    # Top Right Badges
    qx = screen_x1 - 580
    qy = screen_y0 + 55
    vd.rounded_rectangle([qx, qy, qx + 130, qy + 55], radius=10, fill=(230, 45, 80, 240), outline=(255, 255, 255, 220), width=2)
    vd.text((qx + 18, qy + 14), "4K HDR", fill=(255, 255, 255, 255), font=f_badge)
    
    vd.rounded_rectangle([qx + 145, qy, qx + 285, qy + 55], radius=10, fill=(20, 32, 54, 220), outline=(0, 200, 255, 200), width=2)
    vd.text((qx + 165, qy + 14), "60 FPS", fill=(0, 220, 255, 255), font=f_badge)
    
    vd.rounded_rectangle([qx + 300, qy, qx + 480, qy + 55], radius=10, fill=(20, 32, 54, 220), outline=(80, 100, 130, 200), width=2)
    vd.text((qx + 320, qy + 14), "DOLBY ATMOS", fill=(220, 235, 255, 255), font=f_badge)

    # ---------------------------------------------------------
    # B. FLOATING "AI RECOMMENDED NEXT" PiP CARD
    # ---------------------------------------------------------
    pip_w, pip_h = 600, 320
    pip_x = screen_x1 - pip_w - 60
    pip_y = screen_y0 + 240
    
    # Glassmorphic Box
    vd.rounded_rectangle([pip_x, pip_y, pip_x + pip_w, pip_y + pip_h], radius=22, fill=(12, 20, 36, 235), outline=(0, 210, 255, 240), width=4)
    # Header Banner
    vd.rounded_rectangle([pip_x + 6, pip_y + 6, pip_x + pip_w - 6, pip_y + 60], radius=16, fill=(0, 160, 240, 255))
    vd.text((pip_x + 25, pip_y + 16), "AI UP NEXT IN 15s", fill=(255, 255, 255, 255), font=f_chip)
    
    # Thumbnail
    thumb_x, thumb_y = pip_x + 22, pip_y + 78
    thumb_w, thumb_h = 230, 140
    vd.rounded_rectangle([thumb_x, thumb_y, thumb_x + thumb_w, thumb_y + thumb_h], radius=12, fill=(4, 18, 38, 255), outline=(0, 240, 200, 200), width=2)
    # Jellyfish in thumbnail
    vd.chord([thumb_x + 65, thumb_y + 15, thumb_x + 165, thumb_y + 115], start=180, end=360, fill=(0, 255, 200, 200))
    vd.ellipse([thumb_x + 70, thumb_y + 65, thumb_x + 160, thumb_y + 85], fill=(0, 200, 255, 220))
    # Play icon
    vd.polygon([(thumb_x + 105, thumb_y + 55), (thumb_x + 130, thumb_y + 70), (thumb_x + 105, thumb_y + 85)], fill=(255, 255, 255, 255))

    # Details
    vd.text((pip_x + 275, pip_y + 82), "DEEP OCEAN 4K", fill=(255, 255, 255, 255), font=f_title)
    vd.text((pip_x + 275, pip_y + 130), "99.4% AI Match", fill=(0, 255, 200, 255), font=f_sub)
    vd.text((pip_x + 275, pip_y + 168), "Nature Doc • 48m", fill=(160, 185, 215, 240), font=f_body)

    # Action Buttons
    vd.rounded_rectangle([pip_x + 22, pip_y + 238, pip_x + 270, pip_y + 298], radius=14, fill=(0, 210, 255, 255))
    vd.text((pip_x + 65, pip_y + 252), "PLAY NOW >", fill=(6, 18, 36, 255), font=f_btn)
    
    vd.rounded_rectangle([pip_x + 295, pip_y + 238, pip_x + pip_w - 22, pip_y + 298], radius=14, fill=(24, 35, 55, 240), outline=(80, 100, 130, 220), width=2)
    vd.text((pip_x + 365, pip_y + 252), "DISMISS", fill=(200, 220, 245, 255), font=f_btn)

    # ---------------------------------------------------------
    # C. BOTTOM CINEMATIC VIDEO SCRUBBER & PLAYBACK CONTROLS
    # ---------------------------------------------------------
    bot_scrim = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bsd = ImageDraw.Draw(bot_scrim)
    bsd.rectangle([screen_x0, screen_y1 - 320, screen_x1, screen_y1], fill=(6, 10, 20, 230))
    bot_scrim = bot_scrim.filter(ImageFilter.GaussianBlur(14))
    video_layer = Image.alpha_composite(video_layer, bot_scrim)
    vd = ImageDraw.Draw(video_layer)

    # Progress Timeline Track
    prog_y = screen_y1 - 210
    prog_x0 = screen_x0 + 80
    prog_x1 = screen_x1 - 80
    prog_w = prog_x1 - prog_x0

    # Unbuffered Track
    vd.rounded_rectangle([prog_x0, prog_y - 6, prog_x1, prog_y + 6], radius=6, fill=(50, 60, 80, 240))
    
    # Buffered Track (72%)
    buf_x = prog_x0 + int(prog_w * 0.72)
    vd.rounded_rectangle([prog_x0, prog_y - 6, buf_x, prog_y + 6], radius=6, fill=(100, 125, 160, 255))
    
    # Played Track (48% - Glowing Cyan)
    play_x = prog_x0 + int(prog_w * 0.48)
    vd.rounded_rectangle([prog_x0, prog_y - 6, play_x, prog_y + 6], radius=6, fill=(0, 220, 255, 255))
    
    # Scrubber Knob
    vd.ellipse([play_x - 18, prog_y - 18, play_x + 18, prog_y + 18], fill=(0, 220, 255, 255), outline=(255, 255, 255, 255), width=4)
    vd.ellipse([play_x - 6, prog_y - 6, play_x + 6, prog_y + 6], fill=(6, 18, 36, 255))

    # Chapter Markers
    for chap_pct in [0.22, 0.48, 0.75, 0.90]:
        cx = prog_x0 + int(prog_w * chap_pct)
        vd.rectangle([cx - 2, prog_y - 8, cx + 2, prog_y + 8], fill=(255, 255, 255, 255))

    # Control Bar Row
    ctrl_y = screen_y1 - 110

    # Play/Pause Button
    vd.ellipse([prog_x0 + 10, ctrl_y - 35, prog_x0 + 80, ctrl_y + 35], fill=(0, 210, 255, 255), outline=(255, 255, 255, 255), width=3)
    vd.rounded_rectangle([prog_x0 + 32, ctrl_y - 18, prog_x0 + 40, ctrl_y + 18], radius=3, fill=(6, 18, 36, 255))
    vd.rounded_rectangle([prog_x0 + 50, ctrl_y - 18, prog_x0 + 58, ctrl_y + 18], radius=3, fill=(6, 18, 36, 255))

    # Rewind 10s
    vd.polygon([(prog_x0 + 130, ctrl_y), (prog_x0 + 155, ctrl_y - 18), (prog_x0 + 155, ctrl_y + 18)], fill=(200, 225, 255, 255))
    vd.polygon([(prog_x0 + 155, ctrl_y), (prog_x0 + 180, ctrl_y - 18), (prog_x0 + 180, ctrl_y + 18)], fill=(200, 225, 255, 255))

    # Fast-Forward 10s
    vd.polygon([(prog_x0 + 230, ctrl_y), (prog_x0 + 205, ctrl_y - 18), (prog_x0 + 205, ctrl_y + 18)], fill=(200, 225, 255, 255))
    vd.polygon([(prog_x0 + 255, ctrl_y), (prog_x0 + 230, ctrl_y - 18), (prog_x0 + 230, ctrl_y + 18)], fill=(200, 225, 255, 255))

    # Volume Speaker
    vx = prog_x0 + 310
    vd.polygon([(vx, ctrl_y - 10), (vx + 14, ctrl_y - 10), (vx + 28, ctrl_y - 20), (vx + 28, ctrl_y + 20), (vx + 14, ctrl_y + 10), (vx, ctrl_y + 10)], fill=(200, 225, 255, 255))
    vd.arc([vx + 22, ctrl_y - 16, vx + 42, ctrl_y + 16], start=300, end=60, fill=(0, 220, 255, 255), width=3)
    vd.arc([vx + 18, ctrl_y - 24, vx + 52, ctrl_y + 24], start=300, end=60, fill=(0, 220, 255, 255), width=3)
    
    # Volume Slider
    vd.rounded_rectangle([vx + 65, ctrl_y - 4, vx + 185, ctrl_y + 4], radius=4, fill=(60, 75, 100, 255))
    vd.rounded_rectangle([vx + 65, ctrl_y - 4, vx + 155, ctrl_y + 4], radius=4, fill=(0, 220, 255, 255))
    vd.ellipse([vx + 150, ctrl_y - 10, vx + 162, ctrl_y + 10], fill=(255, 255, 255, 255))

    # Time Display
    vd.text((vx + 220, ctrl_y - 16), "42:18", fill=(255, 255, 255, 255), font=f_time)
    vd.text((vx + 310, ctrl_y - 16), "/ 1:28:45", fill=(140, 165, 195, 255), font=f_time)

    # Right Controls
    rx = prog_x1
    vd.rectangle([rx - 45, ctrl_y - 20, rx, ctrl_y + 20], outline=(200, 225, 255, 255), width=3)
    vd.rounded_rectangle([rx - 160, ctrl_y - 22, rx - 75, ctrl_y + 22], radius=8, fill=(24, 36, 56, 240), outline=(80, 110, 150, 220), width=2)
    vd.text((rx - 145, ctrl_y - 14), "AUDIO", fill=(200, 225, 255, 255), font=f_chip)
    vd.rounded_rectangle([rx - 250, ctrl_y - 22, rx - 180, ctrl_y + 22], radius=8, fill=(0, 200, 255, 255))
    vd.text((rx - 238, ctrl_y - 14), "CC", fill=(6, 18, 36, 255), font=f_chip)

    # Composite Video
    video_masked = Image.composite(video_layer, Image.new('RGBA', (W, H), (0, 0, 0, 0)), screen_mask)
    canvas = Image.alpha_composite(canvas, video_masked)

    # ---------------------------------------------------------
    # 5. SPECULAR GLASS REFLECTION SHEEN
    # ---------------------------------------------------------
    sheen = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sh_d = ImageDraw.Draw(sheen)
    sh_d.polygon([(screen_x0 + 350, screen_y0), (screen_x0 + 850, screen_y0), (screen_x0 + 200, screen_y1), (screen_x0 - 300, screen_y1)], fill=(255, 255, 255, 30))
    sheen_masked = Image.composite(sheen, Image.new('RGBA', (W, H), (0, 0, 0, 0)), screen_mask)
    canvas = Image.alpha_composite(canvas, sheen_masked)

    return canvas

def save_supersampled(img, path, max_dim=1200):
    bbox = img.getbbox()
    if bbox:
        w, h = img.size
        x0 = max(0, bbox[0] - 16)
        y0 = max(0, bbox[1] - 16)
        x1 = min(w, bbox[2] + 16)
        y1 = min(h, bbox[3] + 16)
        img = img.crop((x0, y0, x1, y1))
    
    w, h = img.size
    scale = min(1.0, max_dim / max(w, h))
    if scale < 1.0:
        target_w = int(w * scale)
        target_h = int(h * scale)
        img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    img.save(path)
    print(f"Saved {path} with size {img.size}")

if __name__ == '__main__':
    rendered = render_streaming_tv()
    save_supersampled(rendered, 'public/assets/obj_streaming_tv.png', 1200)
    print("Streaming TV playing video asset updated successfully!")
