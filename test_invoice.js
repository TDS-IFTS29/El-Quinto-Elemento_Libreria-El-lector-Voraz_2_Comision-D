require('dotenv').config();
const mongoose = require('mongoose');
const Libro = require('./models/Libro');
const Venta = require('./models/Venta');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function crearVentaTest() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    // Buscar un libro existente
    const libro = await Libro.findOne();
    if (!libro) {
      console.log('No hay libros en la base de datos');
      return;
    }

    console.log('Libro encontrado:', libro.nombre);

    // Crear una venta de prueba
    const nuevaVenta = new Venta({
      tipo: 'libro',
      libro: libro._id,
      nombreLibro: libro.nombre,
      autorLibro: libro.autor,
      generoLibro: libro.genero,
      precioLibro: libro.precio,
      cantidad: 1,
      precioUnitario: libro.precio,
      total: libro.precio,
      cliente: 'Cliente de prueba',
      vendedor: 'Admin',
      fecha: new Date()
    });

    await nuevaVenta.save();
    console.log('Venta creada con ID:', nuevaVenta._id);
    console.log('URL de factura: http://localhost:3000/libros/ventas/factura/' + nuevaVenta._id);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

crearVentaTest();
