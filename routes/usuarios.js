const express = require('express');
const router = express.Router();

// Ruta principal: cuando viene del dashboard (/usuarios) mostrar catálogo
router.get('/', (req, res) => {
  res.render('usuarios/catalogo_usuarios', { activeMenu: 'catalogo' });
});

// Rutas para vistas del CRUD de usuarios
router.get('/catalogo', (req, res) => {
  res.render('usuarios/catalogo_usuarios', { activeMenu: 'catalogo' });
});

router.get('/nuevo', (req, res) => {
  res.render('usuarios/nuevo_usuario', { activeMenu: 'nuevo' });
});

router.get('/editar/:id', (req, res) => {
  res.render('usuarios/editar_usuario', { activeMenu: 'editar', usuarioId: req.params.id });
});

module.exports = router;
