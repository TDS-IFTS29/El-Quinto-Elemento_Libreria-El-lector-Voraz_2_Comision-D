const mongoose = require('mongoose');
const Libro = require('./models/Libro');
const Utileria = require('./models/Utileria');
const Cafeteria = require('./models/Cafeteria');
const Venta = require('./models/Venta');

// Reproduce exactly what the homeController does
async function vistaDashboard() {
  // Ventas del día (libros, utilería y cafetería)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  
  console.log('=== REPRODUCING EXACT DASHBOARD LOGIC ===');
  console.log('Today range:', hoy, 'to', manana);
  
  const ventas = await Venta.find({
    fecha: { $gte: hoy, $lt: manana }
  }).populate('libro').populate('utileria').populate('cafeteria');
  
  console.log('\nFound', ventas.length, 'sales for today');
  
  ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const ultimas = ventas.map(v => {
    console.log('\nProcessing sale:');
    console.log('- Type:', v.tipo);
    console.log('- Has libro:', !!v.libro);
    console.log('- Has utileria:', !!v.utileria);
    console.log('- Has cafeteria:', !!v.cafeteria);
    
    if (v.libro) {
      const result = {
        tipo: 'Libro',
        nombre: v.libro.nombre,
        autor: v.libro.autor,
        cantidad: v.cantidad,
        monto: v.total || (v.precioUnitario * v.cantidad)
      };
      console.log('→ Libro result:', result);
      return result;
    } else if (v.utileria) {
      const result = {
        tipo: 'Utilería',
        nombre: v.utileria.nombre,
        autor: '-',
        cantidad: v.cantidad,
        monto: v.total || (v.precioUnitario * v.cantidad)
      };
      console.log('→ Utileria result:', result);
      return result;
    } else if (v.cafeteria) {
      const result = {
        tipo: 'Cafetería',
        nombre: v.cafeteria.nombre,
        autor: '-',
        cantidad: v.cantidad,
        monto: v.total || (v.precioUnitario * v.cantidad)
      };
      console.log('→ Cafeteria result:', result);
      return result;
    } else {
      // Fallback para ventas sin populate o con datos legacy
      let tipo = 'Desconocido';
      let nombre = 'Producto desconocido';
      let autor = '-';
      let precio = 0;
      
      console.log('→ Using fallback logic');
      console.log('  - nombreCafeteria:', v.nombreCafeteria);
      console.log('  - precioCafeteria:', v.precioCafeteria);
      
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
      
      const result = {
        tipo: tipo,
        nombre: nombre,
        autor: autor,
        cantidad: v.cantidad || 1,
        monto: v.total || (precio * (v.cantidad || 1))
      };
      console.log('→ Fallback result:', result);
      return result;
    }
  });
  
  const total = ultimas.reduce((acc, v) => acc + v.monto, 0);
  
  console.log('\n=== FINAL DASHBOARD DATA ===');
  console.log('ultimasVentas:', JSON.stringify(ultimas, null, 2));
  console.log('totalVentas:', total);
  
  // Simulate the Pug template rendering
  console.log('\n=== SIMULATED PUG TEMPLATE OUTPUT ===');
  ultimas.forEach(v => {
    let icon = '';
    if (v.tipo === 'libro' || v.tipo === 'Libro' || (v.autor && v.autor !== '-')) {
      icon = '📚';
    } else if (v.tipo === 'cafeteria' || v.tipo === 'Cafetería') {
      icon = '☕';
    } else {
      icon = '📏';
    }
    console.log(`${icon} ${v.nombre} ×${v.cantidad} - ${v.autor || 'N/A'} ($${v.monto})`);
  });
  console.log(`Total del día: $${total}`);
}

mongoose.connect('mongodb://localhost:27017/el-lector-voraz').then(async () => {
  console.log('Connected to MongoDB: el-lector-voraz');
  await vistaDashboard();
  await mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
