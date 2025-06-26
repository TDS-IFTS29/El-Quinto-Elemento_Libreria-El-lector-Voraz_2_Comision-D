// Test script para verificar que los reportes de utilería muestran datos correctos
const mongoose = require('mongoose');
const Venta = require('./models/Venta');

async function testUtileriaReports() {
  try {
    await mongoose.connect('mongodb://localhost:27017/el-lector-voraz');
    console.log('✓ Conectado a MongoDB');

    // Obtener todas las ventas de utilería
    const ventas = await Venta.find().populate('utileria').populate('libro');
    console.log(`✓ Total ventas: ${ventas.length}`);

    // Filtrar solo ventas de utilería
    const ventasUtileria = ventas.filter(venta => venta.utileria || venta.nombreUtileria);
    console.log(`✓ Ventas de utilería: ${ventasUtileria.length}`);

    if (ventasUtileria.length > 0) {
      console.log('\n--- DATOS DE VENTAS DE UTILERÍA ---');
      ventasUtileria.forEach((venta, index) => {
        const nombre = (venta.utileria && venta.utileria.nombre) || venta.nombreUtileria || 'Sin nombre';
        const descripcion = (venta.utileria && venta.utileria.descripcion) || 'Sin descripción';
        const precio = parseFloat((venta.utileria && venta.utileria.precio) || venta.precioUtileria || 0);
        const cantidad = parseInt(venta.cantidad || 0);
        const ingresos = precio * cantidad;
        const fecha = venta.fecha ? venta.fecha.toLocaleDateString('es-AR') : '-';

        console.log(`\nVenta ${index + 1}:`);
        console.log(`  Fecha: ${fecha}`);
        console.log(`  Producto: ${nombre}`);
        console.log(`  Descripción: ${descripcion}`);
        console.log(`  Precio: $${precio.toFixed(2)}`);
        console.log(`  Cantidad: ${cantidad}`);
        console.log(`  Total: $${ingresos.toFixed(2)}`);
      });

      // Calcular totales
      const totalCantidad = ventasUtileria.reduce((sum, venta) => {
        return sum + parseInt(venta.cantidad || 0);
      }, 0);

      const totalIngresos = ventasUtileria.reduce((sum, venta) => {
        const precio = parseFloat((venta.utileria && venta.utileria.precio) || venta.precioUtileria || 0);
        const cantidad = parseInt(venta.cantidad || 0);
        return sum + (precio * cantidad);
      }, 0);

      console.log('\n--- RESUMEN ---');
      console.log(`Total cantidad vendida: ${totalCantidad}`);
      console.log(`Total ingresos: $${totalIngresos.toFixed(2)}`);
    } else {
      console.log('❌ No hay ventas de utilería registradas');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testUtileriaReports();
