require('dotenv').config();
const mongoose = require('mongoose');
const Libro = require('./models/Libro');
const Proveedor = require('./models/Proveedor');
const Venta = require('./models/Venta');
const Usuario = require('./models/Usuario');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function crearBaseDeDatos() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    // Limpiar colecciones
    await Proveedor.deleteMany({});
    await Libro.deleteMany({});
    await Venta.deleteMany({});
    await Usuario.deleteMany({});

    // Proveedores de ejemplo (editoriales, cafeterías, utilerías)
    const proveedores = [
      { nombre: 'Editorial Sudamericana', mail: 'sudamericana@editorial.com', tipo_proveedor: 'libreria', contacto: 'Contacto Sudamericana' },
      { nombre: 'Planeta Libros', mail: 'contacto@planeta.com', tipo_proveedor: 'libreria', contacto: 'Contacto Planeta' },
      { nombre: 'Ediciones Santillana', mail: 'info@santillana.com', tipo_proveedor: 'libreria', contacto: 'Contacto Santillana' },
      { nombre: 'Penguin Random House', mail: 'ventas@penguinrandomhouse.com', tipo_proveedor: 'libreria', contacto: 'Contacto Penguin' },
      { nombre: 'Siglo XXI Editores', mail: 'info@sigloxxieditores.com', tipo_proveedor: 'libreria', contacto: 'Contacto Siglo XXI' },
      { nombre: 'Café Martínez', mail: 'contacto@cafemartinez.com', tipo_proveedor: 'cafeteria', contacto: 'Contacto Café Martínez' },
      { nombre: 'Bonafide', mail: 'info@bonafide.com', tipo_proveedor: 'cafeteria', contacto: 'Contacto Bonafide' },
      { nombre: 'Utilería Express', mail: 'ventas@utileriaexpress.com', tipo_proveedor: 'utileria', contacto: 'Contacto Utilería Express' },
      { nombre: 'Papelería Central', mail: 'info@papeleriacentral.com', tipo_proveedor: 'utileria', contacto: 'Contacto Papelería Central' }
    ];
    const proveedoresInsertados = await Proveedor.insertMany(proveedores);

    // Libros de ejemplo
    function randomStock() { return Math.floor(Math.random() * 16); }
    function randomStockMinimo() { return Math.floor(Math.random() * 11); } // 0 a 10
    const libros = [
      { nombre: 'Cien años de soledad', autor: 'Gabriel García Márquez', precio: 3500, genero: 'Novela', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date() },
      { nombre: 'Rayuela', autor: 'Julio Cortázar', precio: 2800, genero: 'Novela', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date() },
      { nombre: 'El Aleph', autor: 'Jorge Luis Borges', precio: 3200, genero: 'Cuento', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date() },
      { nombre: 'Sobre héroes y tumbas', autor: 'Ernesto Sabato', precio: 3000, genero: 'Ensayo', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date() },
      { nombre: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', precio: 4000, genero: 'Clásico', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date() },
      { nombre: 'Antología poética', autor: 'Pablo Neruda', precio: 2500, genero: 'Poesía', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date() },
      { nombre: 'Romeo y Julieta', autor: 'William Shakespeare', precio: 2700, genero: 'Teatro', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date() },
      { nombre: 'Sapiens', autor: 'Yuval Noah Harari', precio: 3800, genero: 'No Ficción', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date() },
      { nombre: 'El Principito', autor: 'Antoine de Saint-Exupéry', precio: 2100, genero: 'Infantil', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000) },
      { nombre: 'Harry Potter y la piedra filosofal', autor: 'J.K. Rowling', precio: 2900, genero: 'Juvenil', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date() },
      { nombre: 'Fahrenheit 451', autor: 'Ray Bradbury', precio: 2600, genero: 'Ciencia Ficción', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date() }
    ];
    function randomUltimaVenta() {
      const dias = Math.floor(Math.random() * 400);
      return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
    }
    for (const libro of libros) {
      libro.ultimaVenta = randomUltimaVenta();
    }
    const librosInsertados = await Libro.insertMany(libros);

    // Usuario admin necesario
    await Usuario.create({ nombre: 'admin', email: 'admin', password: '1234' });

    // Ventas de ejemplo (solo con libros válidos)
    const ventas = [
      { libro: librosInsertados[0]._id, nombreLibro: librosInsertados[0].nombre, autorLibro: librosInsertados[0].autor, cantidad: 2 },
      { libro: librosInsertados[1]._id, nombreLibro: librosInsertados[1].nombre, autorLibro: librosInsertados[1].autor, cantidad: 1 },
      { libro: librosInsertados[2]._id, nombreLibro: librosInsertados[2].nombre, autorLibro: librosInsertados[2].autor, cantidad: 3 },
      { libro: librosInsertados[0]._id, nombreLibro: librosInsertados[0].nombre, autorLibro: librosInsertados[0].autor, cantidad: 1 },
      { libro: librosInsertados[1]._id, nombreLibro: librosInsertados[1].nombre, autorLibro: librosInsertados[1].autor, cantidad: 4 },
      { libro: librosInsertados[2]._id, nombreLibro: librosInsertados[2].nombre, autorLibro: librosInsertados[2].autor, cantidad: 2 },
      { libro: librosInsertados[0]._id, nombreLibro: librosInsertados[0].nombre, autorLibro: librosInsertados[0].autor, cantidad: 5 },
      { libro: librosInsertados[1]._id, nombreLibro: librosInsertados[1].nombre, autorLibro: librosInsertados[1].autor, cantidad: 2 },
      { libro: librosInsertados[2]._id, nombreLibro: librosInsertados[2].nombre, autorLibro: librosInsertados[2].autor, cantidad: 1 },
      { libro: librosInsertados[0]._id, nombreLibro: librosInsertados[0].nombre, autorLibro: librosInsertados[0].autor, cantidad: 3 }
    ];
    for (const v of ventas) {
      await new Venta({ ...v, fecha: new Date() }).save();
    }

    console.log('Base de datos el-lector-voraz creada con ejemplos variados.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error al crear la base de datos:', err);
    process.exit(1);
  }
}

crearBaseDeDatos();
