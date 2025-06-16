require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('./models/Producto');
const Proveedor = require('./models/Proveedor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function poblarDB() {
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB');

  // Proveedores de ejemplo
  const proveedores = [
    { nombre: 'Editorial Sudamericana', contacto: 'sudamericana@editorial.com' },
    { nombre: 'Planeta Libros', contacto: 'contacto@planeta.com' },
    { nombre: 'Ediciones Santillana', contacto: 'info@santillana.com' },
    { nombre: 'Penguin Random House', contacto: 'ventas@penguinrandomhouse.com' },
    { nombre: 'Siglo XXI Editores', contacto: 'info@sigloxxieditores.com' }
  ];

  // Productos de ejemplo
  const productos = [
    { nombre: 'Cien años de soledad', autor: 'Gabriel García Márquez', precio: 3500 },
    { nombre: 'Rayuela', autor: 'Julio Cortázar', precio: 2800 },
    { nombre: 'El Aleph', autor: 'Jorge Luis Borges', precio: 3200 },
    { nombre: 'Sobre héroes y tumbas', autor: 'Ernesto Sabato', precio: 3000 },
    { nombre: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', precio: 4000 }
  ];

  await Proveedor.deleteMany({});
  await Producto.deleteMany({});
  await Proveedor.insertMany(proveedores);
  await Producto.insertMany(productos);

  console.log('Base de datos poblada con datos de ejemplo.');
  await mongoose.disconnect();
}

poblarDB().catch(err => {
  console.error('Error al poblar la base de datos:', err);
  process.exit(1);
});
