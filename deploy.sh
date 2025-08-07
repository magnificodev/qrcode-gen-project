#!/bin/bash

# QR Code Generator Deployment Script
# This script builds and deploys the QR code generator application

set -e

echo "🚀 Starting QR Code Generator deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# QR Code Generator Environment Variables
DEBUG=False
SECRET_KEY=$(openssl rand -base64 32)
ALLOWED_HOSTS=localhost,127.0.0.1,frontend
DOMAIN=your-domain.com
EOF
    echo "✅ .env file created. Please update the DOMAIN variable with your actual domain."
fi

# Build and start the services
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.simple.yml build

echo "🚀 Starting services..."
docker-compose -f docker-compose.simple.yml up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.simple.yml ps

echo "✅ Deployment completed!"
echo "🌐 Frontend is available at: http://localhost"
echo "🔧 Backend API is available at: http://localhost:8000"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.simple.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.simple.yml down"
echo "  - Restart services: docker-compose -f docker-compose.simple.yml restart"
echo "  - Update and redeploy: ./deploy.sh" 