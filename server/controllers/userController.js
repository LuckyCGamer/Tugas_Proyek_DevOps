const pool = require('../db/connection');
const { calcTotal, validWeight } = require('../utils/price');

const serverError = (res, err) =>
  res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });

// GET /api/user/services
exports.getServices = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, price_per_kg FROM services ORDER BY id');
    res.json(rows);
  } catch (err) { serverError(res, err); }
};

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, phone, address, username, role FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) { serverError(res, err); }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama wajib diisi' });

    await pool.query(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [name, phone || null, address || null, req.user.id]
    );
    res.json({ message: 'Profil berhasil diperbarui' });
  } catch (err) { serverError(res, err); }
};

// POST /api/user/orders
exports.createOrder = async (req, res) => {
  try {
    const { service_id, weight } = req.body;

    if (!service_id || !validWeight(weight)) {
      return res.status(400).json({ message: 'Layanan wajib dipilih dan berat harus 0.01 - 999.99 kg' });
    }

    const [services] = await pool.query('SELECT price_per_kg FROM services WHERE id = ?', [service_id]);
    if (services.length === 0) return res.status(404).json({ message: 'Layanan tidak ditemukan' });

    const total = calcTotal(weight, services[0].price_per_kg);

    // user_id diambil dari token, bukan dari input
    const [result] = await pool.query(
      'INSERT INTO orders (user_id, service_id, weight, total_price, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, service_id, weight, total, 'Pending']
    );

    res.status(201).json({
      message: 'Pesanan berhasil dibuat',
      id: result.insertId,
      total_price: total,
      status: 'Pending'
    });
  } catch (err) { serverError(res, err); }
};

// GET /api/user/orders  (riwayat milik sendiri)
exports.getMyOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, s.name AS service_name, s.price_per_kg, o.weight, o.total_price, o.status, o.created_at
       FROM orders o
       JOIN services s ON o.service_id = s.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC, o.id DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { serverError(res, err); }
};