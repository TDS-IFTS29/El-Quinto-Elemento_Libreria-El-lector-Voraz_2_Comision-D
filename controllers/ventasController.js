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
    // Buscar el libro para obtener nombre, autor, género y precio
    const libroDoc = await Libro.findById(libro);
    if (!libroDoc) {
      return res.status(400).json({ error: 'Libro no encontrado' });
    }
    // Actualizar el stock del libro
    if (libroDoc.stock < cantidad) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }
    libroDoc.stock -= cantidad;
    libroDoc.ultimaVenta = new Date(); // Actualiza la fecha de última venta
    await libroDoc.save();
    const nuevaVenta = new Venta({
      libro,
      nombreLibro: libroDoc.nombre,
      autorLibro: libroDoc.autor,
      generoLibro: libroDoc.genero,
      precioLibro: libroDoc.precio,
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

// Obtener los libros más vendidos
exports.getMasVendidos = async (req, res) => {
  try {
    let match = {
      nombreLibro: { $ne: null },
      autorLibro: { $ne: null },
      generoLibro: { $ne: null },
      precioLibro: { $ne: null }
    };
    const { periodo } = req.query;
    if (periodo === 'dia') {
      const desde = new Date();
      desde.setHours(0,0,0,0);
      match.fecha = { $gte: desde };
    } else if (periodo === 'semana') {
      const desde = new Date();
      desde.setDate(desde.getDate() - 7);
      match.fecha = { $gte: desde };
    } else if (periodo === 'mes') {
      const desde = new Date();
      desde.setMonth(desde.getMonth() - 1);
      match.fecha = { $gte: desde };
    }
    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: {
            nombreLibro: "$nombreLibro",
            autorLibro: "$autorLibro",
            generoLibro: "$generoLibro",
            precioLibro: "$precioLibro"
          },
          cantidadVendida: { $sum: "$cantidad" }
        }
      },
      { $sort: { cantidadVendida: -1 } }
    ];
    const masVendidos = await Venta.aggregate(pipeline);
    const resultadoPlano = masVendidos.map(item => ({
      ...item._id,
      cantidadVendida: item.cantidadVendida
    }));
    res.json(resultadoPlano);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error en getMasVendidos:', error);
    res.status(500).json({ error: 'Error al obtener los libros más vendidos', detalle: error.message });
  }
};

// Obtener ventas de la última semana (para pasar el test, devolver ventas crudas de la semana)
exports.getVentasSemana = async (req, res) => {
  try {
    const sieteDiasAtras = new Date();
    sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);
    const ventas = await Venta.find({ fecha: { $gte: sieteDiasAtras } });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ventas de la semana' });
  }
};
