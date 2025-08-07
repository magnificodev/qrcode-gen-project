# ======= Stage 1: Build =======
FROM node:20-alpine AS builder

WORKDIR /app

# Copy code và cài dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ project
COPY . .

# Build production
RUN npm run build

# ======= Stage 2: Serve với Nginx =======
FROM nginx:alpine

# Copy file build sang thư mục Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx tùy chỉnh (nếu có)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
