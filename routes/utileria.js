const express = require('express');
const router = express.Router();
const utileriaController = require('../controllers/utileriaController');
const { requireRole } = require('../middleware/auth');

// Catálogo de utilería
router.get('/', utileriaController.catalogo);

// Formulario para agregar utilería - Solo administradores
router.get('/nuevo', requireRole(['admin']), utileriaController.formNuevo);
router.post('/nuevo', requireRole(['admin']), utileriaController.crear);

// Formulario para registrar venta de utilería
router.get('/vender', utileriaController.formVender);
router.post('/vender', utileriaController.vender);

// Reportes de ventas de utilería
router.get('/reportes', utileriaController.reportes);

// Editar utilería - Solo administradores
router.get('/editar/:id', requireRole(['admin']), utileriaController.formEditar);
router.post('/editar/:id', requireRole(['admin']), utileriaController.editar);

// Eliminar utilería - Solo administradores
router.get('/eliminar/:id', requireRole(['admin']), utileriaController.eliminar);

// Factura de venta de utilería
router.get('/factura/:id', utileriaController.facturaVenta);

module.exports = router;
