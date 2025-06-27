const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✓ Conectado a MongoDB'))
  .catch(err => {
    console.error('✗ Error al conectar:', err);
    process.exit(1);
  });

// Importar modelos
const Libro = require('./models/Libro');
const Cafeteria = require('./models/Cafeteria');
const Utileria = require('./models/Utileria');

async function testStockUpdate() {
  try {
    console.log('\n=== PRUEBA DE ACTUALIZACIÓN DE STOCK ===\n');

    // Test 1: Libros
    console.log('1. Probando actualización de stock en LIBROS:');
    const libro = await Libro.findOne();
    if (libro) {
      console.log(`   Libro encontrado: "${libro.nombre}"`);
      console.log(`   Stock actual: ${libro.stock}`);
      
      libro.stock = (libro.stock || 0) + 1;
      await libro.save();
      
      const libroActualizado = await Libro.findById(libro._id);
      console.log(`   Stock después de sumar 1: ${libroActualizado.stock}`);
      console.log(`   ✓ Actualización exitosa\n`);
    } else {
      console.log('   ✗ No se encontraron libros\n');
    }

    // Test 2: Cafetería
    console.log('2. Probando actualización de stock en CAFETERÍA:');
    const cafeteria = await Cafeteria.findOne();
    if (cafeteria) {
      console.log(`   Item encontrado: "${cafeteria.nombre}"`);
      console.log(`   Stock actual: ${cafeteria.stock}`);
      
      cafeteria.stock += 1;
      await cafeteria.save();
      
      const cafeteriaActualizada = await Cafeteria.findById(cafeteria._id);
      console.log(`   Stock después de sumar 1: ${cafeteriaActualizada.stock}`);
      console.log(`   ✓ Actualización exitosa\n`);
    } else {
      console.log('   ✗ No se encontraron items de cafetería\n');
    }

    // Test 3: Utilería
    console.log('3. Probando actualización de stock en UTILERÍA:');
    const utileria = await Utileria.findOne();
    if (utileria) {
      console.log(`   Item encontrado: "${utileria.nombre}"`);
      console.log(`   Stock actual: ${utileria.stock}`);
      
      utileria.stock = (utileria.stock || 0) + 1;
      await utileria.save();
      
      const utileriaActualizada = await Utileria.findById(utileria._id);
      console.log(`   Stock después de sumar 1: ${utileriaActualizada.stock}`);
      console.log(`   ✓ Actualización exitosa\n`);
    } else {
      console.log('   ✗ No se encontraron items de utilería\n');
    }

  } catch (error) {
    console.error('✗ Error durante la prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Desconectado de MongoDB');
  }
}

testStockUpdate();
