// Script para borrar la colección de proveedores de libros
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function borrarColeccionProveedorLibros() {
  await mongoose.connect(MONGO_URI);
  await mongoose.connection.db.dropCollection('proveedorlibros').catch(() => {});
  console.log('Colección "proveedorlibros" eliminada.');
  await mongoose.disconnect();
}

borrarColeccionProveedorLibros();
