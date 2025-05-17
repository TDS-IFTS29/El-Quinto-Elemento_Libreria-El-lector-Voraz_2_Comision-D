const express = require('express');
const router = express.Router();
const {
  vistaNuevoProducto,
  vistaEditarProducto,
  vistaCatalogoProducto
} = require('../controllers/productosController');

router.get('/nuevo', vistaNuevoProducto);
router.get('/editar/:id', vistaEditarProducto);
router.get('/catalogo', vistaCatalogoProducto);

module.exports = router;
