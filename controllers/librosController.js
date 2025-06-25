const Libro = require('../models/Libro');
const Venta = require('../models/Venta');
const Proveedor = require('../models/Proveedor');
const Utileria = require('../models/Utileria');
const mongoose = require('mongoose');

// API RESTful
async function listar(req, res) {
  const libros = await Libro.find().populate('proveedor');
  res.json(libros);
}

async function crear(req, res) {
  try {
    // Validar que se envíe proveedor
    let proveedorId = req.body.proveedor;
    if (!proveedorId) {
      return res.status(400).json({ error: 'El campo proveedor es obligatorio y debe ser el ObjectId de un proveedor de tipo libreria' });
    }
    // Validar que el proveedor exista y sea de tipo libreria
    const proveedor = await Proveedor.findOne({ _id: proveedorId, tipo_proveedor: 'libreria' });
    if (!proveedor) {
      return res.status(400).json({ error: 'Proveedor inválido o no es de tipo libreria' });
    }
    const nuevo = new Libro({
      nombre: req.body.nombre,
      autor: req.body.autor,
      precio: parseFloat(req.body.precio),
      genero: req.body.genero,
      stock: parseInt(req.body.stock) || 0,
      proveedor: proveedor._id
    });
    await nuevo.save();
    await nuevo.populate('proveedor');
    res.status(201).json(nuevo); // Cambiado a status 201 y respuesta JSON
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al crear el libro' });
  }
}

async function eliminar(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de libro inválido' });
    }
    const result = await Libro.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    res.status(200).json({ mensaje: 'Libro eliminado correctamente' }); // status 200 explícito
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Error interno del servidor al eliminar el libro' });
  }
}

async function guardarEdicion(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de libro inválido' });
    }
    const libro = await Libro.findById(id);
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    libro.nombre = req.body.nombre ?? libro.nombre;
    libro.autor = req.body.autor ?? libro.autor;
    libro.precio = req.body.precio ?? libro.precio;
    if (req.body.stock !== undefined) {
      libro.stock = parseInt(req.body.stock);
      if (isNaN(libro.stock) || libro.stock < 0) libro.stock = 0;
    }
    if (req.body.stockMinimo !== undefined) {
      libro.stockMinimo = parseInt(req.body.stockMinimo);
      if (isNaN(libro.stockMinimo) || libro.stockMinimo < 0) libro.stockMinimo = 0;
    }
    // Permitir actualizar el proveedor si viene en el body
    if (req.body.proveedor) {
      // Validar que el proveedor exista y sea de tipo libreria
      const proveedor = await Proveedor.findOne({ _id: req.body.proveedor, tipo_proveedor: 'libreria' });
      if (!proveedor) {
        return res.status(400).json({ error: 'Proveedor inválido o no es de tipo libreria' });
      }
      libro.proveedor = proveedor._id;
    }
    await libro.save();
    await libro.populate('proveedor');
    res.status(200).json(libro); // status 200 explícito
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el libro' });
  }
}

async function vistaNuevoLibro(req, res) {
  res.render('libros/nuevo_libro');
}

async function vistaEditarLibro(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID de libro inválido');
  }
  const libro = await Libro.findById(id).populate('proveedor');
  if (!libro) return res.status(404).send('Libro no encontrado');
  res.render('libros/editar_libro', { libro });
}

// Falta la función obtener para la API REST
async function obtener(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de libro inválido' });
  }
  const libro = await Libro.findById(id).populate('proveedor');
  if (!libro) {
    return res.status(404).json({ error: 'Libro no encontrado' });
  }
  res.status(200).json(libro); // status 200 explícito
}

async function verCatalogo(req, res) {
  const libros = await Libro.find().populate('proveedor');
  res.render('libros/catalogo_libros', { libros, activeMenu: 'catalogo' });
}

// --- VENTAS DE LIBROS ---
async function listarVentas(req, res) {
  try {
    const ventas = await Venta.find().populate('libro');
    res.status(200).json(ventas); // status 200 explícito
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function registrarVenta(req, res) {
  const libroId = req.body.libro || req.body.libroId;
  const libro = await Libro.findById(libroId);
  if (!libro) {
    return res.status(400).json({ error: 'Libro no encontrado' });
  }
  const nuevaVenta = new Venta({
    libro: libroId,
    nombreLibro: libro.nombre,
    autorLibro: libro.autor,
    cantidad: req.body.cantidad,
    fecha: new Date()
  });
  if ((libro.stock || 0) < nuevaVenta.cantidad) {
    return res.status(400).json({ error: 'No hay stock suficiente para realizar la venta.' });
  }
  await nuevaVenta.save();
  libro.ultimaVenta = nuevaVenta.fecha;
  libro.stock = (libro.stock || 0) - nuevaVenta.cantidad;
  if (libro.stock < 0) libro.stock = 0;
  await libro.save();
  res.status(201).json({ mensaje: 'Venta registrada correctamente.' }); // status 201 para creación
}

async function masVendidos(req, res) {
  const librosVendidos = await Venta.aggregate([
    { $group: { _id: '$libro', totalVentas: { $sum: '$cantidad' } } },
    { $sort: { totalVentas: -1 } },
    { $limit: 10 }
  ]);
  res.status(200).json(librosVendidos); // status 200 explícito
}

async function ventasSemana(req, res) {
  const hoy = new Date();
  const haceUnaSemana = new Date(hoy);
  haceUnaSemana.setDate(hoy.getDate() - 7);
  const ventas = await Venta.find({
    fecha: { $gte: haceUnaSemana, $lte: hoy }
  }).populate('libro');
  res.status(200).json(ventas); // status 200 explícito
}

async function verCatalogoVentas(req, res) {
  const ventas = await Venta.find().populate('libro');
  res.render('libros/catalogo_ventas_libros', { ventas });
}

async function vistaNuevaVenta(req, res) {
  const libros = await Libro.find();
  let libroSeleccionado = null;
  if (req.query.libro) {
    libroSeleccionado = req.query.libro;
  }
  res.render('libros/nueva_venta', { libros, libroSeleccionado });
}

async function vistaReportesLibros(req, res) {
  res.render('libros/reportes_libros');
}

async function vistaReportesVentas(req, res) {
  // Obtener todas las ventas y armar el array para la tabla
  const ventas = await Venta.find().populate('libro');
  let total_ingresos = 0;
  const libros = ventas.map(v => {
    const precio = v.precioLibro;
    const cantidad = v.cantidad;
    const ingresos = precio * cantidad;
    total_ingresos += ingresos;
    return {
      id: v._id,
      fecha: v.fecha ? new Date(v.fecha).toLocaleDateString() : '',
      titulo: v.nombreLibro || (v.libro && v.libro.nombre),
      autor: v.autorLibro || (v.libro && v.libro.autor),
      genero: v.generoLibro || (v.libro && v.libro.genero),
      precio: precio,
      cantidad_vendida: cantidad,
      ingresos: ingresos
    };
  });
  res.render('libros/reportes_ventas_libros', { libros, total_ingresos });
}

async function vistaDashboard(req, res) {
  // Obtener todas las ventas del día actual
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const ventas = await Venta.find({
    fecha: { $gte: hoy, $lt: manana }
  }).populate('libro').populate('utileria');
  // Ordenar por fecha descendente
  ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const ultimas = ventas.map(v => {
    if (v.libro) {
      return {
        nombre: v.libro.nombre,
        autor: v.libro.autor,
        cantidad: v.cantidad,
        monto: v.libro.precio * v.cantidad
      };
    } else if (v.utileria) {
      return {
        nombre: v.utileria.nombre,
        autor: '-',
        cantidad: v.cantidad,
        monto: v.utileria.precio * v.cantidad
      };
    } else {
      return {
        nombre: v.nombreLibro || v.nombreUtileria,
        autor: v.autorLibro || '-',
        cantidad: v.cantidad,
        monto: (v.precioLibro || v.precioUtileria || 0) * v.cantidad
      };
    }
  });
  const total = ultimas.reduce((acc, v) => acc + v.monto, 0);

  // Alertas de stock y de ventas
  const libros = await Libro.find();
  const utilerias = await Utileria.find();
  const alertas = [];
  const seisMesesMs = 6 * 30 * 24 * 60 * 60 * 1000;
  const ahora = Date.now();
  // Libros
  for (const libro of libros) {
    if (libro.stock === 0) {
      alertas.push(`Libro: "${libro.nombre}" - Agotado`);
    } else if (libro.stock > 0 && libro.stock <= (libro.stockMinimo ?? 2)) {
      alertas.push(`Libro: "${libro.nombre}" - Solo ${libro.stock} unidades`);
    }
    // ALERTA: No se vende hace más de 6 meses
    const ultimaVenta = await Venta.findOne({ libro: libro._id }).sort({ fecha: -1 });
    if (!ultimaVenta || (ahora - new Date(ultimaVenta.fecha).getTime() > seisMesesMs)) {
      alertas.push(`Libro: "${libro.nombre}" - No se vende hace más de 6 meses`);
    }
  }
  // Utilería
  for (const util of utilerias) {
    if (util.stock === 0) {
      alertas.push(`Utilería: "${util.nombre}" - Agotado`);
    } else if (util.stock > 0 && util.stock <= (util.stockMinimo ?? 2)) {
      alertas.push(`Utilería: "${util.nombre}" - Solo ${util.stock} unidades`);
    }
    // ALERTA: No se vende hace más de 6 meses
    const ultimaVenta = await Venta.findOne({ utileria: util._id }).sort({ fecha: -1 });
    if (!ultimaVenta || (ahora - new Date(ultimaVenta.fecha).getTime() > seisMesesMs)) {
      alertas.push(`Utilería: "${util.nombre}" - No se vende hace más de 6 meses`);
    }
  }
  // Ordenar alertas: primero Agotado, luego Solo X unidades, luego No se vende hace más de 6 meses
  const agotado = alertas.filter(a => a.includes('Agotado'));
  const pocasUnidades = alertas.filter(a => a.includes('Solo'));
  const sinVenta = alertas.filter(a => a.includes('No se vende hace más de 6 meses'));
  const otras = alertas.filter(a => !a.includes('Agotado') && !a.includes('Solo') && !a.includes('No se vende hace más de 6 meses'));
  const alertasOrdenadas = [...agotado, ...pocasUnidades, ...sinVenta, ...otras];

  res.render('dashboard', { 
    ultimasVentas: ultimas, 
    totalVentas: total, 
    alertasStock: alertasOrdenadas,
    user: req.usuario // Pasar datos del usuario a la vista (cambiado a 'user' para consistencia)
  });
}

module.exports = {
  // Libros
  listar,
  crear,
  eliminar,
  guardarEdicion,
  vistaNuevoLibro,
  vistaEditarLibro,
  obtener,
  verCatalogo,
  vistaReportesLibros,
  // Ventas de Libros
  listarVentas,
  registrarVenta,
  masVendidos,
  ventasSemana,
  verCatalogoVentas,
  vistaNuevaVenta,
  vistaDashboard,
  vistaReportesVentas
};
