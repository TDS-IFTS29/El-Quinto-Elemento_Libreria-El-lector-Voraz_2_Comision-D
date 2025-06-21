const express = require('express');
const router = express.Router();
const utileriaController = require('../controllers/utileriaController');

// Catálogo de utilería
router.get('/', utileriaController.catalogo);

module.exports = router;
