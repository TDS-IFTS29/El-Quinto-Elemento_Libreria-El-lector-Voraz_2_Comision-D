const express = require('express');
const router = express.Router();
const ventasController = require('../../controllers/ventasController');

// Rutas API REST
router.get('/', ventasController.listar);
router.post('/', ventasController.registrar);
router.get('/mas-vendidos', ventasController.masVendidos);
router.get('/ventas-semana', ventasController.ventasSemana);

module.exports = router;
