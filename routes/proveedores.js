const express = require('express');
const router = express.Router();

// Solo renderiza dashboard para navegación visual
router.get('/', (req, res) => {
  res.render('dashboard', { proveedores: true, activeMenu: 'catalogo' });
});
router.get('/nuevo', (req, res) => {
  res.render('dashboard', { proveedores: true, activeMenu: 'nuevo' });
});
router.get('/editar/:id', (req, res) => {
  res.render('dashboard', { proveedores: true, activeMenu: 'editar', proveedorId: req.params.id });
});

module.exports = router;
