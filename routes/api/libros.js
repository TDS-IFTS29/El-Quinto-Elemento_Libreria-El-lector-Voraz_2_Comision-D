const express = require('express');
const router = express.Router();
const librosController = require('../../controllers/librosController');

// API REST para libros
router.get('/', librosController.listar);
router.post('/', librosController.crear);
router.patch('/:id', librosController.guardarEdicion);
router.delete('/:id', librosController.eliminar);
router.get('/:id', librosController.obtener);
// Endpoints de ventas como subruta de libros
router.post('/ventas', librosController.registrarVenta);
router.get('/ventas', librosController.listarVentas);
router.get('/ventas/mas-vendidos', librosController.masVendidos);
router.get('/ventas/ventas-semana', librosController.ventasSemana);

module.exports = router;
