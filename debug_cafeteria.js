const mongoose = require('mongoose');
const Venta = require('./models/Venta');
const Cafeteria = require('./models/Cafeteria');

mongoose.connect('mongodb://localhost:27017/el-lector-voraz').then(async () => {
  console.log('Connected to MongoDB: el-lector-voraz');
  
  // Get today's sales
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  
  console.log('=== Checking cafeteria sales specifically ===');
  const ventasCafeteria = await Venta.find({
    tipo: 'cafeteria',
    fecha: { $gte: hoy, $lt: manana }
  });
  
  console.log('Cafeteria sales without populate:', ventasCafeteria.map(v => ({
    _id: v._id,
    tipo: v.tipo,
    cantidad: v.cantidad,
    total: v.total,
    cafeteria: v.cafeteria,
    nombreCafeteria: v.nombreCafeteria,
    precioCafeteria: v.precioCafeteria
  })));
  
  console.log('\n=== Checking cafeteria sales WITH populate ===');
  const ventasCafeteriaPopulated = await Venta.find({
    tipo: 'cafeteria',
    fecha: { $gte: hoy, $lt: manana }
  }).populate('cafeteria');
  
  console.log('Cafeteria sales with populate:', ventasCafeteriaPopulated.map(v => ({
    _id: v._id,
    tipo: v.tipo,
    cantidad: v.cantidad,
    total: v.total,
    cafeteria: v.cafeteria,
    nombreCafeteria: v.nombreCafeteria,
    precioCafeteria: v.precioCafeteria
  })));
  
  console.log('\n=== Checking all cafeteria products ===');
  const cafeteriaProducts = await Cafeteria.find();
  console.log('Cafeteria products:', cafeteriaProducts.map(c => ({
    _id: c._id,
    nombre: c.nombre,
    precio: c.precio
  })));
  
  await mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
