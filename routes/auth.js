const express = require('express');
const router = express.Router();
const { login, vistaLogin } = require('../controllers/usuariosController');

// Rutas de autenticación
router.get('/', vistaLogin); // Ruta raíz para login
router.get('/login', vistaLogin); // Ruta específica para login
router.post('/login', login); // Procesar login

module.exports = router;
