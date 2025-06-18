const express = require('express');
const router = express.Router();
const {
  vistaNuevoLibro,
  vistaEditarLibro,
  guardarEdicion,
  verCatalogo,
  crear,
  verCatalogoVentas,
  vistaNuevaVenta,
  vistaReportesVentas,
  vistaDashboard
} = require('../controllers/librosController');

// Renderiza la vista dashboard con el menú de libros y las ventas recientes
// router.get('/', vistaDashboard);
// Ruta para el catálogo de libros como principal
router.get('/', verCatalogo);

// Ruta para la vista de nuevo libro
router.get('/nuevo', vistaNuevoLibro);
// Ruta para la vista de edición de libro
router.get('/editar/:id', vistaEditarLibro);
// Ruta para guardar la edición de libro
router.post('/editar/:id', guardarEdicion);
// Ruta para el catálogo de libros
router.get('/catalogo', verCatalogo);
// Ruta para guardar un nuevo libro
router.post('/nuevo', crear);
// Rutas de ventas de libros
router.get('/ventas', verCatalogoVentas);
router.get('/ventas/nueva', vistaNuevaVenta);
router.get('/ventas/reportes', vistaReportesVentas);

module.exports = router;
