const express = require('express');
const router = express.Router();
const { vistaDashboard } = require('../controllers/librosController');

// Dashboard con ventas recientes en /inicio
router.get('/', vistaDashboard);

module.exports = router;
