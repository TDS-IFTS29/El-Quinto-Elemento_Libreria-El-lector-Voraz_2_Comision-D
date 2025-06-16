// Script para purgar todas las ventas y crear 10 ventas de ejemplo
require('dotenv').config();
const mongoose = require('mongoose');
const Venta = require('./models/Venta');
const Producto = require('./models/Producto');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function purgarYCrearVentas() {
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB');

  // Eliminar todas las ventas
  await Venta.deleteMany({});
  console.log('Historial de ventas purgado.');

  // Obtener productos existentes
  const productos = await Producto.find();
  if (productos.length < 3) {
    throw new Error('Se requieren al menos 3 productos en la base para crear ventas de ejemplo.');
  }

  // Crear 10 ventas de ejemplo, alternando productos y cantidades
  const ventas = [
    { producto: productos[0]._id, cantidad: 2 },
    { producto: productos[1]._id, cantidad: 1 },
    { producto: productos[2]._id, cantidad: 3 },
    { producto: productos[0]._id, cantidad: 1 },
    { producto: productos[1]._id, cantidad: 4 },
    { producto: productos[2]._id, cantidad: 2 },
    { producto: productos[0]._id, cantidad: 5 },
    { producto: productos[1]._id, cantidad: 2 },
    { producto: productos[2]._id, cantidad: 1 },
    { producto: productos[0]._id, cantidad: 3 }
  ];

  for (const v of ventas) {
    await new Venta({ ...v, fecha: new Date() }).save();
  }
  console.log('10 ventas de ejemplo creadas.');

  await mongoose.disconnect();
  console.log('Listo.');
}

purgarYCrearVentas().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
