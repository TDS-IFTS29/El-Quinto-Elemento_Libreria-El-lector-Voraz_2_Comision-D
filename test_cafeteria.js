require('dotenv').config();
const mongoose = require('mongoose');
const Venta = require('./models/Venta');
const Cafeteria = require('./models/Cafeteria');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function testCafeteriaVenta() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    // Buscar un producto de cafetería
    const cafeteria = await Cafeteria.findOne();
    if (!cafeteria) {
      console.log('No hay productos de cafetería');
      return;
    }

    console.log('Producto de cafetería encontrado:', cafeteria.nombre);

    // Crear una venta de prueba de hoy
    const hoy = new Date();
    const nuevaVenta = new Venta({
      tipo: 'cafeteria',
      cafeteria: cafeteria._id,
      nombreCafeteria: cafeteria.nombre,
      precioCafeteria: cafeteria.precio,
      cantidad: 2,
      precioUnitario: cafeteria.precio,
      total: cafeteria.precio * 2,
      cliente: 'Cliente de prueba',
      vendedor: 'Admin',
      fecha: hoy
    });

    await nuevaVenta.save();
    console.log('Venta de cafetería creada con ID:', nuevaVenta._id);

    // Verificar que se puede hacer populate
    const ventaConPopulate = await Venta.findById(nuevaVenta._id).populate('cafeteria');
    console.log('Venta con populate:', {
      tipo: ventaConPopulate.tipo,
      cafeteria: ventaConPopulate.cafeteria ? ventaConPopulate.cafeteria.nombre : 'null',
      nombreCafeteria: ventaConPopulate.nombreCafeteria,
      cantidad: ventaConPopulate.cantidad,
      total: ventaConPopulate.total
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testCafeteriaVenta();
