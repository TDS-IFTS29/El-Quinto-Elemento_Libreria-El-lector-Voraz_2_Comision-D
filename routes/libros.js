const express = require('express');
const router = express.Router();
const {
  vistaNuevoLibro,
  vistaEditarLibro,
  verCatalogo,
  crear,
  verCatalogoVentas,
  vistaNuevaVenta,
  vistaReportesVentas,
  vistaDashboard
} = require('../controllers/librosController');

// Solo renderiza dashboard/layout para navegación visual
router.get('/', (req, res) => {
  res.render('libros/catalogo_libros', { activeMenu: 'catalogo' });
});
router.get('/nuevo', (req, res) => {
  res.render('libros/nuevo_libro', { activeMenu: 'nuevo' });
});
router.get('/editar/:id', (req, res) => {
  res.render('libros/editar_libro', { activeMenu: 'editar', libroId: req.params.id });
});

module.exports = router;
