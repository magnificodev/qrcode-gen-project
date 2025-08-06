from django.urls import path
from . import views

urlpatterns = [
    path("qrcode", views.create_qrcode, name="create_qrcode"),
    path("qrcode/batch", views.create_batch_qrcode, name="create_batch_qrcode"),
    path("qrcode/<str:qr_id>", views.get_qrcode, name="get_qrcode"),
    path("qrcode/<str:qr_id>/download", views.download_qrcode, name="download_qrcode"),
    path(
        "qrcode/batch/<str:batch_id>/download",
        views.download_batch_zip,
        name="download_batch_zip",
    ),
]
