const mongoose = require('mongoose');
const Libro = require('./models/Libro');
const Utileria = require('./models/Utileria');
const Cafeteria = require('./models/Cafeteria');
const Venta = require('./models/Venta');

mongoose.connect('mongodb://localhost:27017/el-lector-voraz').then(async () => {
  console.log('Connected to MongoDB: el-lector-voraz');
  
  // Dashboard logic replica
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const ventas = await Venta.find({
    fecha: { $gte: hoy, $lt: manana }
  }).populate('libro').populate('utileria').populate('cafeteria');
  
  ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const ultimas = ventas.map(v => {
    console.log('Processing venta:', {
      tipo: v.tipo,
      cantidad: v.cantidad,
      total: v.total,
      precioUnitario: v.precioUnitario,
      hasLibro: !!v.libro,
      hasUtileria: !!v.utileria,
      hasCafeteria: !!v.cafeteria
    });
    
    if (v.libro) {
      return {
        tipo: 'Libro',
        nombre: v.libro.nombre,
        autor: v.libro.autor,
        cantidad: v.cantidad,
        monto: v.total || (v.precioUnitario * v.cantidad)
      };
    } else if (v.utileria) {
      return {
        tipo: 'Utilería',
        nombre: v.utileria.nombre,
        autor: '-',
        cantidad: v.cantidad,
        monto: v.total || (v.precioUnitario * v.cantidad)
      };
    } else if (v.cafeteria) {
      return {
        tipo: 'Cafetería',
        nombre: v.cafeteria.nombre,
        autor: '-',
        cantidad: v.cantidad,
        monto: v.total || (v.precioUnitario * v.cantidad)
      };
    } else {
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
  
  console.log('Processed ultimas ventas:', ultimas);
  
  await mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
