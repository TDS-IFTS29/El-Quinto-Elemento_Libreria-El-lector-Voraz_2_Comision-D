const mongoose = require('mongoose');
const Utileria = require('./models/Utileria');
const Proveedor = require('./models/Proveedor');

// Conectar a la base de datos
mongoose.connect('mongodb://localhost:27017/el-lector-voraz')
  .then(async () => {
    console.log('Conectado a MongoDB');
    
    // Obtener todos los productos de utilería
    const utileria = await Utileria.find().populate('proveedor');
    
    console.log(`\nProductos de utilería encontrados: ${utileria.length}`);
    
    utileria.forEach((item, index) => {
      console.log(`${index + 1}. ${item.nombre} - $${item.precio} - Stock: ${item.stock} - Proveedor: ${item.proveedor ? item.proveedor.nombre : 'Sin proveedor'}`);
    });
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });
