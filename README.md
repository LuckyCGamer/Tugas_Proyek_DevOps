# Sistem Manajemen Laundry

Aplikasi web manajemen laundry (Node.js, Express, MySQL).

## Menjalankan Secara Lokal
1. `npm install`
2. Salin `.env.example` menjadi `.env`, isi password database
3. Import `database/init.sql` ke MySQL
4. `npm start`

## Menjalankan dengan Docker
### Build dari source
1. Salin `.env.example` menjadi `.env`. `JWT_SECRET` boleh dibiarkan kosong agar dibuat otomatis, atau diisi dengan secret milik Anda.
2. curl.exe -o docker-compose.yml https://raw.githubusercontent.com/LuckyCGamer/Tugas_Proyek_DevOps/main/docker-compose.yml      
3. `docker compose up -d --build`
5. Buka http://localhost:3000
