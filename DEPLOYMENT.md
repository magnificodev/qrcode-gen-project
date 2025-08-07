# QR Code Generator - Deployment Guide

This guide will help you deploy the QR Code Generator application on a VPS using Docker.

## Prerequisites

-   A VPS with Ubuntu 20.04+ or similar Linux distribution
-   Docker and Docker Compose installed
-   A domain name (optional, for production)

## Quick Deployment

1. **Clone the repository to your VPS:**

    ```bash
    git clone <your-repository-url>
    cd qrcode-gen-project
    ```

2. **Run the deployment script:**

    ```bash
    ./deploy.sh
    ```

3. **Access your application:**
    - Frontend: http://your-server-ip
    - Backend API: http://your-server-ip:8000

## Manual Deployment

### 1. Install Docker and Docker Compose

```bash
# Update package list
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# QR Code Generator Environment Variables
DEBUG=False
SECRET_KEY=your-secure-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,frontend,your-domain.com
DOMAIN=your-domain.com
```

**Important:** Generate a secure secret key:

```bash
openssl rand -base64 32
```

### 3. Build and Deploy

```bash
# Build the Docker images
docker-compose -f docker-compose.simple.yml build

# Start the services
docker-compose -f docker-compose.simple.yml up -d

# Check service status
docker-compose -f docker-compose.simple.yml ps
```

### 4. Configure Firewall

```bash
# Allow HTTP and HTTPS traffic
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8000  # Only if you want direct API access

# Enable firewall
sudo ufw enable
```

## Production Deployment with SSL

### 1. Install Certbot

```bash
sudo apt install certbot
```

### 2. Configure Nginx for SSL

Create `/etc/nginx/sites-available/qrcode-generator`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

## Useful Commands

### View Logs

```bash
# All services
docker-compose -f docker-compose.simple.yml logs -f

# Specific service
docker-compose -f docker-compose.simple.yml logs -f frontend
docker-compose -f docker-compose.simple.yml logs -f backend
```

### Stop Services

```bash
docker-compose -f docker-compose.simple.yml down
```

### Restart Services

```bash
docker-compose -f docker-compose.simple.yml restart
```

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f docker-compose.simple.yml down
docker-compose -f docker-compose.simple.yml build
docker-compose -f docker-compose.simple.yml up -d
```

### Backup Data

```bash
# Backup media files
docker cp qrcode-backend:/app/media ./backup/media

# Backup database
docker cp qrcode-backend:/app/db.sqlite3 ./backup/
```

## Troubleshooting

### Port Already in Use

If port 80 is already in use, you can change the frontend port in `docker-compose.simple.yml`:

```yaml
ports:
    - "8080:80" # Change 80 to 8080
```

### Permission Issues

```bash
# Fix Docker permissions
sudo chown $USER:$USER /var/run/docker.sock
```

### Container Won't Start

```bash
# Check container logs
docker logs qrcode-frontend
docker logs qrcode-backend

# Check container status
docker ps -a
```

### Database Issues

```bash
# Access Django shell
docker exec -it qrcode-backend python manage.py shell

# Run migrations
docker exec -it qrcode-backend python manage.py migrate

# Create superuser
docker exec -it qrcode-backend python manage.py createsuperuser
```

## Security Considerations

1. **Change the default secret key** in the `.env` file
2. **Use HTTPS** in production
3. **Regularly update** Docker images and dependencies
4. **Monitor logs** for suspicious activity
5. **Backup data** regularly
6. **Use a firewall** to restrict access

## Performance Optimization

1. **Enable gzip compression** (already configured in nginx.conf)
2. **Use a CDN** for static assets
3. **Consider using PostgreSQL** instead of SQLite for production
4. **Monitor resource usage** with `docker stats`

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure all ports are accessible
4. Check firewall settings
