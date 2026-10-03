const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken, requireAdmin); // semua route di file ini khusus admin

// Pelanggan
router.get('/customers', admin.getCustomers);
router.post('/customers', admin.createCustomer);
router.put('/customers/:id', admin.updateCustomer);
router.delete('/customers/:id', admin.deleteCustomer);

// Layanan
router.get('/services', admin.getServices);
router.post('/services', admin.createService);
router.put('/services/:id', admin.updateService);
router.delete('/services/:id', admin.deleteService);

// Pesanan
router.get('/orders', admin.getOrders);
router.put('/orders/:id', admin.updateOrder);
router.put('/orders/:id/status', admin.updateOrderStatus);
router.delete('/orders/:id', admin.deleteOrder);

module.exports = router;