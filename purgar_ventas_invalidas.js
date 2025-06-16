// Script para eliminar ventas con producto inválido (no ObjectId o producto inexistente)
require('dotenv').config();
const mongoose = require('mongoose');
const Venta = require('./models/Venta');
const Producto = require('./models/Producto');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function limpiarVentasInvalidas() {
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB');

  // Elimina ventas cuyo campo producto no es un ObjectId válido
  const ventasNoObjectId = await Venta.deleteMany({
    $or: [
      { producto: { $exists: false } },
      { producto: { $type: 'string' } },
      { producto: { $not: { $type: 'objectId' } } }
    ]
  });
  console.log(`Ventas eliminadas por producto no ObjectId: ${ventasNoObjectId.deletedCount}`);

  // Elimina ventas cuyo producto no existe en la colección de productos
  const ventas = await Venta.find();
  let eliminadas = 0;
  for (const venta of ventas) {
    const existe = await Producto.exists({ _id: venta.producto });
    if (!existe) {
      await Venta.deleteOne({ _id: venta._id });
      eliminadas++;
    }
  }
  console.log(`Ventas eliminadas por producto inexistente: ${eliminadas}`);

  await mongoose.disconnect();
  console.log('Limpieza finalizada.');
}

limpiarVentasInvalidas().catch(err => {
  console.error('Error al limpiar ventas inválidas:', err);
  process.exit(1);
});
