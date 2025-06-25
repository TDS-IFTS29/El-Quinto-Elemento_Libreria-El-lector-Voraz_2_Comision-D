const express = require('express');
const router = express.Router();
const { requireRole } = require('../../middleware/auth');
const librosController = require('../../controllers/librosController');

// API REST para libros - Los empleados solo pueden ver libros
router.get('/', librosController.listar); // Todos pueden ver libros
router.post('/', requireRole(['admin']), librosController.crear); // Solo admin puede crear
router.patch('/:id', requireRole(['admin']), librosController.guardarEdicion); // Solo admin puede editar
router.delete('/:id', requireRole(['admin']), librosController.eliminar); // Solo admin puede eliminar
router.get('/:id', librosController.obtener); // Todos pueden ver un libro específico
router.patch('/:id/sumar-stock', async (req, res) => {
  const Libro = require('../../models/Libro');
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
