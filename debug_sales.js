const mongoose = require('mongoose');
const Venta = require('./models/Venta');

mongoose.connect('mongodb://localhost:27017/el-lector-voraz').then(async () => {
  console.log('Connected to MongoDB: el-lector-voraz');
  
  // Get today's sales
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  
  const ventasHoy = await Venta.find({
    fecha: { $gte: hoy, $lt: manana }
  }).populate('libro').populate('utileria').populate('cafeteria').sort({fecha: -1});
  
  console.log('Today sales:');
  ventasHoy.forEach((v, index) => {
    console.log(`Sale ${index + 1}: ${v.fecha}`);
    console.log(`  Type: ${v.tipo}`);
    console.log(`  Cantidad: ${v.cantidad}`);
    console.log(`  Total: ${v.total}`);
    if (v.libro) console.log(`  Libro: ${v.libro.nombre} - ${v.libro.autor}`);
    if (v.utileria) console.log(`  Utileria: ${v.utileria.nombre}`);
    if (v.cafeteria) console.log(`  Cafeteria: ${v.cafeteria.nombre}`);
    console.log('  ---');
  });
  
  // Also check cafeteria sales specifically
  const ventasCafeteria = await Venta.find({ tipo: 'cafeteria' }).populate('cafeteria').sort({fecha: -1}).limit(3);
  console.log('Recent cafeteria sales:');
  ventasCafeteria.forEach((v, index) => {
    console.log(`Cafeteria Sale ${index + 1}: ${v.fecha}`);
    console.log(`  Cantidad: ${v.cantidad}`);
    console.log(`  Total: ${v.total}`);
    if (v.cafeteria) console.log(`  Product: ${v.cafeteria.nombre}`);
    console.log('  ---');
  });
  
  await mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
