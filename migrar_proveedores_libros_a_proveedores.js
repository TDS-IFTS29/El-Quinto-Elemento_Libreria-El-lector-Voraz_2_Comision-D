// Script para migrar proveedores de libros de vuelta a proveedores
const mongoose = require('mongoose');
const Proveedor = require('./models/Proveedor');
const ProveedorLibro = require('./models/ProveedorLibro');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function migrarProveedoresLibros() {
  await mongoose.connect(MONGO_URI);
  const proveedoresLibros = await ProveedorLibro.find();
  for (const p of proveedoresLibros) {
    // Evitar duplicados por nombre y contacto
    const existe = await Proveedor.findOne({ nombre: p.nombre, contacto: p.contacto });
    if (!existe) {
      await Proveedor.create({ nombre: p.nombre, contacto: p.contacto });
    }
  }
  console.log('Migración de proveedores de libros a proveedores completada.');
  await mongoose.disconnect();
}

migrarProveedoresLibros();
