require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('./models/Producto');
const Proveedor = require('./models/Proveedor');
const Venta = require('./models/Venta');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function crearBaseDeDatos() {
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
  await Venta.deleteMany({});
  const proveedoresInsertados = await Proveedor.insertMany(proveedores);
  const productosInsertados = await Producto.insertMany(productos);

  // Ventas de ejemplo (10 ventas alternando productos)
  const ventas = [
    { producto: productosInsertados[0]._id, cantidad: 2 },
    { producto: productosInsertados[1]._id, cantidad: 1 },
    { producto: productosInsertados[2]._id, cantidad: 3 },
    { producto: productosInsertados[0]._id, cantidad: 1 },
    { producto: productosInsertados[1]._id, cantidad: 4 },
    { producto: productosInsertados[2]._id, cantidad: 2 },
    { producto: productosInsertados[0]._id, cantidad: 5 },
    { producto: productosInsertados[1]._id, cantidad: 2 },
    { producto: productosInsertados[2]._id, cantidad: 1 },
    { producto: productosInsertados[0]._id, cantidad: 3 }
  ];
  for (const v of ventas) {
    await new Venta({ ...v, fecha: new Date() }).save();
  }

  console.log('Base de datos el-lector-voraz creada con datos de ejemplo (incluye 10 ventas).');
  await mongoose.disconnect();
}

crearBaseDeDatos().catch(err => {
  console.error('Error al crear la base de datos:', err);
  process.exit(1);
});
