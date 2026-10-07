const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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