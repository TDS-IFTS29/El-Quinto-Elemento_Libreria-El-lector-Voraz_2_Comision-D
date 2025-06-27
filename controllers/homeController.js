const Libro = require('../models/Libro');
const Utileria = require('../models/Utileria');
const Cafeteria = require('../models/Cafeteria');
const Venta = require('../models/Venta');

// Dashboard con alertas de stock y ventas recientes para libros, utilería y cafetería
async function vistaDashboard(req, res) {
  try {
    // Obtener las últimas 6 ventas (sin importar la fecha)
    const ultimasSeisVentas = await Venta.find({})
      .sort({ fecha: -1 })
      .limit(6)
      .populate('libro')
      .populate('utileria')
      .populate('cafeteria');
    
    // Obtener las ventas del día actual
    const ahora = new Date();
    const hoy = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate(), 0, 0, 0, 0));
    const manana = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate() + 1, 0, 0, 0, 0));
    
    const ventasDelDia = await Venta.find({
      fecha: { $gte: hoy, $lt: manana }
    }).populate('libro').populate('utileria').populate('cafeteria');
    
    // Combinar ambas listas evitando duplicados
    const ventasIds = new Set();
    const ventasCombinadas = [];
    
    // Agregar las últimas 6 ventas
    ultimasSeisVentas.forEach(venta => {
      ventasIds.add(venta._id.toString());
      ventasCombinadas.push(venta);
    });
    
    // Agregar ventas del día que no estén ya incluidas
    ventasDelDia.forEach(venta => {
      if (!ventasIds.has(venta._id.toString())) {
        ventasCombinadas.push(venta);
      }
    });
    
    const ventasAMostrar = ventasCombinadas;
    
    ventasAMostrar.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const ultimas = ventasAMostrar.map(v => {
      if (v.libro) {
        return {
          tipo: 'Libro',
          nombre: v.libro.nombre,
          autor: v.libro.autor,
          cantidad: v.cantidad,
          monto: v.total || (v.precioUnitario * v.cantidad),
          fecha: v.fecha
        };
      } else if (v.utileria) {
        return {
          tipo: 'Utilería',
          nombre: v.utileria.nombre,
          autor: '-',
          cantidad: v.cantidad,
          monto: v.total || (v.precioUnitario * v.cantidad),
          fecha: v.fecha
        };
      } else if (v.cafeteria) {
        return {
          tipo: 'Cafetería',
          nombre: v.cafeteria.nombre,
          autor: '-',
          cantidad: v.cantidad,
          monto: v.total || (v.precioUnitario * v.cantidad),
          fecha: v.fecha
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
          monto: v.total || (precio * (v.cantidad || 1)),
          fecha: v.fecha
        };
      }
    });
    const total = ultimas.reduce((acc, v) => acc + v.monto, 0);
    
    // Determinar si hay ventas del día actual para mostrar el mensaje apropiado
    const hayVentasDelDia = ventasDelDia.length > 0;
    const esVentasDelDia = false; // Siempre mostrar como "Últimas Ventas + Ventas del Día"

  // Alertas de stock y ventas para libros, utilería y cafetería
  const libros = await Libro.find();
  const utilerias = await Utileria.find();
  const cafeterias = await Cafeteria.find();
  const alertas = [];
  const seisMesesMs = 6 * 30 * 24 * 60 * 60 * 1000;
  const ahoraTimestamp = Date.now();
  // Libros
  for (const libro of libros) {
    if (libro.stock === 0) {
      alertas.push(`Libro: "${libro.nombre}" - Agotado`);
    } else if (libro.stock > 0 && libro.stock <= (libro.stockMinimo ?? 2)) {
      alertas.push(`Libro: "${libro.nombre}" - Solo ${libro.stock} unidades`);
    }
    // No vendido hace 6 meses
    const ultimaVenta = await Venta.findOne({ libro: libro._id }).sort({ fecha: -1 });
    if (!ultimaVenta || (ahoraTimestamp - new Date(ultimaVenta.fecha).getTime() > seisMesesMs)) {
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
    if (!ultimaVenta || (ahoraTimestamp - new Date(ultimaVenta.fecha).getTime() > seisMesesMs)) {
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
    if (!ultimaVenta || (ahoraTimestamp - new Date(ultimaVenta.fecha).getTime() > seisMesesMs)) {
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
    esVentasDelDia: esVentasDelDia,
    hayVentasDelDia: hayVentasDelDia,
    cantidadUltimasVentas: ultimasSeisVentas.length,
    cantidadVentasDelDia: ventasDelDia.length,
    alertasStock: alertasOrdenadas,
    user: req.session.user 
  });
  } catch (error) {
    console.error('Error en vistaDashboard:', error);
    res.status(500).render('error', { 
      message: 'Error al cargar el dashboard', 
      error: error,
      user: req.session.user 
    });
  }
}

module.exports = { vistaDashboard };
