const Libro = require('../models/Libro');
const Utileria = require('../models/Utileria');
const Venta = require('../models/Venta');

// Dashboard con alertas de stock y ventas recientes para libros y utilería
async function vistaDashboard(req, res) {
  // Ventas del día (libros y utilería)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const ventas = await Venta.find({
    fecha: { $gte: hoy, $lt: manana }
  }).populate('libro').populate('utileria');
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

  // Alertas de stock y ventas para libros
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
    // No vendido hace 6 meses
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
    // No vendido hace 6 meses
    const ultimaVenta = await Venta.findOne({ utileria: util._id }).sort({ fecha: -1 });
    if (!ultimaVenta || (ahora - new Date(ultimaVenta.fecha).getTime() > seisMesesMs)) {
      alertas.push(`Utilería: "${util.nombre}" - No se vende hace más de 6 meses`);
    }
  }
  // Ordenar alertas
  const agotado = alertas.filter(a => a.includes('Agotado'));
  const pocasUnidades = alertas.filter(a => a.includes('Solo'));
  const sinVenta = alertas.filter(a => a.includes('No se vende hace más de 6 meses'));
  const otras = alertas.filter(a => !a.includes('Agotado') && !a.includes('Solo') && !a.includes('No se vende hace más de 6 meses'));
  const alertasOrdenadas = [...agotado, ...pocasUnidades, ...sinVenta, ...otras];

  res.render('dashboard', { ultimasVentas: ultimas, totalVentas: total, alertasStock: alertasOrdenadas });
}

module.exports = { vistaDashboard };
