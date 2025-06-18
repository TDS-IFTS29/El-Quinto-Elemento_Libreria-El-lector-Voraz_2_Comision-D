require('dotenv').config();
const mongoose = require('mongoose');
const Libro = require('./models/Libro');
const Proveedor = require('./models/Proveedor');
const Venta = require('./models/Venta');
const Usuario = require('./models/Usuario');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function crearBaseDeDatos() {
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB');

  // Mostrar cantidad de ventas antes de borrar
  const ventasAntes = await Venta.countDocuments();
  console.log('Ventas antes de borrar:', ventasAntes);

  // Proveedores de ejemplo
  const proveedores = [
    { nombre: 'Editorial Sudamericana', contacto: 'sudamericana@editorial.com' },
    { nombre: 'Planeta Libros', contacto: 'contacto@planeta.com' },
    { nombre: 'Ediciones Santillana', contacto: 'info@santillana.com' },
    { nombre: 'Penguin Random House', contacto: 'ventas@penguinrandomhouse.com' },
    { nombre: 'Siglo XXI Editores', contacto: 'info@sigloxxieditores.com' }
  ];

  // Libros de ejemplo con stock y última reposición (stock aleatorio entre 0 y 15)
  function randomStock() {
    return Math.floor(Math.random() * 16); // 0 a 15
  }
  const libros = [
    { nombre: 'Cien años de soledad', autor: 'Gabriel García Márquez', precio: 3500, genero: 'Novela', stock: randomStock(), ultimaReposicion: new Date() },
    { nombre: 'Rayuela', autor: 'Julio Cortázar', precio: 2800, genero: 'Novela', stock: randomStock(), ultimaReposicion: new Date() },
    { nombre: 'El Aleph', autor: 'Jorge Luis Borges', precio: 3200, genero: 'Cuento', stock: randomStock(), ultimaReposicion: new Date() },
    { nombre: 'Sobre héroes y tumbas', autor: 'Ernesto Sabato', precio: 3000, genero: 'Ensayo', stock: randomStock(), ultimaReposicion: new Date() },
    { nombre: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', precio: 4000, genero: 'Clásico', stock: randomStock(), ultimaReposicion: new Date() },
    { nombre: 'Antología poética', autor: 'Pablo Neruda', precio: 2500, genero: 'Poesía', stock: randomStock(), ultimaReposicion: new Date() },
    { nombre: 'Romeo y Julieta', autor: 'William Shakespeare', precio: 2700, genero: 'Teatro', stock: randomStock(), ultimaReposicion: new Date() },
    { nombre: 'Sapiens', autor: 'Yuval Noah Harari', precio: 3800, genero: 'No Ficción', stock: randomStock(), ultimaReposicion: new Date() },
    { nombre: 'El Principito', autor: 'Antoine de Saint-Exupéry', precio: 2100, genero: 'Infantil', stock: randomStock(), ultimaReposicion: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000) }, // hace más de 6 meses
    { nombre: 'Harry Potter y la piedra filosofal', autor: 'J.K. Rowling', precio: 2900, genero: 'Juvenil', stock: randomStock(), ultimaReposicion: new Date() },
    { nombre: 'Fahrenheit 451', autor: 'Ray Bradbury', precio: 2600, genero: 'Ciencia Ficción', stock: randomStock(), ultimaReposicion: new Date() } // Puede ser 0
  ];

  // Asignar fechas de última venta inventadas (al azar en los últimos 400 días)
  function randomUltimaVenta() {
    const dias = Math.floor(Math.random() * 400); // hasta 400 días atrás
    return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  }
  for (const libro of libros) {
    libro.ultimaVenta = randomUltimaVenta();
  }

  await Proveedor.deleteMany({});
  await Libro.deleteMany({});
  await Venta.deleteMany({});
  await Usuario.deleteMany({});

  // Mostrar cantidad de ventas después de borrar
  const ventasDespues = await Venta.countDocuments();
  console.log('Ventas después de borrar:', ventasDespues);

  const proveedoresInsertados = await Proveedor.insertMany(proveedores);
  const librosInsertados = await Libro.insertMany(libros);
  await Usuario.create({ nombre: 'admin', email: 'admin', password: '1234' });

  // Crear libro ficticio para ventas inventadas
  const libroFicticio = await Libro.create({ nombre: 'Libro Inventado', autor: 'Autor Ficticio', precio: 1000, genero: 'Ficción' });

  // Ventas de ejemplo (10 ventas alternando libros y 3 ventas ficticias)
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
    { libro: librosInsertados[0]._id, nombreLibro: librosInsertados[0].nombre, autorLibro: librosInsertados[0].autor, cantidad: 3 },
    // Ventas ficticias (libros eliminados)
    { libro: libroFicticio._id, nombreLibro: 'Libro Inventado #1', autorLibro: 'Autor Ficticio #1', cantidad: 2 },
    { libro: libroFicticio._id, nombreLibro: 'Libro Inventado #2', autorLibro: 'Autor Ficticio #2', cantidad: 1 },
    { libro: libroFicticio._id, nombreLibro: 'Libro Inventado #3', autorLibro: 'Autor Ficticio #3', cantidad: 4 }
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
