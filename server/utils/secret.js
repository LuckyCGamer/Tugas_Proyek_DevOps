const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Jika JWT_SECRET sudah diisi (misal lewat .env), pakai itu.
// Jika belum, buat secret acak dan simpan di data/jwt.secret
// supaya tidak berubah saat container direstart (token login tetap valid).
module.exports = function ensureJwtSecret() {
  if (process.env.JWT_SECRET) return;

  const dir = path.join(__dirname, '..', '..', 'data');
  const file = path.join(dir, 'jwt.secret');
  fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, crypto.randomBytes(32).toString('hex'));
    console.log('JWT_SECRET dibuat otomatis');
  }
  process.env.JWT_SECRET = fs.readFileSync(file, 'utf8').trim();
};