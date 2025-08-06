from django.db import models
from django.utils import timezone
import hashlib


class QRCode(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    url = models.URLField(max_length=2000)
    image = models.ImageField(upload_to="qrcodes/")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "qrcode_qrcode"

    def __str__(self):
        return f"QR Code for {self.url}"

    @staticmethod
    def generate_id_from_url(url):
        """Create a unique ID from the URL using hash"""
        return "qrcode_" + hashlib.md5(url.encode()).hexdigest()[:10]


class QRBatch(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    created_at = models.DateTimeField(default=timezone.now)
    qrcodes = models.ManyToManyField(QRCode, related_name="batches")

    class Meta:
        db_table = "qrcode_qrbatch"

    def __str__(self):
        return f"Batch {self.id}"

    @staticmethod
    def generate_batch_id():
        """Create a unique batch ID"""
        import uuid

        return "batch_" + str(uuid.uuid4())[:8]
