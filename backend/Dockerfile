# ======== Stage 1: Build image ========
FROM python:3.12-slim

# Set env
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port (cho Uvicorn hoặc Gunicorn)
EXPOSE 8000

# Command để chạy server trong production mode
CMD ["gunicorn", "qrcode_project.wsgi:application", "--bind", "0.0.0.0:8000"]