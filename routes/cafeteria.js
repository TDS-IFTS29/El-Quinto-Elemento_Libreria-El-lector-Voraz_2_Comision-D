const express = require('express');
const router = express.Router();
const cafeteriaController = require('../controllers/cafeteriaController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Rutas del catálogo (lectura) - accesible para todos los usuarios autenticados
router.get('/', cafeteriaController.mostrarCatalogo);

// Rutas de administración - solo para admin
router.get('/nuevo', requireRole(['admin']), cafeteriaController.mostrarNuevoItem);
router.post('/nuevo', requireRole(['admin']), cafeteriaController.crearItem);
router.get('/editar/:id', requireRole(['admin']), cafeteriaController.mostrarEditarItem);
router.post('/editar/:id', requireRole(['admin']), cafeteriaController.actualizarItem);
router.delete('/eliminar/:id', requireRole(['admin']), cafeteriaController.eliminarItem);

// Rutas de ventas - accesible para todos los usuarios autenticados
router.get('/vender', cafeteriaController.mostrarVenta);
router.post('/vender', cafeteriaController.procesarVenta);
router.get('/factura/:ventaId', cafeteriaController.mostrarFactura);

// Rutas de reportes - accesible para todos los usuarios autenticados
router.get('/reportes', cafeteriaController.mostrarReportes);

module.exports = router;
