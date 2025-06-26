const mongoose = require('mongoose');
const Libro = require('./models/Libro');

async function testStockLibros() {
  try {
    await mongoose.connect('mongodb://localhost:27017/el-lector-voraz');
    console.log('Conectado a MongoDB');
    
    const libros = await Libro.find().limit(5);
    console.log(`Encontrados ${libros.length} libros`);
    
    if (libros.length >= 3) {
      // Poner un libro con stock 0
      await Libro.findByIdAndUpdate(libros[0]._id, { 
        stock: 0,
        stockMinimo: 5 
      });
      console.log(`Libro "${libros[0].nombre}" actualizado: stock=0, stockMinimo=5`);
      
      // Poner un libro con stock bajo (2 unidades, stockMinimo 5)
      await Libro.findByIdAndUpdate(libros[1]._id, { 
        stock: 2,
        stockMinimo: 5 
      });
      console.log(`Libro "${libros[1].nombre}" actualizado: stock=2, stockMinimo=5`);
      
      // Poner un libro con stock alto (15 unidades, stockMinimo 10)
      await Libro.findByIdAndUpdate(libros[2]._id, { 
        stock: 15,
        stockMinimo: 10 
      });
      console.log(`Libro "${libros[2].nombre}" actualizado: stock=15, stockMinimo=10`);
    }
    
    console.log('\nEstado actual de los libros:');
    const librosActualizados = await Libro.find().select('nombre stock stockMinimo').limit(10);
    librosActualizados.forEach(libro => {
      let estado = '';
      if (libro.stock === 0) {
        estado = '🔴 SIN STOCK';
      } else if (libro.stock < (libro.stockMinimo || 5)) {
        estado = '🟡 STOCK BAJO';
      } else {
        estado = '🟢 STOCK OK';
      }
      console.log(`${estado} - ${libro.nombre}: ${libro.stock} unidades (min: ${libro.stockMinimo || 5})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión cerrada');
  }
}

testStockLibros();
