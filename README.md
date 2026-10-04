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
2. `docker compose up -d --build`
3. `docker compose exec app npm run hash-passwords`
4. Buka http://localhost:3000

### Jalankan image dari Docker Hub
1. Salin `.env.example` menjadi `.env`. `DB_PASSWORD` dipakai sebagai password root MySQL di container; `JWT_SECRET` boleh dibiarkan kosong.
2. Tarik image aplikasi dan database dengan `docker compose -f docker-compose.hub.yml pull`.
3. Jalankan `docker compose -f docker-compose.hub.yml up -d`.
4. Compose menjalankan container MySQL dan menginisialisasi database dari `database/init.sql` saat pertama kali dibuat.

Secret JWT yang dibuat otomatis disimpan pada volume `app_data`, sehingga tetap sama setelah container dibuat ulang.

Image aplikasi tersedia di Docker Hub: `luckycgamer/lauzndry-app`
