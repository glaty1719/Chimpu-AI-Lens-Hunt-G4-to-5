from PIL import Image

def clean_smart_speaker():
    img = Image.open('public/assets/obj_smart_speaker.png').convert('RGBA')
    w, h = img.size
    pix = img.load()

    # Create cleaned canvas
    cleaned = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    cpix = cleaned.load()

    # The cylinder base is symmetrical with center ~239, bottom ~802, top of base ~700
    # Let's inspect each pixel
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a == 0:
                continue
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            
            # Floor background/shadow removal rules:
            # 1. Any pixel with lum > 130 is background floor/shadow
            if lum > 130:
                continue
            
            # 2. Bottom shadow check: below y=680, only keep dark base pixels
            if y > 680:
                # Check if this pixel is part of the speaker body or base
                # Left cylinder edge is around x=10..15 at y=680, curving inward to x=150 at y=800
                # Right cylinder edge is around x=415..420 at y=680, curving inward to x=280 at y=800
                # Any pixel outside the speaker base curve is floor shadow
                # Distance from center x=225
                cx, cy = 222, 690
                # Check base contour
                if y > 795 and (x < 150 or x > 285):
                    continue
                if y > 780 and (x < 110 or x > 330):
                    continue
                if y > 750 and (x < 55 or x > 380):
                    continue
                if y > 720 and (x < 30 or x > 410):
                    continue
                if y > 700 and (x < 15 or x > 425):
                    continue
                
                # Dark base pixels only (lum < 95)
                if lum > 95:
                    continue

            cpix[x, y] = (r, g, b, a)

    # Tight crop
    bbox = cleaned.getbbox()
    if bbox:
        x0 = max(0, bbox[0] - 4)
        y0 = max(0, bbox[1] - 4)
        x1 = min(w, bbox[2] + 4)
        y1 = min(h, bbox[3] + 4)
        cleaned = cleaned.crop((x0, y0, x1, y1))

    cleaned.save('public/assets/obj_smart_speaker.png')
    print(f'Successfully saved cleaned obj_smart_speaker.png with size {cleaned.size}')

if __name__ == '__main__':
    clean_smart_speaker()
