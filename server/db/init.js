const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// MySQL di container butuh waktu untuk siap, jadi coba berulang
async function connectWithRetry() {
  for (let i = 1; i <= 30; i++) {
    try {
      return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true   // agar init.sql (banyak perintah) bisa dijalankan sekaligus
      });
    } catch (err) {
      console.log(`Menunggu MySQL... (${i}/30)`);
      await sleep(2000);
    }
  }
  throw new Error('MySQL tidak dapat dihubungi');
}

module.exports = async function initDatabase() {
  const conn = await connectWithRetry();
  try {
    const [rows] = await conn.query(
      "SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'",
      [process.env.DB_NAME]
    );

    // Tabel sudah ada: jangan disentuh (init.sql berisi DROP TABLE)
    if (rows[0].total > 0) {
      console.log('Database sudah siap');
      return;
    }

    console.log('Database kosong, menjalankan init.sql...');
    const sql = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'init.sql'), 'utf8');
    await conn.query(sql);

    // Hash password data testing (menggantikan "npm run hash-passwords")
    await conn.query(`USE \`${process.env.DB_NAME}\``);
    const [users] = await conn.query('SELECT id, password FROM users');
    for (const u of users) {
      if (u.password.startsWith('$2')) continue;
      const hashed = await bcrypt.hash(u.password, 10);
      await conn.query('UPDATE users SET password = ? WHERE id = ?', [hashed, u.id]);
    }
    console.log('Database dan data awal berhasil dibuat');
  } finally {
    await conn.end();
  }
};