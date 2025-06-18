// routes/proveedores.js
const express = require('express');
const router = express.Router();
const {
  vistaNuevoProveedor,
  vistaEditarProveedor,
  vistaCatalogoProveedor,
  guardarEdicionProveedor,
  crear
} = require('../controllers/proveedoresController');

router.get('/nuevo', (req, res) => {
  res.render('dashboard', { proveedores: true, activeMenu: 'nuevo' });
});
router.get('/editar/:id', async (req, res) => {
  const id = req.params.id;
  const Proveedor = require('../models/Proveedor');
  const proveedor = await Proveedor.findById(id);
  if (!proveedor) return res.status(404).send('Proveedor no encontrado');
  res.render('dashboard', { proveedores: true, activeMenu: 'editar', proveedor });
});
router.get('/catalogo', vistaCatalogoProveedor);
router.get('/', (req, res) => {
  res.render('dashboard', { proveedores: true, activeMenu: 'catalogo' });
});
router.post('/editar/:id', guardarEdicionProveedor);
router.post('/nuevo', crear);

module.exports = router;
