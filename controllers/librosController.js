const Libro = require('../models/Libro');
const Venta = require('../models/Venta');
const mongoose = require('mongoose');

// API RESTful
async function listar(req, res) {
  const libros = await Libro.find();
  res.json(libros);
}

async function crear(req, res) {
  const nuevo = new Libro({
    nombre: req.body.nombre,
    autor: req.body.autor,
    precio: parseFloat(req.body.precio),
    genero: req.body.genero,
    stock: parseInt(req.body.stock) || 0
  });
  await nuevo.save();
  res.status(201).json(nuevo); // Cambiado a status 201 y respuesta JSON
}

async function eliminar(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de libro inválido' });
  }
  const result = await Libro.findByIdAndDelete(id);
  if (!result) {
    return res.status(404).json({ error: 'Libro no encontrado' });
  }
  res.status(200).json({ mensaje: 'Libro eliminado correctamente' }); // status 200 explícito
}

async function guardarEdicion(req, res) {
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
  await libro.save();
  res.status(200).json(libro); // status 200 explícito
}

async function vistaNuevoLibro(req, res) {
  res.render('libros/nuevo_libro');
}

async function vistaEditarLibro(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID de libro inválido');
  }
  const libro = await Libro.findById(id);
  if (!libro) return res.status(404).send('Libro no encontrado');
  res.render('libros/editar_libro', { libro });
}

// Falta la función obtener para la API REST
async function obtener(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de libro inválido' });
  }
  const libro = await Libro.findById(id);
  if (!libro) {
    return res.status(404).json({ error: 'Libro no encontrado' });
  }
  res.status(200).json(libro); // status 200 explícito
}

async function verCatalogo(req, res) {
  const libros = await Libro.find();
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

async function vistaReportesVentas(req, res) {
  // Obtener todas las ventas y agrupar por libro
  const ventas = await Venta.find().populate('libro');
  const resumen = {};
  let total_cantidad_vendida = 0;
  let total_ingresos = 0;

  ventas.forEach(v => {
    const id = v.libro ? v.libro._id.toString() : v.nombreLibro;
    const precio = v.libro && v.libro.precio ? v.libro.precio : (v.precioFicticio || 0);
    const genero = v.libro && v.libro.genero ? v.libro.genero : '-';
    if (!resumen[id]) {
      resumen[id] = {
        titulo: v.libro ? v.libro.nombre : v.nombreLibro,
        autor: v.libro ? v.libro.autor : v.autorLibro,
        genero: genero,
        precio: precio,
        cantidad_vendida: 0,
        ingresos: 0
      };
    }
    resumen[id].cantidad_vendida += v.cantidad;
    resumen[id].ingresos += precio * v.cantidad;
    total_cantidad_vendida += v.cantidad;
    total_ingresos += precio * v.cantidad;
  });

  res.render('libros/reportes_ventas_libros', {
    libros: Object.values(resumen),
    total_cantidad_vendida,
    total_ingresos
  });
}

async function vistaDashboard(req, res) {
  // Obtener todas las ventas del día actual
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const ventas = await Venta.find({
    fecha: { $gte: hoy, $lt: manana }
  }).populate('libro');
  // Ordenar por fecha descendente
  ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const ultimas = ventas.map(v => ({
    nombre: v.libro && v.libro.nombre ? v.libro.nombre : v.nombreLibro,
    autor: v.libro && v.libro.autor ? v.libro.autor : v.autorLibro,
    cantidad: v.cantidad,
    monto: (v.libro && v.libro.precio ? v.libro.precio : 0) * v.cantidad
  }));
  const total = ultimas.reduce((acc, v) => acc + v.monto, 0);

  // Alertas de stock y de ventas
  const libros = await Libro.find();
  const alertas = [];
  const seisMesesMs = 6 * 30 * 24 * 60 * 60 * 1000;
  const ahora = Date.now();
  for (const libro of libros) {
    if (libro.stock === 0) {
      alertas.push(`Libro: "${libro.nombre}" - Agotado`);
    } else if (libro.stock > 0 && libro.stock <= 2) {
      alertas.push(`Libro: "${libro.nombre}" - Solo ${libro.stock} unidades`);
    }
    // ALERTA: No se vende hace más de 6 meses
    const ultimaVenta = await Venta.findOne({ libro: libro._id }).sort({ fecha: -1 });
    if (!ultimaVenta || (ahora - new Date(ultimaVenta.fecha).getTime() > seisMesesMs)) {
      alertas.push(`Libro: "${libro.nombre}" - No se vende hace más de 6 meses`);
    }
  }

  // Ordenar alertas: primero Agotado, luego Solo X unidades, luego No se vende hace más de 6 meses
  const agotado = alertas.filter(a => a.includes('Agotado'));
  const pocasUnidades = alertas.filter(a => a.includes('Solo'));
  const sinVenta = alertas.filter(a => a.includes('No se vende hace más de 6 meses'));
  const otras = alertas.filter(a => !a.includes('Agotado') && !a.includes('Solo') && !a.includes('No se vende hace más de 6 meses'));
  const alertasOrdenadas = [...agotado, ...pocasUnidades, ...sinVenta, ...otras];

  res.render('dashboard', { ultimasVentas: ultimas, totalVentas: total, alertasStock: alertasOrdenadas });
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
  // Ventas de Libros
  listarVentas,
  registrarVenta,
  masVendidos,
  ventasSemana,
  verCatalogoVentas,
  vistaNuevaVenta,
  vistaReportesVentas,
  vistaDashboard
};
