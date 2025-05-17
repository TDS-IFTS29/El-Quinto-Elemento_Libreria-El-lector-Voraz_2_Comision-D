// routes/proveedores.js
const express = require('express');
const router = express.Router();
const {
  vistaNuevoProveedor,
  vistaEditarProveedor,
  vistaCatalogoProveedor
} = require('../controllers/proveedoresController');

router.get('/nuevo', vistaNuevoProveedor);
router.get('/editar/:id', vistaEditarProveedor);
router.get('/catalogo', vistaCatalogoProveedor);

module.exports = router;
