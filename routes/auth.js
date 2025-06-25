const express = require('express');
const router = express.Router();
const { login, vistaLogin, logout } = require('../controllers/usuariosController');

// Rutas de autenticación
router.get('/', vistaLogin); // Ruta raíz para login
router.get('/login', vistaLogin); // Ruta específica para login
router.post('/login', login); // Procesar login
router.post('/logout', logout); // Cerrar sesión
router.get('/logout', logout); // Cerrar sesión también por GET

module.exports = router;
