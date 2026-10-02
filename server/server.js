require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db/connection');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());                 // izinkan request dari origin lain
app.use(express.json());         // baca body request berformat JSON
app.use(express.static(path.join(__dirname, '..', 'public'))); // sajikan file frontend

// Endpoint untuk mengecek server dan koneksi database
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM services');
    res.json({
      status: 'ok',
      database: 'connected',
      total_services: rows[0].total
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});