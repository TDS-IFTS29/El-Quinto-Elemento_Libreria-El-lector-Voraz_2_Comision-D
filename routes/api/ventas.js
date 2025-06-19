const express = require('express');
const router = express.Router();
const ventasController = require('../../controllers/ventasController');

// Obtener todas las ventas
router.get('/', ventasController.getAllVentas);

// Obtener una venta por ID
router.get('/:id', ventasController.getVentaById);

// Crear una nueva venta
router.post('/', ventasController.createVenta);

// Actualizar una venta existente
router.put('/:id', ventasController.updateVenta);

// Eliminar una venta
router.delete('/:id', ventasController.deleteVenta);

module.exports = router;
