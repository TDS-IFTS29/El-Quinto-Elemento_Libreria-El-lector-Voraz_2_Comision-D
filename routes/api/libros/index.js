const express = require('express');
const router = express.Router();
const librosController = require('../../../controllers/librosController');

// API REST para libros
router.get('/', librosController.listar);
router.post('/', librosController.crear);
router.patch('/:id', librosController.guardarEdicion);
router.delete('/:id', librosController.eliminar);
router.get('/:id', librosController.obtener);
router.patch('/:id/sumar-stock', async (req, res) => {
  const Libro = require('../../../models/Libro');
  const id = req.params.id;
  try {
    const libro = await Libro.findById(id);
    if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
    libro.stock = (libro.stock || 0) + 1;
    await libro.save();
    res.json({ stock: libro.stock });
  } catch (err) {
    res.status(500).json({ error: 'Error al sumar stock' });
  }
});

module.exports = router;
