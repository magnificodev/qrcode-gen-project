import qrcode
from urllib.parse import urlparse

def normalize_url(url):
    parsed = urlparse(url)
    if not parsed.scheme:
        return f"https://{url}"
    return url

def generate_qr_image(url):
    """Create QR code image from URL"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Convert to RGB if needed
    if img.mode != "RGB":
        img = img.convert("RGB")

    return img