require('dotenv').config();
const mongoose = require('mongoose');
const Venta = require('./models/Venta');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function testDashboard() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    // Simular la consulta del dashboard
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    
    const ventas = await Venta.find({
      fecha: { $gte: hoy, $lt: manana }
    }).populate('libro').populate('utileria').populate('cafeteria');
    
    console.log('=== VENTAS DEL DÍA ===');
    console.log('Total ventas:', ventas.length);
    
    ventas.forEach((v, index) => {
      console.log(`\nVenta ${index + 1}:`);
      console.log('  Tipo:', v.tipo);
      console.log('  Libro:', v.libro ? v.libro.nombre : 'null');
      console.log('  Utilería:', v.utileria ? v.utileria.nombre : 'null');
      console.log('  Cafetería:', v.cafeteria ? v.cafeteria.nombre : 'null');
      console.log('  nombreCafeteria:', v.nombreCafeteria);
      console.log('  precioCafeteria:', v.precioCafeteria);
      console.log('  Cantidad:', v.cantidad);
      console.log('  Total:', v.total);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testDashboard();
