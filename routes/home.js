const express = require('express');
const router = express.Router();
const { vistaDashboard } = require('../controllers/homeController');

// Dashboard con ventas recientes en /inicio
router.get('/', vistaDashboard);

module.exports = router;
