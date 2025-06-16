const express = require('express');
const router = express.Router();
const {
  listar,
  crear,
  eliminar,
  guardarEdicion,
  vistaNuevoProducto,
  vistaEditarProducto
} = require('../controllers/productosController');

// Rutas API RESTful
router.get('/', listar);
router.post('/', crear);
router.delete('/:id', eliminar);
router.put('/:id', guardarEdicion);

// Ruta para la vista de nuevo producto
router.get('/nuevo', vistaNuevoProducto);
// Ruta para la vista de edición de producto
router.get('/editar/:id', vistaEditarProducto);

module.exports = router;
