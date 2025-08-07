#!/bin/bash

echo "🚀 Deploying QR Code Generator (React + Django)..."

# Check if required files exist
if [ ! -f backend/.env ]; then
    echo "❌ backend/.env file not found!"
    echo "📝 Please create backend/.env with Django settings"
    exit 1
fi

if [ ! -f frontend/.env ]; then
    echo "❌ frontend/.env file not found!" 
    echo "📝 Please create frontend/.env with VITE_API_URL"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for containers to start
echo "⏳ Waiting for services to start..."
sleep 25

# Run Django migrations
echo "📊 Running Django migrations..."
docker-compose exec -T backend python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
docker-compose exec -T backend python manage.py collectstatic --noinput

# Check container status
echo "✅ Checking container status..."
docker-compose ps

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "🌐 Application URLs:"
echo "  Frontend (React): http://your-domain.com"
echo "  Backend API: http://your-domain.com:8000/api/"
echo "  Django Admin: http://your-domain.com:8000/admin/"
echo ""
echo "📋 Useful commands:"
echo "  View all logs: docker-compose logs -f"
echo "  View backend logs: docker-compose logs -f backend"
echo "  View frontend logs: docker-compose logs -f frontend"
echo "  Stop all: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Create superuser: docker-compose exec backend python manage.py createsuperuser"