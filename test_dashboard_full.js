require('dotenv').config();
const mongoose = require('mongoose');
const Libro = require('./models/Libro');
const Utileria = require('./models/Utileria');
const Cafeteria = require('./models/Cafeteria');
const Venta = require('./models/Venta');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function testDashboardController() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    // Simular exactamente el código del dashboard
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
          monto: v.libro.precio * v.cantidad
        };
      } else if (v.utileria) {
        return {
          tipo: 'Utilería',
          nombre: v.utileria.nombre,
          autor: '-',
          cantidad: v.cantidad,
          monto: v.utileria.precio * v.cantidad
        };
      } else if (v.cafeteria) {
        return {
          tipo: 'Cafetería',
          nombre: v.cafeteria.nombre,
          autor: '-',
          cantidad: v.cantidad,
          monto: v.cafeteria.precio * v.cantidad
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
          precio = v.precioLibro || 0;
        } else if (v.tipo === 'utileria') {
          tipo = 'Utilería';
          nombre = v.nombreUtileria || 'Utilería sin nombre';
          precio = v.precioUtileria || 0;
        } else if (v.tipo === 'cafeteria') {
          tipo = 'Cafetería';
          nombre = v.nombreCafeteria || 'Producto de cafetería sin nombre';
          precio = v.precioCafeteria || 0;
        }
        
        return {
          tipo: tipo,
          nombre: nombre,
          autor: autor,
          cantidad: v.cantidad || 1,
          monto: precio * (v.cantidad || 1)
        };
      }
    });
    
    const total = ultimas.reduce((acc, v) => acc + v.monto, 0);

    console.log('\n=== RESULTADO DASHBOARD ===');
    console.log('Ventas Recientes:');
    ultimas.forEach(venta => {
      console.log(`🛒 ${venta.nombre} ×${venta.cantidad} - ${venta.autor} ($${venta.monto})`);
    });
    console.log(`\nTotal: $${total}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testDashboardController();
