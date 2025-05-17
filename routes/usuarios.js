const express = require('express');
const router = express.Router();
const { login, vistaLogin } = require('../controllers/usuariosController');

router.get('/login', vistaLogin);
router.post('/login', login);

// Mostrar login directamente en "/"
router.get('/', vistaLogin);

module.exports = router;
