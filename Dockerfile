# Image dasar: Node.js 20 versi ringan (alpine)
FROM node:20-alpine

# Folder kerja di dalam container
WORKDIR /app

# Salin package.json dulu agar hasil npm ci bisa di-cache oleh Docker
COPY package*.json ./
RUN npm ci --omit=dev

# Salin seluruh kode aplikasi
COPY . .

# Port yang dipakai aplikasi
EXPOSE 3000

# Perintah saat container dijalankan
CMD ["node", "server/server.js"]