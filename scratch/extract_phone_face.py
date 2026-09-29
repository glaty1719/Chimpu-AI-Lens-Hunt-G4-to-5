from PIL import Image, ImageDraw, ImageFilter

def extract_phone_transparent():
    src_path = 'public/assets/obj_phone_face.png'
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size

    # High-precision alpha mask
    mask = Image.new('L', (w, h), 0)
    md = ImageDraw.Draw(mask)

    # Phone chassis bounding geometry
    x0, y0 = 11, 12
    x1, y1 = 1415, 2948
    radius = 148

    # Side buttons on right edge
    # Button 1 (volume/action buttons)
    md.rounded_rectangle([1412, 386, 1431, 641], radius=8, fill=255)
    # Button 2 (power button)
    md.rounded_rectangle([1412, 713, 1431, 993], radius=8, fill=255)

    # Main rounded chassis body
    md.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=255)

    # Sub-pixel anti-aliasing for ultra clean alpha edges
    mask = mask.filter(ImageFilter.GaussianBlur(0.75))

    # Apply mask to create transparent PNG
    phone_transparent = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    phone_transparent = Image.composite(img, phone_transparent, mask)

    # Crop tightly to content
    bbox = phone_transparent.getbbox()
    if bbox:
        phone_transparent = phone_transparent.crop(bbox)

    # Save cleanly to public/assets/obj_phone_face.png
    dest_path = 'public/assets/obj_phone_face.png'
    phone_transparent.save(dest_path)
    print(f'Successfully saved transparent phone to {dest_path} with size {phone_transparent.size}')

if __name__ == '__main__':
    extract_phone_transparent()

