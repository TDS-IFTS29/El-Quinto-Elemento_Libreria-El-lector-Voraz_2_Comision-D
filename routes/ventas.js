// routes/ventas.js
const express = require('express');
const router = express.Router();
const {
  vistaNuevaVenta,
  vistaCatalogoVentas,
  vistaReportesVentas
} = require('../controllers/ventasController');

router.get('/nueva', vistaNuevaVenta);
router.get('/catalogo', vistaCatalogoVentas);
router.get('/reportes', vistaReportesVentas);

module.exports = router;
