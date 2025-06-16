// routes/ventas.js
const express = require('express');
const router = express.Router();
const {
  listar,
  registrar,
  masVendidos,
  ventasSemana,
  verCatalogo,
  vistaNuevaVenta,
  vistaReportesVentas
} = require('../controllers/ventasController');

// Rutas API RESTful
router.get('/', listar);
router.post('/', registrar);
router.get('/mas-vendidos', masVendidos);
router.get('/semana', ventasSemana);

// Rutas de vistas
router.get('/catalogo', verCatalogo);
router.get('/nueva', vistaNuevaVenta);
router.get('/reportes', vistaReportesVentas);

module.exports = router;
