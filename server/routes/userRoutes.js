const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken); // semua route di file ini wajib login

router.get('/services', user.getServices);
router.get('/profile', user.getProfile);
router.put('/profile', user.updateProfile);
router.post('/orders', user.createOrder);
router.get('/orders', user.getMyOrders);

module.exports = router;