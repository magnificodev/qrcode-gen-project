from django.contrib import admin
from django.utils.html import format_html
from .models import QRCode, QRBatch


@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = ("id", "url", "created_at")
    list_filter = ("created_at",)
    search_fields = ("url", "id")
    readonly_fields = ("id", "created_at")


@admin.register(QRBatch)
class QRBatchAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at", "get_qrcode_count")
    list_filter = ("created_at",)
    readonly_fields = ("id", "created_at")

    def get_qrcode_count(self, obj):
        return obj.qrcodes.count()

    get_qrcode_count.short_description = "QR Code Count"
