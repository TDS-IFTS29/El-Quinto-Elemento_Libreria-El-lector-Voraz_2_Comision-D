// Script para poner stock en 0 de un libro y una utilería para probar
const mongoose = require('mongoose');
const Libro = require('./models/Libro');
const Utileria = require('./models/Utileria');

async function testStockCero() {
  try {
    await mongoose.connect('mongodb://localhost:27017/el-lector-voraz');
    console.log('✓ Conectado a MongoDB');

    // Poner el stock del primer libro en 0
    const primerLibro = await Libro.findOne();
    if (primerLibro) {
      await Libro.findByIdAndUpdate(primerLibro._id, { stock: 0 });
      console.log(`✓ Stock del libro "${primerLibro.nombre}" puesto en 0`);
    }

    // Poner el stock del primer item de utilería en 0
    const primerUtileria = await Utileria.findOne();
    if (primerUtileria) {
      await Utileria.findByIdAndUpdate(primerUtileria._id, { stock: 0 });
      console.log(`✓ Stock de utilería "${primerUtileria.nombre}" puesto en 0`);
    }

    console.log('✓ Test de stock 0 configurado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testStockCero();
