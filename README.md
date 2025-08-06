# QR Code Generator - Django + React

## Tổng quan
Hệ thống tạo mã QR với hai chức năng chính:
- Tạo QR code từ URL đơn lẻ
- Tạo hàng loạt QR code từ file Excel
- Tải về file PNG hoặc ZIP
- Không yêu cầu đăng nhập

## Cấu trúc project
```
qr_project_complete/
├── backend/              # Django API
│   ├── qr_project/      # Django project
│   ├── qrcode_app/      # Django app
│   ├── media/           # Lưu trữ QR images
│   └── venv/            # Virtual environment
└── frontend/            # React app
```

## Cài đặt và chạy

### Backend (Django)
```bash
cd backend
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

python manage.py makemigrations
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
# Chạy trên http://localhost:3000
```

## API Endpoints

### Tạo QR code đơn lẻ
```
POST /api/qrcode/
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Tạo QR code hàng loạt
```
POST /api/qrcode/batch/
Content-Type: multipart/form-data

file: excel_file.xlsx
```

### Tải QR code
```
GET /api/qrcode/{qr_id}/download/
GET /api/qrcode/batch/{batch_id}/download/
```

## Tính năng

✅ Tạo QR code từ URL
✅ Upload Excel và tạo hàng loạt
✅ Xem trước QR code
✅ Tải PNG và ZIP
✅ Tránh tạo trùng lặp (hash URL)
✅ ZIP động trong RAM
✅ Interface thân thiện
✅ Responsive design
✅ Validation đầy đủ
✅ Error handling

## Công nghệ sử dụng

**Backend:**
- Django 4.2
- Django REST Framework
- qrcode library
- openpyxl (Excel processing)
- Pillow (Image processing)

**Frontend:**
- React 18
- Tailwind CSS
- Lucide React (Icons)
- Modern responsive design

## File Excel mẫu
Tạo file Excel với cấu trúc:
```
| URL                    |
|------------------------|
| https://google.com     |
| https://facebook.com   |
| https://github.com     |
```

## Mở rộng thêm
- Gắn logo vào QR code
- Tùy chỉnh màu sắc
- Auto-delete QR cũ
- Gửi email ZIP file
- Authentication (optional)
- QR code analytics
