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
    // 2 libros con stock 0 y sin venta hace más de 6 meses
    const hace6Meses = new Date(Date.now() - 185 * 24 * 60 * 60 * 1000); // ~6 meses atrás
    const libros = [
      { nombre: 'Cien años de soledad', autor: 'Gabriel García Márquez', precio: 3500, genero: 'Novela', stock: 0, stockMinimo: 3, ultimaReposicion: new Date(), ultimaVenta: hace6Meses },
      { nombre: 'Rayuela', autor: 'Julio Cortázar', precio: 2800, genero: 'Novela', stock: 0, stockMinimo: 2, ultimaReposicion: new Date(), ultimaVenta: hace6Meses },
      // 3 libros con stock menor al mínimo y ventas recientes
      { nombre: 'El Aleph', autor: 'Jorge Luis Borges', precio: 3200, genero: 'Cuento', stock: 1, stockMinimo: 4, ultimaReposicion: new Date(), ultimaVenta: new Date() },
      { nombre: 'Sobre héroes y tumbas', autor: 'Ernesto Sabato', precio: 3000, genero: 'Ensayo', stock: 2, stockMinimo: 5, ultimaReposicion: new Date(), ultimaVenta: new Date() },
      { nombre: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', precio: 4000, genero: 'Clásico', stock: 1, stockMinimo: 6, ultimaReposicion: new Date(), ultimaVenta: new Date() },
      // El resto aleatorios y ventas recientes
      { nombre: 'Antología poética', autor: 'Pablo Neruda', precio: 2500, genero: 'Poesía', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(), ultimaVenta: new Date() },
      { nombre: 'Romeo y Julieta', autor: 'William Shakespeare', precio: 2700, genero: 'Teatro', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(), ultimaVenta: new Date() },
      { nombre: 'Sapiens', autor: 'Yuval Noah Harari', precio: 3800, genero: 'No Ficción', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(), ultimaVenta: new Date() },
      { nombre: 'El Principito', autor: 'Antoine de Saint-Exupéry', precio: 2100, genero: 'Infantil', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), ultimaVenta: new Date() },
      { nombre: 'Harry Potter y la piedra filosofal', autor: 'J.K. Rowling', precio: 2900, genero: 'Juvenil', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(), ultimaVenta: new Date() },
      { nombre: 'Fahrenheit 451', autor: 'Ray Bradbury', precio: 2600, genero: 'Ciencia Ficción', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(), ultimaVenta: new Date() }
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
    // Solo crear ventas para los libros a partir del índice 2 (los demás tendrán ventas recientes)
    const ventas = [
      { libro: librosInsertados[2]._id, nombreLibro: librosInsertados[2].nombre, autorLibro: librosInsertados[2].autor, generoLibro: librosInsertados[2].genero, precioLibro: librosInsertados[2].precio, cantidad: 3 },
      { libro: librosInsertados[3]._id, nombreLibro: librosInsertados[3].nombre, autorLibro: librosInsertados[3].autor, generoLibro: librosInsertados[3].genero, precioLibro: librosInsertados[3].precio, cantidad: 2 },
      { libro: librosInsertados[4]._id, nombreLibro: librosInsertados[4].nombre, autorLibro: librosInsertados[4].autor, generoLibro: librosInsertados[4].genero, precioLibro: librosInsertados[4].precio, cantidad: 1 },
      { libro: librosInsertados[5]._id, nombreLibro: librosInsertados[5].nombre, autorLibro: librosInsertados[5].autor, generoLibro: librosInsertados[5].genero, precioLibro: librosInsertados[5].precio, cantidad: 4 },
      { libro: librosInsertados[6]._id, nombreLibro: librosInsertados[6].nombre, autorLibro: librosInsertados[6].autor, generoLibro: librosInsertados[6].genero, precioLibro: librosInsertados[6].precio, cantidad: 2 },
      { libro: librosInsertados[7]._id, nombreLibro: librosInsertados[7].nombre, autorLibro: librosInsertados[7].autor, generoLibro: librosInsertados[7].genero, precioLibro: librosInsertados[7].precio, cantidad: 1 },
      { libro: librosInsertados[8]._id, nombreLibro: librosInsertados[8].nombre, autorLibro: librosInsertados[8].autor, generoLibro: librosInsertados[8].genero, precioLibro: librosInsertados[8].precio, cantidad: 3 },
      { libro: librosInsertados[9]._id, nombreLibro: librosInsertados[9].nombre, autorLibro: librosInsertados[9].autor, generoLibro: librosInsertados[9].genero, precioLibro: librosInsertados[9].precio, cantidad: 2 },
      { libro: librosInsertados[10]._id, nombreLibro: librosInsertados[10].nombre, autorLibro: librosInsertados[10].autor, generoLibro: librosInsertados[10].genero, precioLibro: librosInsertados[10].precio, cantidad: 1 }
    ];
    const hoy = new Date();
    hoy.setHours(10, 0, 0, 0); // hora fija para las ventas de hoy
    for (let i = 0; i < ventas.length; i++) {
      let fechaVenta;
      if (i < 3) {
        fechaVenta = new Date(hoy); // ventas del día
      } else {
        fechaVenta = new Date(hoy);
        fechaVenta.setDate(hoy.getDate() - (i + 1)); // ventas de días anteriores
      }
      await new Venta({ ...ventas[i], fecha: fechaVenta }).save();
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
