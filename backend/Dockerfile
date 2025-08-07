# Base image nhẹ dùng Python 3.11
FROM python:3.11-slim

# Cài các gói cần thiết cho một số thư viện Python (như psycopg2-binary)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép và cài requirements sớm để tận dụng cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép toàn bộ source code vào container
COPY . .

# Mặc định expose cổng 8000
EXPOSE 8000

# Khởi động Gunicorn trực tiếp khi container chạy
CMD ["gunicorn", "qrcode_project.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
