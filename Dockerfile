# Multi-stage Docker build for production

# Backend stage
FROM python:3.11-slim as backend

WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
RUN python manage.py collectstatic --noinput
RUN python manage.py makemigrations && python manage.py migrate

# Frontend stage  
FROM node:18-alpine as frontend

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ .
RUN npm run build

# Production stage
FROM python:3.11-slim as production

WORKDIR /app
COPY --from=backend /app/backend .
COPY --from=frontend /app/frontend/build ./static_frontend

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
