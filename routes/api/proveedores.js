const express = require('express');
const router = express.Router();
const { requireRole } = require('../../middleware/auth');
const proveedoresController = require('../../controllers/proveedoresController');

// API REST para proveedores - Todos requieren admin
router.get('/', requireRole(['admin']), proveedoresController.listar);
router.post('/', requireRole(['admin']), proveedoresController.crear);
router.patch('/:id', requireRole(['admin']), proveedoresController.actualizar);
router.delete('/:id', requireRole(['admin']), proveedoresController.eliminar);
router.get('/:id', requireRole(['admin']), proveedoresController.obtener);

module.exports = router;
