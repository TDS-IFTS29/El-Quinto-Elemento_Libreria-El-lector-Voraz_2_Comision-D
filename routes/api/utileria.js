const express = require('express');
const router = express.Router();
const Utileria = require('../../models/Utileria');

// Obtener todos los productos de utilería
router.get('/', async (req, res) => {
  try {
    const utileria = await Utileria.find().populate('proveedor');
    res.json(utileria);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener utilería' });
  }
});

// Crear producto de utilería
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, stockMinimo, proveedor } = req.body;
    const util = await Utileria.create({ nombre, descripcion, precio, stock, stockMinimo, proveedor });
    res.status(201).json(util);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear utilería' });
  }
});

// Sumar 1 al stock de un producto de utilería
router.patch('/:id/sumar-stock', async (req, res) => {
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

// Eliminar producto de utilería
router.delete('/:id', async (req, res) => {
  try {
    await Utileria.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar utilería' });
  }
});

module.exports = router;
