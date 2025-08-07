# --- Stage 1: Build Vite ---
FROM node:20 AS builder

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]