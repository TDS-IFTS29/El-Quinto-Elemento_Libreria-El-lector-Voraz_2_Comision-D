const express = require('express');
const router = express.Router();
const proveedoresController = require('../../controllers/proveedoresController');

// API REST para proveedores
router.get('/', proveedoresController.listar);
router.post('/', proveedoresController.crear);
router.patch('/:id', proveedoresController.actualizar);
router.delete('/:id', proveedoresController.eliminar);
router.get('/:id', proveedoresController.obtener);


module.exports = router;
