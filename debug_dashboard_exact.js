const mongoose = require('mongoose');
const Libro = require('./models/Libro');
const Utileria = require('./models/Utileria');
const Cafeteria = require('./models/Cafeteria');
const Venta = require('./models/Venta');

mongoose.connect('mongodb://localhost:27017/el-lector-voraz').then(async () => {
  console.log('Connected to MongoDB: el-lector-voraz');
  
  // EXACT dashboard logic from homeController.js
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const ventas = await Venta.find({
    fecha: { $gte: hoy, $lt: manana }
  }).populate('libro').populate('utileria').populate('cafeteria');
  
  console.log('Raw ventas data:');
  ventas.forEach((v, i) => {
    console.log(`Venta ${i + 1}:`);
    console.log(`  _id: ${v._id}`);
    console.log(`  tipo: ${v.tipo}`);
    console.log(`  cantidad: ${v.cantidad}`);
    console.log(`  total: ${v.total}`);
    console.log(`  precioUnitario: ${v.precioUnitario}`);
    console.log(`  hasLibro: ${!!v.libro}`);
    console.log(`  hasUtileria: ${!!v.utileria}`);
    console.log(`  hasCafeteria: ${!!v.cafeteria}`);
    if (v.libro) console.log(`  libro.nombre: ${v.libro.nombre}`);
    if (v.utileria) console.log(`  utileria.nombre: ${v.utileria.nombre}`);
    if (v.cafeteria) console.log(`  cafeteria.nombre: ${v.cafeteria.nombre}`);
    console.log('  ---');
  });
  
  ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const ultimas = ventas.map(v => {
    console.log(`\nProcessing venta ${v._id}:`);
    console.log(`  v.libro exists: ${!!v.libro}`);
    console.log(`  v.utileria exists: ${!!v.utileria}`);
    console.log(`  v.cafeteria exists: ${!!v.cafeteria}`);
    
    if (v.libro) {
      console.log(`  -> Going to libro branch`);
      return {
        tipo: 'Libro',
        nombre: v.libro.nombre,
        autor: v.libro.autor,
        cantidad: v.cantidad,
        monto: v.total || (v.precioUnitario * v.cantidad)
      };
    } else if (v.utileria) {
      console.log(`  -> Going to utileria branch`);
      return {
        tipo: 'Utilería',
        nombre: v.utileria.nombre,
        autor: '-',
        cantidad: v.cantidad,
        monto: v.total || (v.precioUnitario * v.cantidad)
      };
    } else if (v.cafeteria) {
      console.log(`  -> Going to cafeteria branch`);
      console.log(`  -> v.cafeteria.nombre: ${v.cafeteria.nombre}`);
      return {
        tipo: 'Cafetería',
        nombre: v.cafeteria.nombre,
        autor: '-',
        cantidad: v.cantidad,
        monto: v.total || (v.precioUnitario * v.cantidad)
      };
    } else {
      console.log(`  -> Going to fallback branch`);
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
  
  console.log('\n=== FINAL RESULT ===');
  console.log('ultimas:', JSON.stringify(ultimas, null, 2));
  
  const total = ultimas.reduce((acc, v) => acc + v.monto, 0);
  console.log(`\nTotal del día: $${total}`);
  
  await mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
