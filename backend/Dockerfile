FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update && \
    apt-get install -y build-essential gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

RUN mkdir -p /var/www/media /var/www/static

CMD python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    gunicorn qrcode_project.wsgi:application --bind 0.0.0.0:8000 --workers 3
