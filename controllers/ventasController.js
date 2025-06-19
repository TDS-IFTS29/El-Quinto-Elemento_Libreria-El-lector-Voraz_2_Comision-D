const Venta = require('../models/Venta');
const Libro = require('../models/Libro');

// Obtener todas las ventas
exports.getAllVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().populate('libro');
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

// Obtener una venta por ID
exports.getVentaById = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id).populate('libro');
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
};

// Crear una nueva venta
exports.createVenta = async (req, res) => {
  try {
    const { libro, cantidad } = req.body;
    if (!libro || !cantidad) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    // Buscar el libro para obtener nombre y autor
    const libroDoc = await Libro.findById(libro);
    if (!libroDoc) {
      return res.status(400).json({ error: 'Libro no encontrado' });
    }
    const nuevaVenta = new Venta({
      libro,
      nombreLibro: libroDoc.nombre,
      autorLibro: libroDoc.autor,
      cantidad
    });
    await nuevaVenta.save();
    res.status(201).json(nuevaVenta);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear la venta' });
  }
};

// Actualizar una venta existente
exports.updateVenta = async (req, res) => {
  try {
    const { libro, nombreLibro, autorLibro, cantidad, fecha } = req.body;
    const ventaActualizada = await Venta.findByIdAndUpdate(
      req.params.id,
      { libro, nombreLibro, autorLibro, cantidad, fecha },
      { new: true }
    );
    if (!ventaActualizada) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(ventaActualizada);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar la venta' });
  }
};

// Eliminar una venta
exports.deleteVenta = async (req, res) => {
  try {
    const ventaEliminada = await Venta.findByIdAndDelete(req.params.id);
    if (!ventaEliminada) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json({ mensaje: 'Venta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la venta' });
  }
};
