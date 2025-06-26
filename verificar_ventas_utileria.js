// Script para verificar las ventas de utilería creadas en diferentes meses
const mongoose = require('mongoose');
const Venta = require('./models/Venta');

async function verificarVentasUtileria() {
  try {
    await mongoose.connect('mongodb://localhost:27017/el-lector-voraz');
    console.log('✓ Conectado a MongoDB\n');

    // Obtener todas las ventas de utilería
    const ventas = await Venta.find({ 
      $or: [
        { utileria: { $exists: true, $ne: null } },
        { nombreUtileria: { $exists: true, $ne: null } }
      ]
    }).populate('utileria').sort({ fecha: 1 });

    console.log(`📊 VENTAS DE UTILERÍA ENCONTRADAS: ${ventas.length}\n`);
    console.log('━'.repeat(80));

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    ventas.forEach((venta, index) => {
      const fecha = new Date(venta.fecha);
      const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
      const nombre = venta.nombreUtileria || (venta.utileria ? venta.utileria.nombre : 'Sin nombre');
      const precio = venta.precioUtileria || (venta.utileria ? venta.utileria.precio : 0);
      const total = precio * venta.cantidad;

      console.log(`${(index + 1).toString().padStart(2, ' ')}. ${fechaStr} | ${nombre.padEnd(20)} | Cant: ${venta.cantidad.toString().padStart(2)} | $${precio.toString().padStart(6)} | Total: $${total.toString().padStart(8)}`);
    });

    console.log('━'.repeat(80));

    // Agrupar por mes
    const ventasPorMes = {};
    let totalGeneral = 0;

    ventas.forEach(venta => {
      const fecha = new Date(venta.fecha);
      const mesAno = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
      const precio = venta.precioUtileria || (venta.utileria ? venta.utileria.precio : 0);
      const total = precio * venta.cantidad;
      
      if (!ventasPorMes[mesAno]) {
        ventasPorMes[mesAno] = { cantidad: 0, total: 0 };
      }
      
      ventasPorMes[mesAno].cantidad += venta.cantidad;
      ventasPorMes[mesAno].total += total;
      totalGeneral += total;
    });

    console.log('\n📈 RESUMEN POR MES:');
    console.log('━'.repeat(50));
    
    Object.entries(ventasPorMes).forEach(([mes, datos]) => {
      console.log(`${mes.padEnd(15)} | Cantidad: ${datos.cantidad.toString().padStart(3)} | Total: $${datos.total.toFixed(2).padStart(10)}`);
    });
    
    console.log('━'.repeat(50));
    console.log(`${'TOTAL GENERAL'.padEnd(15)} | Cantidad: ${ventas.reduce((sum, v) => sum + v.cantidad, 0).toString().padStart(3)} | Total: $${totalGeneral.toFixed(2).padStart(10)}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verificarVentasUtileria();
