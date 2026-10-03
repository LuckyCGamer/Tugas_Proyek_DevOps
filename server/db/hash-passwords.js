require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./connection');

async function main() {
  const [users] = await pool.query('SELECT id, password FROM users');
  let count = 0;

  for (const u of users) {
    if (u.password.startsWith('$2')) continue; // sudah berupa hash bcrypt
    const hashed = await bcrypt.hash(u.password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, u.id]);
    count++;
  }

  console.log(`Selesai. ${count} password di-hash.`);
  await pool.end();
}

main().catch(err => {
  console.error('Gagal:', err.message);
  process.exit(1);
});