const jwt = require('jsonwebtoken');

// Memeriksa token. Dipakai di route yang butuh login.
exports.verifyToken = (req, res, next) => {
  const header = req.headers.authorization || '';   // format: "Bearer <token>"
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token tidak ditemukan, silakan login' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // isi: id, username, role
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
  }
};

// Memeriksa role admin. Harus dipasang SETELAH verifyToken.
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak, khusus admin' });
  }
  next();
};