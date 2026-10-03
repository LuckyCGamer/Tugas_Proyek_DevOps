const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, phone, address, username, password } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Nama, username, dan password wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const [exist] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (exist.length > 0) {
      return res.status(409).json({ message: 'Username sudah dipakai' });
    }

    // 10 = tingkat kerumitan hash (salt rounds)
    const hashed = await bcrypt.hash(password, 10);

    // Role SELALU 'user' di sini. Tidak boleh diambil dari input,
    // agar orang tidak bisa mendaftar sendiri sebagai admin.
    const [result] = await pool.query(
      'INSERT INTO users (name, phone, address, username, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [name, phone || null, address || null, username, hashed, 'user']
    );

    res.status(201).json({ message: 'Registrasi berhasil', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];

    // Pesan sama untuk username salah dan password salah (lebih aman)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, name: user.name, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// GET /api/auth/me  (butuh token)
exports.me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, phone, address, username, role FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};