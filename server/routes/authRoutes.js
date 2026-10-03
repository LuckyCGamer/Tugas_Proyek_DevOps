const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', verifyToken, auth.me);

// Route sementara khusus untuk menguji role admin (boleh dihapus di Tahap 3)
router.get('/admin-check', verifyToken, requireAdmin, (req, res) => {
  res.json({ message: 'Halo admin, akses diterima' });
});

module.exports = router;