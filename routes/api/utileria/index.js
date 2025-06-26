const express = require('express');
const router = express.Router();
const Utileria = require('../../../models/Utileria');
const { requireRole } = require('../../../middleware/auth');

// Obtener todos los productos de utilería
router.get('/', async (req, res) => {
  try {
    const utileria = await Utileria.find().populate('proveedor');
    res.json(utileria);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener utilería' });
  }
});

// Crear producto de utilería - Solo administradores
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, stockMinimo, proveedor } = req.body;
    const util = await Utileria.create({ nombre, descripcion, precio, stock, stockMinimo, proveedor });
    res.status(201).json(util);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear utilería' });
  }
});

// Sumar 1 al stock de un producto de utilería - Solo administradores
router.patch('/:id/sumar-stock', requireRole(['admin']), async (req, res) => {
  try {
    const util = await Utileria.findById(req.params.id);
    if (!util) return res.status(404).json({ error: 'No encontrado' });
    util.stock = (util.stock || 0) + 1;
    await util.save();
    res.json({ stock: util.stock });
  } catch (err) {
    res.status(500).json({ error: 'Error al sumar stock' });
  }
});

// Eliminar producto de utilería - Solo administradores
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    await Utileria.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar utilería' });
  }
});

// Obtener un producto de utilería por ID
router.get('/:id', async (req, res) => {
  try {
    const util = await Utileria.findById(req.params.id).populate('proveedor');
    if (!util) return res.status(404).json({ error: 'No encontrado' });
    res.json(util);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener utilería' });
  }
});

// Editar producto de utilería - Solo administradores
router.patch('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, stockMinimo, proveedor } = req.body;
    const util = await Utileria.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, precio, stock, stockMinimo, proveedor },
      { new: true }
    );
    if (!util) return res.status(404).json({ error: 'No encontrado' });
    res.json(util);
  } catch (err) {
    res.status(500).json({ error: 'Error al editar utilería' });
  }
});

module.exports = router;
