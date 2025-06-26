const Libro = require('../models/Libro');
const Utileria = require('../models/Utileria');
const Cafeteria = require('../models/Cafeteria');
const Venta = require('../models/Venta');

// Dashboard con alertas de stock y ventas recientes para libros, utilería y cafetería
async function vistaDashboard(req, res) {
  // Ventas del día (libros, utilería y cafetería)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const ventas = await Venta.find({
    fecha: { $gte: hoy, $lt: manana }
  }).populate('libro').populate('utileria').populate('cafeteria');
  
  ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const ultimas = ventas.map(v => {
    if (v.libro) {
      return {
        tipo: 'Libro',
        nombre: v.libro.nombre,
        autor: v.libro.autor,
        cantidad: v.cantidad,
        monto: v.total || (v.precioUnitario * v.cantidad)
      };
    } else if (v.utileria) {
      return {
        tipo: 'Utilería',
        nombre: v.utileria.nombre,
        autor: '-',
        cantidad: v.cantidad,
        monto: v.total || (v.precioUnitario * v.cantidad)
      };
    } else if (v.cafeteria) {
      return {
        tipo: 'Cafetería',
        nombre: v.cafeteria.nombre,
        autor: '-',
        cantidad: v.cantidad,
        monto: v.total || (v.precioUnitario * v.cantidad)
      };
    } else {
      // Fallback para ventas sin populate o con datos legacy
      let tipo = 'Desconocido';
      let nombre = 'Producto desconocido';
      let autor = '-';
      let precio = 0;
      
      if (v.tipo === 'libro') {
        tipo = 'Libro';
        nombre = v.nombreLibro || 'Libro sin nombre';
        autor = v.autorLibro || '-';
        precio = v.precioLibro || v.precioUnitario || 0;
      } else if (v.tipo === 'utileria') {
        tipo = 'Utilería';
        nombre = v.nombreUtileria || 'Utilería sin nombre';
        precio = v.precioUtileria || v.precioUnitario || 0;
      } else if (v.tipo === 'cafeteria') {
        tipo = 'Cafetería';
        nombre = v.nombreCafeteria || 'Producto de cafetería sin nombre';
        precio = v.precioCafeteria || v.precioUnitario || 0;
      }
      
      return {
        tipo: tipo,
        nombre: nombre,
        autor: autor,
        cantidad: v.cantidad || 1,
        monto: v.total || (precio * (v.cantidad || 1))
      };
    }
  });
  const total = ultimas.reduce((acc, v) => acc + v.monto, 0);

  // Alertas de stock y ventas para libros, utilería y cafetería
  const libros = await Libro.find();
  const utilerias = await Utileria.find();
  const cafeterias = await Cafeteria.find();
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
  // Cafetería
  for (const cafe of cafeterias) {
    if (cafe.stock === 0) {
      alertas.push(`Cafetería: "${cafe.nombre}" - Agotado`);
    } else if (cafe.stock > 0 && cafe.stock <= (cafe.stockMinimo ?? 2)) {
      alertas.push(`Cafetería: "${cafe.nombre}" - Solo ${cafe.stock} unidades`);
    }
    // No vendido hace 6 meses
    const ultimaVenta = await Venta.findOne({ cafeteria: cafe._id }).sort({ fecha: -1 });
    if (!ultimaVenta || (ahora - new Date(ultimaVenta.fecha).getTime() > seisMesesMs)) {
      alertas.push(`Cafetería: "${cafe.nombre}" - No se vende hace más de 6 meses`);
    }
  }
  // Ordenar alertas
  const agotado = alertas.filter(a => a.includes('Agotado'));
  const pocasUnidades = alertas.filter(a => a.includes('Solo'));
  const sinVenta = alertas.filter(a => a.includes('No se vende hace más de 6 meses'));
  const otras = alertas.filter(a => !a.includes('Agotado') && !a.includes('Solo') && !a.includes('No se vende hace más de 6 meses'));
  const alertasOrdenadas = [...agotado, ...pocasUnidades, ...sinVenta, ...otras];

  res.render('dashboard', { 
    ultimasVentas: ultimas, 
    totalVentas: total, 
    alertasStock: alertasOrdenadas,
    user: req.session.user 
  });
}

module.exports = { vistaDashboard };
