from rest_framework import serializers
from .models import QRCode, QRBatch


class QRCodeSerializer(serializers.ModelSerializer):
    qr_image_url = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = QRCode
        fields = ["id", "url", "qr_image_url", "download_url", "created_at"]

    def get_qr_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None

    def get_download_url(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(f"/api/qrcode/{obj.id}/download/")
        return f"/api/qrcode/{obj.id}/download/"


class QRBatchSerializer(serializers.ModelSerializer):
    items = QRCodeSerializer(source="qrcodes", many=True, read_only=True)
    zip_url = serializers.SerializerMethodField()

    class Meta:
        model = QRBatch
        fields = ["id", "items", "zip_url", "created_at"]

    def get_zip_url(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(f"/api/qrcode/batch/{obj.id}/download/")
        return f"/api/qrcode/batch/{obj.id}/download/"
