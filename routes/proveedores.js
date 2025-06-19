const express = require('express');
const router = express.Router();
const Proveedor = require('../models/Proveedor');

// Catálogo de proveedores
router.get('/', async (req, res) => {
  const proveedores = await Proveedor.find();
  res.render('dashboard', { proveedores, activeMenu: 'catalogo' });
});

// Vista para agregar proveedor
router.get('/nuevo', (req, res) => {
  res.render('dashboard', { proveedores: true, activeMenu: 'nuevo' });
});

// Vista para editar proveedor
router.get('/editar/:id', async (req, res) => {
  const proveedor = await Proveedor.findById(req.params.id);
  res.render('dashboard', { proveedores: true, proveedor, activeMenu: 'editar' });
});

// Procesar edición de proveedor (POST)
router.post('/editar/:id', async (req, res) => {
  const proveedor = await Proveedor.findById(req.params.id);
  if (!proveedor) return res.status(404).send('Proveedor no encontrado');
  proveedor.nombre = req.body.nombre;
  proveedor.mail = req.body.mail;
  proveedor.tipo_proveedor = req.body.tipo_proveedor;
  proveedor.telefono = req.body.telefono;
  proveedor.sitio_web = req.body.sitio_web;
  await proveedor.save();
  res.redirect('/proveedores');
});

module.exports = router;
