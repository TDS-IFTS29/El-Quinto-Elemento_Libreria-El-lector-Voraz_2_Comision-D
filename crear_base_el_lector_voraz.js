require('dotenv').config();
const mongoose = require('mongoose');
const Libro = require('./models/Libro');
const Proveedor = require('./models/Proveedor');
const Venta = require('./models/Venta');
const Usuario = require('./models/Usuario');
const Utileria = require('./models/Utileria');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function crearBaseDeDatos() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    // --- MIGRACIÓN: Asignar proveedor a libros existentes sin proveedor (antes de borrar nada) ---
    const proveedoresExistentes = await Proveedor.find({ tipo_proveedor: 'libreria' });
    if (proveedoresExistentes.length > 0) {
      const librosSinProveedor = await Libro.find({ $or: [ { proveedor: { $exists: false } }, { proveedor: null } ] });
      if (librosSinProveedor.length > 0) {
        for (const libro of librosSinProveedor) {
          const proveedorAleatorio = proveedoresExistentes[Math.floor(Math.random() * proveedoresExistentes.length)];
          libro.proveedor = proveedorAleatorio._id;
          await libro.save();
        }
        console.log(`Se asignaron proveedores a ${librosSinProveedor.length} libros que no tenían.`);
      }
    }

    // Limpiar colecciones
    await Proveedor.deleteMany({});
    await Libro.deleteMany({}); // <--- Ahora borra todos los libros existentes
    await Utileria.deleteMany({});
    await Venta.deleteMany({});
    await Usuario.deleteMany({});

    // Proveedores de ejemplo (editoriales, cafeterías, utilerías)
    const proveedores = [
      { nombre: 'Editorial Sudamericana', mail: 'sudamericana@editorial.com', tipo_proveedor: 'libreria', contacto: 'Contacto Sudamericana', telefono: '011-1234-5678', sitio_web: 'https://sudamericana.com' },
      { nombre: 'Planeta Libros', mail: 'contacto@planeta.com', tipo_proveedor: 'libreria', contacto: 'Contacto Planeta', telefono: '011-2345-6789', sitio_web: 'https://planetadelibros.com' },
      { nombre: 'Ediciones Santillana', mail: 'info@santillana.com', tipo_proveedor: 'libreria', contacto: 'Contacto Santillana', telefono: '011-3456-7890', sitio_web: 'https://santillana.com' },
      { nombre: 'Penguin Random House', mail: 'ventas@penguinrandomhouse.com', tipo_proveedor: 'libreria', contacto: 'Contacto Penguin', telefono: '011-4567-8901', sitio_web: 'https://penguinrandomhouse.com' },
      { nombre: 'Siglo XXI Editores', mail: 'info@sigloxxieditores.com', tipo_proveedor: 'libreria', contacto: 'Contacto Siglo XXI', telefono: '011-5678-9012', sitio_web: 'https://sigloxxieditores.com' },
      { nombre: 'Café Martínez', mail: 'contacto@cafemartinez.com', tipo_proveedor: 'cafeteria', contacto: 'Contacto Café Martínez', telefono: '011-6789-0123', sitio_web: 'https://cafemartinez.com' },
      { nombre: 'Bonafide', mail: 'info@bonafide.com', tipo_proveedor: 'cafeteria', contacto: 'Contacto Bonafide', telefono: '011-7890-1234', sitio_web: 'https://bonafide.com.ar' },
      { nombre: 'Utilería Express', mail: 'ventas@utileriaexpress.com', tipo_proveedor: 'utileria', contacto: 'Contacto Utilería Express', telefono: '011-8901-2345', sitio_web: 'https://utileriaexpress.com' },
      { nombre: 'Papelería Central', mail: 'info@papeleriacentral.com', tipo_proveedor: 'utileria', contacto: 'Contacto Papelería Central', telefono: '011-9012-3456', sitio_web: 'https://papeleriacentral.com' }
    ];
    const proveedoresInsertados = await Proveedor.insertMany(proveedores);

    // Filtrar solo proveedores de tipo libreria
    const proveedoresLibreria = proveedoresInsertados.filter(p => p.tipo_proveedor === 'libreria');

    // Libros de ejemplo
    function randomStock() { return Math.floor(Math.random() * 16); }
    function randomStockMinimo() { return Math.floor(Math.random() * 11); } // 0 a 10
    // 2 libros con stock 0 y sin venta hace más de 6 meses
    const hace6Meses = new Date(Date.now() - 185 * 24 * 60 * 60 * 1000); // ~6 meses atrás
    const libros = [
      { nombre: 'Cien años de soledad', autor: 'Gabriel García Márquez', precio: 3500, genero: 'Novela', stock: 0, stockMinimo: 3, ultimaReposicion: new Date(), ultimaVenta: hace6Meses },
      { nombre: 'Rayuela', autor: 'Julio Cortázar', precio: 28000, genero: 'Novela', stock: 0, stockMinimo: 2, ultimaReposicion: new Date(), ultimaVenta: hace6Meses },
      // 3 libros con stock menor al mínimo y ventas recientes
      { nombre: 'El Aleph', autor: 'Jorge Luis Borges', precio: 32000, genero: 'Cuento', stock: 1, stockMinimo: 4, ultimaReposicion: new Date(), ultimaVenta: new Date() },
      { nombre: 'Sobre héroes y tumbas', autor: 'Ernesto Sabato', precio: 30000, genero: 'Ensayo', stock: 2, stockMinimo: 5, ultimaReposicion: new Date(), ultimaVenta: new Date() },
      { nombre: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', precio: 40000, genero: 'Clásico', stock: 1, stockMinimo: 6, ultimaReposicion: new Date(), ultimaVenta: new Date() },
      // El resto aleatorios y ventas recientes
      { nombre: 'Antología poética', autor: 'Pablo Neruda', precio: 25000, genero: 'Poesía', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(), ultimaVenta: new Date() },
      { nombre: 'Romeo y Julieta', autor: 'William Shakespeare', precio: 27000, genero: 'Teatro', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(), ultimaVenta: new Date() },
      { nombre: 'Sapiens', autor: 'Yuval Noah Harari', precio: 38000, genero: 'No Ficción', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(), ultimaVenta: new Date() },
      { nombre: 'El Principito', autor: 'Antoine de Saint-Exupéry', precio: 21000, genero: 'Infantil', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), ultimaVenta: new Date() },
      { nombre: 'Harry Potter y la piedra filosofal', autor: 'J.K. Rowling', precio: 29000, genero: 'Juvenil', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(), ultimaVenta: new Date() },
      { nombre: 'Fahrenheit 451', autor: 'Ray Bradbury', precio: 26000, genero: 'Ciencia Ficción', stock: randomStock(), stockMinimo: randomStockMinimo(), ultimaReposicion: new Date(), ultimaVenta: new Date() }
    ];
    function randomUltimaVenta() {
      const dias = Math.floor(Math.random() * 400);
      return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
    }
    // Asignar proveedor aleatorio de tipo libreria a cada libro
    for (const libro of libros) {
      libro.ultimaVenta = randomUltimaVenta();
      const proveedorAleatorio = proveedoresLibreria[Math.floor(Math.random() * proveedoresLibreria.length)];
      libro.proveedor = proveedorAleatorio._id;
    }
    const librosInsertados = await Libro.insertMany(libros);

    // --- AGREGAR DATOS DE UTILERÍA ---
    const proveedoresUtileria = proveedoresInsertados.filter(p => p.tipo_proveedor === 'utileria');
    function randomStockUtileria() { return Math.floor(Math.random() * 21); }
    function randomStockMinimoUtileria() { return Math.floor(Math.random() * 11); }
    function randomUltimaVentaUtileria() {
      const dias = Math.floor(Math.random() * 400);
      return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
    }
    const utileria = [
      { nombre: 'Lápiz HB', descripcion: 'Lápiz negro clásico para escritura y dibujo.', precio: 200, stock: 0, stockMinimo: 3, ultimaReposicion: new Date(), ultimaVenta: hace6Meses, proveedor: proveedoresUtileria[0]._id },
      { nombre: 'Goma de borrar', descripcion: 'Goma blanca para borrar lápiz.', precio: 150, stock: 0, stockMinimo: 2, ultimaReposicion: new Date(), ultimaVenta: hace6Meses, proveedor: proveedoresUtileria[1]._id },
      { nombre: 'Cuaderno A4', descripcion: 'Cuaderno rayado de 80 hojas.', precio: 1200, stock: 1, stockMinimo: 4, ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresUtileria[0]._id },
      { nombre: 'Resaltador amarillo', descripcion: 'Resaltador color amarillo flúo.', precio: 350, stock: 2, stockMinimo: 5, ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresUtileria[1]._id },
      { nombre: 'Bolígrafo azul', descripcion: 'Bolígrafo tinta azul, trazo fino.', precio: 250, stock: 1, stockMinimo: 6, ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresUtileria[0]._id },
      { nombre: 'Regla 30cm', descripcion: 'Regla plástica transparente.', precio: 400, stock: randomStockUtileria(), stockMinimo: randomStockMinimoUtileria(), ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresUtileria[1]._id },
      { nombre: 'Tijera escolar', descripcion: 'Tijera punta redonda para niños.', precio: 800, stock: randomStockUtileria(), stockMinimo: randomStockMinimoUtileria(), ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresUtileria[0]._id },
      { nombre: 'Pegamento en barra', descripcion: 'Adhesivo sólido no tóxico.', precio: 600, stock: randomStockUtileria(), stockMinimo: randomStockMinimoUtileria(), ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresUtileria[1]._id },
      { nombre: 'Cartuchera', descripcion: 'Cartuchera de tela con cierre.', precio: 2500, stock: randomStockUtileria(), stockMinimo: randomStockMinimoUtileria(), ultimaReposicion: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), ultimaVenta: new Date(), proveedor: proveedoresUtileria[0]._id },
      { nombre: 'Compás metálico', descripcion: 'Compás para dibujo técnico.', precio: 1800, stock: randomStockUtileria(), stockMinimo: randomStockMinimoUtileria(), ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresUtileria[1]._id }
    ];
    for (const item of utileria) {
      item.ultimaVenta = randomUltimaVentaUtileria();
    }
    const utileriaInsertada = await Utileria.insertMany(utileria);

    // Usuarios iniciales del sistema
    // 1 Administrador (Juan Pérez) + 3 Empleados (Antonio Gill, Cristian Descosido, Damian Clausi)
    // + 1 Admin adicional para compatibilidad con el sistema existente
    // TODAS LAS CONTRASEÑAS SON: 1234 (se cifran automáticamente)
    const usuarios = [
      {
        nombre: 'Juan Pérez',
        email: 'juan.perez@lectorvoraz.com',
        password: '1234',
        rol: 'admin',
        telefono: '11-2345-6789',
        activo: true
      },
      {
        nombre: 'Antonio Gill',
        email: 'antonio.gill@lectorvoraz.com',
        password: '1234',
        rol: 'empleado',
        telefono: '11-3456-7890',
        activo: true
      },
      {
        nombre: 'Cristian Descosido',
        email: 'cristian.descosido@lectorvoraz.com',
        password: '1234',
        rol: 'empleado',
        telefono: '11-4567-8901',
        activo: true
      },
      {
        nombre: 'Damian Clausi',
        email: 'damian.clausi@lectorvoraz.com',
        password: '1234',
        rol: 'empleado',
        telefono: '11-5678-9012',
        activo: true
      },
      // Usuario admin original para compatibilidad
      {
        nombre: 'admin',
        email: 'admin',
        password: '1234',
        rol: 'admin',
        activo: true
      }
    ];

    // Crear usuarios uno por uno para que se active el middleware de cifrado
    const usuariosInsertados = [];
    for (const usuarioData of usuarios) {
      const usuario = new Usuario(usuarioData);
      await usuario.save(); // Esto activa el middleware pre('save') para cifrar la contraseña
      usuariosInsertados.push(usuario);
    }
    
    console.log(`Usuarios creados: ${usuariosInsertados.length}`);
    usuariosInsertados.forEach(usuario => {
      console.log(`   - ${usuario.nombre} (${usuario.email}) - Rol: ${usuario.rol}`);
    });

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

    // Ventas de utilería del día de hoy (2 items)
    const ventasUtileria = [
      { 
        utileria: utileriaInsertada[5]._id, // Regla 30cm
        nombreUtileria: utileriaInsertada[5].nombre,
        precioUtileria: utileriaInsertada[5].precio,
        cantidad: 2,
        fecha: new Date(hoy)
      },
      { 
        utileria: utileriaInsertada[6]._id, // Tijera escolar
        nombreUtileria: utileriaInsertada[6].nombre,
        precioUtileria: utileriaInsertada[6].precio,
        cantidad: 1,
        fecha: new Date(hoy)
      }
    ];

    // Ventas de utilería de otros meses (6 adicionales)
    const ventasUtileriaOtrosMeses = [
      {
        utileria: utileriaInsertada[0]._id, // Lápiz HB
        nombreUtileria: utileriaInsertada[0].nombre,
        precioUtileria: utileriaInsertada[0].precio,
        cantidad: 5,
        fecha: new Date(2025, 4, 15, 14, 30) // 15 de mayo 2025
      },
      {
        utileria: utileriaInsertada[1]._id, // Goma de borrar
        nombreUtileria: utileriaInsertada[1].nombre,
        precioUtileria: utileriaInsertada[1].precio,
        cantidad: 3,
        fecha: new Date(2025, 4, 22, 10, 15) // 22 de mayo 2025
      },
      {
        utileria: utileriaInsertada[2]._id, // Cuaderno A4
        nombreUtileria: utileriaInsertada[2].nombre,
        precioUtileria: utileriaInsertada[2].precio,
        cantidad: 2,
        fecha: new Date(2025, 3, 18, 16, 45) // 18 de abril 2025
      },
      {
        utileria: utileriaInsertada[3]._id, // Marcador negro
        nombreUtileria: utileriaInsertada[3].nombre,
        precioUtileria: utileriaInsertada[3].precio,
        cantidad: 4,
        fecha: new Date(2025, 3, 25, 11, 20) // 25 de abril 2025
      },
      {
        utileria: utileriaInsertada[4]._id, // Pegamento en barra
        nombreUtileria: utileriaInsertada[4].nombre,
        precioUtileria: utileriaInsertada[4].precio,
        cantidad: 1,
        fecha: new Date(2025, 2, 12, 13, 0) // 12 de marzo 2025
      },
      {
        utileria: utileriaInsertada[7]._id, // Resaltador amarillo
        nombreUtileria: utileriaInsertada[7].nombre,
        precioUtileria: utileriaInsertada[7].precio,
        cantidad: 3,
        fecha: new Date(2025, 2, 28, 15, 30) // 28 de marzo 2025
      }
    ];

    // Insertar ventas de utilería del día de hoy
    for (const ventaUtileria of ventasUtileria) {
      await new Venta(ventaUtileria).save();
    }

    // Insertar ventas de utilería de otros meses
    for (const ventaUtileria of ventasUtileriaOtrosMeses) {
      await new Venta(ventaUtileria).save();
    }

    // Actualizar la ultimaVenta de los items de utilería vendidos hoy
    await Utileria.findByIdAndUpdate(utileriaInsertada[5]._id, { ultimaVenta: new Date(hoy) });
    await Utileria.findByIdAndUpdate(utileriaInsertada[6]._id, { ultimaVenta: new Date(hoy) });

    // Actualizar la ultimaVenta de los items vendidos en otros meses
    await Utileria.findByIdAndUpdate(utileriaInsertada[0]._id, { ultimaVenta: new Date(2025, 4, 22) });
    await Utileria.findByIdAndUpdate(utileriaInsertada[1]._id, { ultimaVenta: new Date(2025, 4, 22) });
    await Utileria.findByIdAndUpdate(utileriaInsertada[2]._id, { ultimaVenta: new Date(2025, 3, 18) });
    await Utileria.findByIdAndUpdate(utileriaInsertada[3]._id, { ultimaVenta: new Date(2025, 3, 25) });
    await Utileria.findByIdAndUpdate(utileriaInsertada[4]._id, { ultimaVenta: new Date(2025, 2, 12) });
    await Utileria.findByIdAndUpdate(utileriaInsertada[7]._id, { ultimaVenta: new Date(2025, 2, 28) });
    await Utileria.findByIdAndUpdate(utileriaInsertada[6]._id, { ultimaVenta: new Date(hoy) });

    console.log('Base de datos el-lector-voraz creada exitosamente con:');
    console.log(`   Libros: ${librosInsertados.length}`);
    console.log(`   Utilería: ${utileriaInsertada.length}`);
    console.log(`   Proveedores: ${proveedoresInsertados.length}`);
    console.log(`   Usuarios: ${usuariosInsertados.length}`);
    console.log(`   Ventas de libros: ${ventas.length}`);
    console.log(`   Ventas de utilería: ${ventasUtileria.length + ventasUtileriaOtrosMeses.length} (${ventasUtileria.length} del día de hoy, ${ventasUtileriaOtrosMeses.length} de otros meses)`);
    console.log('');
    console.log('Usuarios creados (TODAS LAS CONTRASEÑAS: 1234):');
    console.log('   Admin: Juan Perez (juan.perez@lectorvoraz.com)');
    console.log('   Empleado: Antonio Gill (antonio.gill@lectorvoraz.com)');
    console.log('   Empleado: Cristian Descosido (cristian.descosido@lectorvoraz.com)');
    console.log('   Empleado: Damian Clausi (damian.clausi@lectorvoraz.com)');
    console.log('   Admin: admin (admin) - (compatibilidad)');
    console.log('   Todas las contraseñas están cifradas en la base de datos');
    console.log('');
    console.log('Puedes acceder al sistema en: http://localhost:3000');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error al crear la base de datos:', err);
    process.exit(1);
  }
}

crearBaseDeDatos();
