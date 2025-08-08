from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse, Http404
from django.core.files.base import ContentFile
import os
from .models import QRCode, QRBatch
from .serializers import QRCodeSerializer, QRBatchSerializer
import io
import zipfile
import openpyxl
from .utils import normalize_url, generate_qr_image


@api_view(["POST"])
def create_qrcode(request):
    """Create QR code from URL"""
    url = request.data.get("url")
    if not url:
        return Response(
            {"error": "URL is required"}, status=status.HTTP_400_BAD_REQUEST
        )
        
    normalized_url = normalize_url(url)

    # Create or get existing QR code
    qr_id = QRCode.generate_id_from_url(normalized_url)
    qrcode_obj, created = QRCode.objects.get_or_create(id=qr_id, defaults={"url": normalized_url})

    # If new, generate QR image
    if created or not qrcode_obj.image:
        img = generate_qr_image(normalized_url)

        # Save image to model
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        filename = f"{qr_id}.png"
        qrcode_obj.image.save(filename, ContentFile(buffer.getvalue()), save=True)

    serializer = QRCodeSerializer(qrcode_obj, context={"request": request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def create_batch_qrcode(request):
    """Create list of QR codes from Excel file"""
    if "file" not in request.FILES:
        return Response(
            {"error": "File is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    file = request.FILES["file"]
    if not file.name.endswith(".xlsx"):
        return Response(
            {"error": "Only .xlsx files are supported"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Read Excel file
        wb = openpyxl.load_workbook(file)
        ws = wb.active

        urls = set()  # Use set to avoid duplicates
        for row in ws.iter_rows(min_row=1, values_only=True):
            if row[0]:
                url = normalize_url(str(row[0]).strip())
                urls.add(url)

        if not urls:
            return Response(
                {"error": "No valid URLs found in Excel file"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create batch
        batch = QRBatch.objects.create(id=QRBatch.generate_batch_id())

        # Create QR codes
        for url in urls:
            qr_id = QRCode.generate_id_from_url(url)
            qrcode_obj, created = QRCode.objects.get_or_create(
                id=qr_id, defaults={"url": url}
            )

            # If new, generate QR image
            if created or not qrcode_obj.image:
                img = generate_qr_image(url)
                buffer = io.BytesIO()
                img.save(buffer, format="PNG")
                buffer.seek(0)

                filename = f"{qr_id}.png"
                qrcode_obj.image.save(
                    filename, ContentFile(buffer.getvalue()), save=True
                )

            batch.qrcodes.add(qrcode_obj)

        serializer = QRBatchSerializer(batch, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {"error": f"Error processing Excel file: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["GET"])
def get_qrcode(request, qr_id):
    """Get QR code information"""
    try:
        qrcode_obj = QRCode.objects.get(id=qr_id)
        serializer = QRCodeSerializer(qrcode_obj, context={"request": request})
        return Response(serializer.data)
    except QRCode.DoesNotExist:
        return Response(
            {"error": "QR code not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["GET"])
def download_qrcode(request, qr_id):
    """Download QR code image"""
    try:
        qrcode_obj = QRCode.objects.get(id=qr_id)
        if not qrcode_obj.image:
            raise Http404("QR image not found")

        with open(qrcode_obj.image.path, "rb") as f:
            response = HttpResponse(f.read(), content_type="image/png")
            response["Content-Disposition"] = f'attachment; filename="{qr_id}.png"'
            return response

    except QRCode.DoesNotExist:
        raise Http404("QR code not found")


@api_view(["GET"])
def download_batch_zip(request, batch_id):
    """Create and download ZIP file containing all QR codes in batch"""
    try:
        batch = QRBatch.objects.get(id=batch_id)
        qrcodes = batch.qrcodes.all()

        if not qrcodes.exists():
            return Response(
                {"error": "No QR codes found in batch"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create ZIP file in memory
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            for qr in qrcodes:
                if qr.image and os.path.exists(qr.image.path):
                    filename = f"{qr.id}.png"
                    zf.write(qr.image.path, arcname=filename)

        buffer.seek(0)

        response = HttpResponse(buffer.getvalue(), content_type="application/zip")
        response["Content-Disposition"] = (
            f'attachment; filename="{batch_id}_qrcodes.zip"'
        )
        return response

    except QRBatch.DoesNotExist:
        return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)
