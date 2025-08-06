import qrcode
from qrcode.image.styledpil import StyledPilImage
import pandas as pd
import zipfile
import io
import os
import tempfile
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from PIL import Image
import re
from datetime import datetime


def validate_and_normalize_url(url):
    """Validate and normalize URL"""
    if not url or pd.isna(url):
        return None

    url = str(url).strip()
    if not url:
        return None

    # Add https:// if protocol is missing
    if not re.match(r"^https?://", url):
        url = f"https://{url}"

    # Basic URL format validation
    url_pattern = re.compile(
        r"^https?://"  # http:// hoặc https://
        r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"  # domain...
        r"localhost|"  # localhost...
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"  # ...hoặc ip
        r"(?::\d+)?"  # optional port
        r"(?:/?|[/?]\S+)$",
        re.IGNORECASE,
    )

    if url_pattern.match(url):
        return url
    return None


def create_qr_code_image(url, size=10, border=4):
    """Create QR code image from URL"""
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=size,
            border=border,
        )
        qr.add_data(url)
        qr.make(fit=True)

        # Create QR code image
        img = qr.make_image(fill_color="black", back_color="white")

        # Convert to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="PNG")
        img_bytes.seek(0)

        return img_bytes.getvalue()
    except Exception as e:
        print(f"Error creating QR code for URL {url}: {e}")
        return None


def find_url_column(df):
    """Find URL column in DataFrame"""
    # List of possible column names that might contain URLs
    possible_columns = [
        "url",
        "link",
        "URL",
        "Link",
        "urls",
        "links",
        "website",
        "Website",
        "web",
        "Web",
        "site",
        "Site",
        "domain",
        "Domain",
        "address",
        "Address",
    ]

    # Find column by name
    for col_name in possible_columns:
        if col_name in df.columns:
            return col_name

    # If not found, check each column's content
    for col in df.columns:
        sample_values = df[col].dropna().head(5).astype(str)
        url_count = 0
        for value in sample_values:
            if re.match(r"^https?://", value) or "." in value:
                url_count += 1

        # If more than 50% of values in the column look like URLs
        if url_count / len(sample_values) > 0.5:
            return col

    # Fallback: use first column
    return df.columns[0] if len(df.columns) > 0 else None


def read_excel_file(file_path):
    """Read Excel file and return DataFrame"""
    try:
        # Try reading with openpyxl first
        df = pd.read_excel(file_path, engine="openpyxl")
        return df
    except:
        try:
            # If not, try with xlrd
            df = pd.read_excel(file_path, engine="xlrd")
            return df
        except Exception as e:
            raise Exception(f"Cannot read Excel file: {str(e)}")


def create_zip_file_from_qr_codes(qr_data_list, batch_job=None):
    """
    Create ZIP file from list of QR codes
    qr_data_list: list of dict with keys: 'filename', 'qr_bytes', 'url'
    """
    try:
        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for i, qr_data in enumerate(qr_data_list):
                if qr_data["qr_bytes"]:
                    filename = qr_data.get("filename", f"qrcode_{i+1:03d}.png")
                    zip_file.writestr(filename, qr_data["qr_bytes"])

                # Update progress if batch_job exists
                if batch_job:
                    batch_job.processed_urls = i + 1
                    batch_job.save()

        zip_buffer.seek(0)
        return zip_buffer.getvalue()

    except Exception as e:
        raise Exception(f"Error creating ZIP file: {str(e)}")


def process_excel_to_qr_codes(excel_file_path, size=10, border=4):
    """
    Process Excel file and create QR codes
    Returns tuple: (qr_data_list, total_urls, successful_qrs, error_messages)
    """
    try:
        # Read Excel file
        df = read_excel_file(excel_file_path)

        if df.empty:
            raise Exception("Excel file is empty")

        # Find URL column
        url_column = find_url_column(df)
        if not url_column:
            raise Exception("URL column not found")

        # Get list of URLs
        urls = df[url_column].dropna().tolist()
        total_urls = len(urls)

        if total_urls == 0:
            raise Exception("No URL found in the file")

        qr_data_list = []
        successful_qrs = 0
        error_messages = []

        for i, url in enumerate(urls, 1):
            # Validate và chuẩn hóa URL
            clean_url = validate_and_normalize_url(url)

            if not clean_url:
                error_messages.append(f"Row {i}: Invalid URL - {url}")
                continue

            # Tạo QR code
            qr_bytes = create_qr_code_image(clean_url, size, border)

            if qr_bytes:
                qr_data_list.append(
                    {
                        "filename": f'qrcode_{i:03d}_{clean_url.replace("https://", "").replace("http://", "")[:30]}.png',
                        "qr_bytes": qr_bytes,
                        "url": clean_url,
                    }
                )
                successful_qrs += 1
            else:
                error_messages.append(
                    f"Row {i}: Cannot create QR code for - {clean_url}"
                )

        return qr_data_list, total_urls, successful_qrs, error_messages

    except Exception as e:
        raise Exception(f"Error processing Excel file: {str(e)}")


def create_zip_file_from_batch_items(batch_items, batch_job):
    """Create ZIP file from list of QRCodeBatchItem"""
    import zipfile
    from io import BytesIO

    zip_buffer = BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for item in batch_items:
            if item.qr_code and item.qr_code.qr_image:
                try:
                    # Read QR code file
                    with open(item.qr_code.qr_image.path, "rb") as qr_file:
                        qr_data = qr_file.read()

                    # Create safe filename
                    safe_url = clean_filename(item.original_url)
                    filename = f"qr_{item.order+1:03d}_{safe_url}.png"

                    # Add to ZIP
                    zip_file.writestr(filename, qr_data)
                except Exception as e:
                    print(f"Error adding {item.original_url} to ZIP: {e}")
                    continue

    zip_buffer.seek(0)
    return zip_buffer.read()


def clean_filename(filename):
    """Clean filename to avoid special characters"""
    # Remove special characters and replace with underscore
    clean_name = re.sub(r"[^\w\-_\.]", "_", filename)
    # Remove consecutive underscores
    clean_name = re.sub(r"_+", "_", clean_name)
    return clean_name[:100]  # Limit file name length
