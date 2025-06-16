// controllers/ventasController.js
const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

// API RESTful
async function listar(req, res) {
  const ventas = await Venta.find().populate('producto');
  res.json(ventas);
}

async function registrar(req, res) {
  const { producto, cantidad, fecha } = req.body;
  // Buscar producto por ID
  const prod = await Producto.findById(producto);
  if (!prod) return res.status(400).json({ error: 'Producto no encontrado' });
  const nueva = new Venta({
    producto: prod._id,
    cantidad: parseInt(cantidad),
    fecha: fecha ? new Date(fecha) : undefined
  });
  await nueva.save();
  res.status(201).json(nueva);
}

async function masVendidos(req, res) {
  // Agrupar y contar ventas por producto
  const resultado = await Venta.aggregate([
    { $group: { _id: '$producto', total: { $sum: '$cantidad' } } },
    { $sort: { total: -1 } }
  ]);
  // Obtener los nombres de los productos
  const productos = await Producto.find({ _id: { $in: resultado.map(r => r._id) } });
  const productosMap = {};
  productos.forEach(p => {
    productosMap[p._id] = `${p.nombre} - ${p.autor}`;
  });
  const resultadoConNombre = resultado.map(r => ({
    producto: productosMap[r._id] || 'Desconocido',
    total: r.total
  }));
  res.json(resultadoConNombre);
}

async function ventasSemana(req, res) {
  const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recientes = await Venta.find({ fecha: { $gte: hace7dias } }).populate('producto');
  res.json(recientes);
}

// Solo vistas
async function verCatalogo(req, res) {
  res.render('catalogo_ventas');
}

async function vistaNuevaVenta(req, res) {
  const productos = await Producto.find();
  res.render('nueva_venta', { productos });
}

async function vistaReportesVentas(req, res) {
  res.render('reportes_ventas');
}

module.exports = {
  listar,
  registrar,
  masVendidos,
  ventasSemana,
  verCatalogo,
  vistaNuevaVenta,
  vistaReportesVentas
};
