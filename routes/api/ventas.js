const express = require('express');
const router = express.Router();
const { requireRole } = require('../../middleware/auth');
const ventasController = require('../../controllers/ventasController');

// Obtener los libros más vendidos
router.get('/mas-vendidos', ventasController.getMasVendidos);

// Obtener ventas de la última semana
router.get('/ventas-semana', ventasController.getVentasSemana);

// Obtener todas las ventas
router.get('/', ventasController.getAllVentas);

// Obtener una venta por ID
router.get('/:id', ventasController.getVentaById);

// Crear una nueva venta
router.post('/', ventasController.createVenta);

// Actualizar una venta existente
router.put('/:id', ventasController.updateVenta);

// Eliminar una venta (solo admin)
router.delete('/:id', requireRole(['admin']), ventasController.deleteVenta);

module.exports = router;
