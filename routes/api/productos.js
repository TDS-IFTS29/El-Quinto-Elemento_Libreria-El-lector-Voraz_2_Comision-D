const express = require('express');
const router = express.Router();
const productosController = require('../../controllers/productosController');

// API REST para productos
router.get('/', productosController.listar);
router.post('/', productosController.crear);
router.patch('/:id', productosController.guardarEdicion);
router.delete('/:id', productosController.eliminar);
router.get('/:id', productosController.obtener);

module.exports = router;