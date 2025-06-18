const express = require('express');
const router = express.Router();
const librosController = require('../../../controllers/librosController');

// Subrutas para ventas (debe ir antes de las rutas con :id)
router.use('/ventas', require('./ventas'));

// API REST para libros
router.get('/', librosController.listar);
router.post('/', librosController.crear);
router.patch('/:id', librosController.guardarEdicion);
router.delete('/:id', librosController.eliminar);
router.get('/:id', librosController.obtener);

module.exports = router;
