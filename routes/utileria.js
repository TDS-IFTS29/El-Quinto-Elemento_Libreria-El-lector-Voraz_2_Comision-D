const express = require('express');
const router = express.Router();
const utileriaController = require('../controllers/utileriaController');

// Catálogo de utilería
router.get('/', utileriaController.catalogo);
// Formulario para agregar utilería
router.get('/nuevo', utileriaController.formNuevo);
router.post('/nuevo', utileriaController.crear);
// Formulario para registrar venta de utilería
router.get('/vender', utileriaController.formVender);
router.post('/vender', utileriaController.vender);
// Reportes de ventas de utilería
router.get('/reportes', utileriaController.reportes);
// Editar utilería
router.get('/editar/:id', utileriaController.formEditar);
router.post('/editar/:id', utileriaController.editar);
// Eliminar utilería
router.get('/eliminar/:id', utileriaController.eliminar);

module.exports = router;
