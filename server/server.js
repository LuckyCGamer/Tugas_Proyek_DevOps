require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/connection');
const initDatabase = require('./db/init');
const ensureJwtSecret = require('./utils/secret');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

ensureJwtSecret(); // isi JWT_SECRET otomatis jika belum ada

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM services');
    res.json({ status: 'ok', database: 'connected', total_services: rows[0].total });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

async function start() {
  await initDatabase();   // tunggu MySQL dan siapkan tabel dulu
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Gagal memulai server:', err.message);
  process.exit(1);
});