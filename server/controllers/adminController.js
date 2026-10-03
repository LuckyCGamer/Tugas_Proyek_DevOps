const bcrypt = require('bcryptjs');
const pool = require('../db/connection');
const { calcTotal, validWeight } = require('../utils/price');

const STATUSES = ['Pending', 'Proses', 'Selesai'];

const serverError = (res, err) =>
  res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });

/* ================= PELANGGAN ================= */

// GET /api/admin/customers
exports.getCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, phone, address, username FROM users WHERE role = 'user' ORDER BY id"
    );
    res.json(rows);
  } catch (err) { serverError(res, err); }
};

// POST /api/admin/customers
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, address, username, password } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Nama, username, dan password wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, phone, address, username, password, role) VALUES (?, ?, ?, ?, ?, 'user')",
      [name, phone || null, address || null, username, hashed]
    );
    res.status(201).json({ message: 'Pelanggan berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Username sudah dipakai' });
    serverError(res, err);
  }
};

// PUT /api/admin/customers/:id  (password opsional, isi hanya jika ingin diganti)
exports.updateCustomer = async (req, res) => {
  try {
    const { name, phone, address, username, password } = req.body;
    if (!name || !username) {
      return res.status(400).json({ message: 'Nama dan username wajib diisi' });
    }

    const [exist] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'user'", [req.params.id]);
    if (exist.length === 0) return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });

    let sql = 'UPDATE users SET name = ?, phone = ?, address = ?, username = ?';
    const params = [name, phone || null, address || null, username];

    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter' });
      sql += ', password = ?';
      params.push(await bcrypt.hash(password, 10));
    }
    sql += ' WHERE id = ?';
    params.push(req.params.id);

    await pool.query(sql, params);
    res.json({ message: 'Pelanggan berhasil diubah' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Username sudah dipakai' });
    serverError(res, err);
  }
};

// DELETE /api/admin/customers/:id  (pesanan pelanggan ikut terhapus: ON DELETE CASCADE)
exports.deleteCustomer = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ? AND role = 'user'", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    res.json({ message: 'Pelanggan berhasil dihapus' });
  } catch (err) { serverError(res, err); }
};

/* ================= LAYANAN ================= */

// GET /api/admin/services
exports.getServices = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, price_per_kg FROM services ORDER BY id');
    res.json(rows);
  } catch (err) { serverError(res, err); }
};

// POST /api/admin/services
exports.createService = async (req, res) => {
  try {
    const { name, price_per_kg } = req.body;
    if (!name || !(Number(price_per_kg) > 0)) {
      return res.status(400).json({ message: 'Nama wajib diisi dan harga per kg harus lebih dari 0' });
    }
    const [result] = await pool.query(
      'INSERT INTO services (name, price_per_kg) VALUES (?, ?)',
      [name, price_per_kg]
    );
    res.status(201).json({ message: 'Layanan berhasil ditambahkan', id: result.insertId });
  } catch (err) { serverError(res, err); }
};

// PUT /api/admin/services/:id
exports.updateService = async (req, res) => {
  try {
    const { name, price_per_kg } = req.body;
    if (!name || !(Number(price_per_kg) > 0)) {
      return res.status(400).json({ message: 'Nama wajib diisi dan harga per kg harus lebih dari 0' });
    }
    const [result] = await pool.query(
      'UPDATE services SET name = ?, price_per_kg = ? WHERE id = ?',
      [name, price_per_kg, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    res.json({ message: 'Layanan berhasil diubah' });
  } catch (err) { serverError(res, err); }
};

// DELETE /api/admin/services/:id  (ditolak jika sudah dipakai pesanan: ON DELETE RESTRICT)
exports.deleteService = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    res.json({ message: 'Layanan berhasil dihapus' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Layanan tidak bisa dihapus karena sudah dipakai pada pesanan' });
    }
    serverError(res, err);
  }
};

/* ================= PESANAN ================= */

// GET /api/admin/orders
exports.getOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.user_id, u.name AS customer_name,
              o.service_id, s.name AS service_name, s.price_per_kg,
              o.weight, o.total_price, o.status, o.created_at
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN services s ON o.service_id = s.id
       ORDER BY o.created_at DESC, o.id DESC`
    );
    res.json(rows);
  } catch (err) { serverError(res, err); }
};

// PUT /api/admin/orders/:id  (edit pelanggan, layanan, berat; total dihitung ulang)
exports.updateOrder = async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    const old = orders[0];

    // Field yang tidak dikirim memakai nilai lama
    const user_id = req.body.user_id ?? old.user_id;
    const service_id = req.body.service_id ?? old.service_id;
    const weight = req.body.weight ?? old.weight;

    if (!validWeight(weight)) {
      return res.status(400).json({ message: 'Berat harus 0.01 - 999.99 kg' });
    }

    const [users] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'user'", [user_id]);
    if (users.length === 0) return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });

    const [services] = await pool.query('SELECT price_per_kg FROM services WHERE id = ?', [service_id]);
    if (services.length === 0) return res.status(404).json({ message: 'Layanan tidak ditemukan' });

    const total = calcTotal(weight, services[0].price_per_kg);

    await pool.query(
      'UPDATE orders SET user_id = ?, service_id = ?, weight = ?, total_price = ? WHERE id = ?',
      [user_id, service_id, weight, total, req.params.id]
    );
    res.json({ message: 'Pesanan berhasil diubah', total_price: total });
  } catch (err) { serverError(res, err); }
};

// PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Status harus salah satu dari: ' + STATUSES.join(', ') });
    }
    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    res.json({ message: 'Status pesanan diubah menjadi ' + status });
  } catch (err) { serverError(res, err); }
};

// DELETE /api/admin/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    res.json({ message: 'Pesanan berhasil dihapus' });
  } catch (err) { serverError(res, err); }
};