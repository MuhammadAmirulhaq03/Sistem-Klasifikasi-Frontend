# Stage 1: Build application
FROM node:20-alpine AS builder

WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependensi
RUN npm install

# Salin seluruh kode proyek
COPY . ./

# Build aplikasi React (Vite)
RUN npm run build

# Stage 2: Serve aplikasi dengan Nginx
FROM nginx:alpine

# Salin konfigurasi Nginx untuk SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin hasil build dari stage 1 ke folder Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Ekspos port 80
EXPOSE 80

# Jalankan Nginx
CMD ["nginx", "-g", "daemon off;"]
