# Sistem Manajemen Laundry

Aplikasi web manajemen laundry (Node.js, Express, MySQL).

## Menjalankan Secara Lokal
1. `npm install`
2. Salin `.env.example` menjadi `.env`, isi password database
3. Import `database/init.sql` ke MySQL
4. `npm start`

## Menjalankan dengan Docker
1. Salin `.env.example` menjadi `.env`, isi `JWT_SECRET`
2. `docker compose up -d --build`
3. `docker compose exec app npm run hash-passwords`
4. Buka http://localhost:3000

Image tersedia di Docker Hub: `luckycgamer/laundry-app`
