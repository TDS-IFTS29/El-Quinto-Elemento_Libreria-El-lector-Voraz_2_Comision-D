require('dotenv').config();
const mongoose = require('mongoose');
const Libro = require('./models/Libro');
const Proveedor = require('./models/Proveedor');
const Venta = require('./models/Venta');
const Usuario = require('./models/Usuario');
const Utileria = require('./models/Utileria');
const Cafeteria = require('./models/Cafeteria');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

// Funciones de validación para prevenir datos inconsistentes
function validarVentaLibro(venta, libro) {
  if (!venta || !libro) {
    throw new Error('Venta o libro no definidos');
  }
  
  if (!libro.nombre || libro.nombre === 'undefined' || libro.nombre === null) {
    throw new Error(`Libro sin nombre válido: ${libro._id}`);
  }
  
  if (!libro.autor || libro.autor === 'undefined' || libro.autor === null) {
    throw new Error(`Libro sin autor válido: ${libro.nombre}`);
  }
  
  if (!libro.precio || typeof libro.precio !== 'number' || isNaN(libro.precio) || libro.precio <= 0) {
    throw new Error(`Libro sin precio válido: ${libro.nombre}`);
  }
  
  if (!venta.cantidad || typeof venta.cantidad !== 'number' || isNaN(venta.cantidad) || venta.cantidad <= 0) {
    throw new Error(`Cantidad inválida para venta de: ${libro.nombre}`);
  }
  
  return true;
}

function validarVentaUtileria(venta, utileria) {
  if (!venta || !utileria) {
    throw new Error('Venta o utilería no definidos');
  }
  
  if (!utileria.nombre || utileria.nombre === 'undefined' || utileria.nombre === null) {
    throw new Error(`Utilería sin nombre válido: ${utileria._id}`);
  }
  
  if (!utileria.precio || typeof utileria.precio !== 'number' || isNaN(utileria.precio) || utileria.precio <= 0) {
    throw new Error(`Utilería sin precio válido: ${utileria.nombre}`);
  }
  
  return true;
}

function validarVentaCafeteria(venta, cafeteria) {
  if (!venta || !cafeteria) {
    throw new Error('Venta o cafetería no definidos');
  }
  
  if (!cafeteria.nombre || cafeteria.nombre === 'undefined' || cafeteria.nombre === null) {
    throw new Error(`Cafetería sin nombre válido: ${cafeteria._id}`);
  }
  
  if (!cafeteria.precio || typeof cafeteria.precio !== 'number' || isNaN(cafeteria.precio) || cafeteria.precio <= 0) {
    throw new Error(`Cafetería sin precio válido: ${cafeteria.nombre}`);
  }
  
  return true;
}

function crearVentaSegura(datos) {
  // Validar que todos los campos requeridos estén presentes y sean válidos
  const camposRequeridos = ['tipo', 'cantidad', 'precioUnitario', 'total', 'vendedor'];
  
  for (const campo of camposRequeridos) {
    if (!datos[campo] && datos[campo] !== 0) {
      throw new Error(`Campo requerido faltante: ${campo}`);
    }
    
    // Verificar que no sea undefined, null o "undefined"
    if (datos[campo] === undefined || datos[campo] === null || datos[campo] === 'undefined') {
      throw new Error(`Campo ${campo} tiene valor undefined/null`);
    }
  }
  
  // Validar tipos específicos
  if (typeof datos.cantidad !== 'number' || isNaN(datos.cantidad) || datos.cantidad <= 0) {
    throw new Error('Cantidad debe ser un número positivo');
  }
  
  if (typeof datos.precioUnitario !== 'number' || isNaN(datos.precioUnitario) || datos.precioUnitario <= 0) {
    throw new Error('Precio unitario debe ser un número positivo');
  }
  
  if (typeof datos.total !== 'number' || isNaN(datos.total) || datos.total <= 0) {
    throw new Error('Total debe ser un número positivo');
  }
  
  // Validar coherencia matemática
  const totalCalculado = datos.precioUnitario * datos.cantidad;
  if (Math.abs(datos.total - totalCalculado) > 0.01) {
    throw new Error(`Total incoherente: esperado ${totalCalculado}, recibido ${datos.total}`);
  }
  
  // Validar campos específicos por tipo
  if (datos.tipo === 'libro') {
    if (!datos.nombreLibro || datos.nombreLibro === 'undefined' || datos.nombreLibro === undefined) {
      throw new Error('Nombre del libro requerido y válido');
    }
    if (!datos.autorLibro || datos.autorLibro === 'undefined' || datos.autorLibro === undefined) {
      throw new Error('Autor del libro requerido y válido');
    }
    if (!datos.precioLibro || typeof datos.precioLibro !== 'number' || isNaN(datos.precioLibro)) {
      throw new Error('Precio del libro requerido y válido');
    }
  }
  
  if (datos.tipo === 'utileria') {
    if (!datos.nombreUtileria || datos.nombreUtileria === 'undefined' || datos.nombreUtileria === undefined) {
      throw new Error('Nombre de utilería requerido y válido');
    }
    if (!datos.precioUtileria || typeof datos.precioUtileria !== 'number' || isNaN(datos.precioUtileria)) {
      throw new Error('Precio de utilería requerido y válido');
    }
  }
  
  if (datos.tipo === 'cafeteria') {
    if (!datos.nombreCafeteria || datos.nombreCafeteria === 'undefined' || datos.nombreCafeteria === undefined) {
      throw new Error('Nombre de cafetería requerido y válido');
    }
    if (!datos.precioCafeteria || typeof datos.precioCafeteria !== 'number' || isNaN(datos.precioCafeteria)) {
      throw new Error('Precio de cafetería requerido y válido');
    }
  }
  
  return datos;
}

async function crearBaseDeDatos() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    // BORRAR TODA LA BASE DE DATOS COMPLETAMENTE
    await mongoose.connection.dropDatabase();
    console.log('INFO: Base de datos eliminada completamente.');

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

    // Limpiar colecciones COMPLETAMENTE
    console.log('INFO: Limpiando base de datos...');
    await Proveedor.deleteMany({});
    await Libro.deleteMany({});
    await Utileria.deleteMany({});
    await Cafeteria.deleteMany({});
    await Venta.deleteMany({}); // Limpiar TODAS las ventas
    await Usuario.deleteMany({});
    console.log('INFO: Base de datos limpia');

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
    const ventas = [];
    
    // Crear ventas validadas para libros
    for (let i = 2; i < Math.min(librosInsertados.length, 12); i++) {
      const libro = librosInsertados[i];
      
      // Validar libro antes de crear venta
      if (!libro.nombre || !libro.autor || !libro.precio || typeof libro.precio !== 'number') {
        console.log(`WARNING: Saltando libro inválido: ${libro.nombre || 'Sin nombre'}`);
        continue;
      }
      
      const cantidad = Math.floor(Math.random() * 4) + 1; // 1-4
      const vendedores = ['Juan Pérez', 'Antonio Gill', 'Cristian Descosido', 'Damian Clausi'];
      const vendedor = vendedores[i % vendedores.length];
      
      try {
        const ventaData = crearVentaSegura({
          libro: libro._id,
          nombreLibro: libro.nombre,
          autorLibro: libro.autor,
          generoLibro: libro.genero || 'Sin género',
          precioLibro: libro.precio,
          cantidad: cantidad,
          tipo: 'libro',
          precioUnitario: libro.precio,
          total: libro.precio * cantidad,
          vendedor: vendedor
        });
        
        ventas.push(ventaData);
        
      } catch (error) {
        console.error(`ERROR: Error creando venta para libro ${libro.nombre}: ${error.message}`);
      }
    }

    // Insertar las ventas con fechas apropiadas
    console.log(`EXITO: Creadas ${ventas.length} ventas de libros válidas`);
    
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
      
      try {
        await new Venta({ ...ventas[i], fecha: fechaVenta }).save();
      } catch (error) {
        console.error(`ERROR: Error guardando venta: ${error.message}`);
      }
    }

    // Ventas de utilería del día de hoy (2 items)
    const ventasUtileria = [
      { 
        utileria: utileriaInsertada[5]._id, // Regla 30cm
        nombreUtileria: utileriaInsertada[5].nombre,
        precioUtileria: utileriaInsertada[5].precio,
        cantidad: 2,
        fecha: new Date(hoy),
        tipo: 'utileria',
        precioUnitario: utileriaInsertada[5].precio,
        total: utileriaInsertada[5].precio * 2,
        vendedor: 'Juan Pérez'
      },
      { 
        utileria: utileriaInsertada[6]._id, // Tijera escolar
        nombreUtileria: utileriaInsertada[6].nombre,
        precioUtileria: utileriaInsertada[6].precio,
        cantidad: 1,
        fecha: new Date(hoy),
        tipo: 'utileria',
        precioUnitario: utileriaInsertada[6].precio,
        total: utileriaInsertada[6].precio * 1,
        vendedor: 'Antonio Gill'
      }
    ];

    // Ventas de utilería de otros meses (6 adicionales)
    const ventasUtileriaOtrosMeses = [
      {
        utileria: utileriaInsertada[0]._id, // Lápiz HB
        nombreUtileria: utileriaInsertada[0].nombre,
        precioUtileria: utileriaInsertada[0].precio,
        cantidad: 5,
        fecha: new Date(2025, 4, 15, 14, 30), // 15 de mayo 2025
        tipo: 'utileria',
        precioUnitario: utileriaInsertada[0].precio,
        total: utileriaInsertada[0].precio * 5,
        vendedor: 'Cristian Descosido'
      },
      {
        utileria: utileriaInsertada[1]._id, // Goma de borrar
        nombreUtileria: utileriaInsertada[1].nombre,
        precioUtileria: utileriaInsertada[1].precio,
        cantidad: 3,
        fecha: new Date(2025, 4, 22, 10, 15), // 22 de mayo 2025
        tipo: 'utileria',
        precioUnitario: utileriaInsertada[1].precio,
        total: utileriaInsertada[1].precio * 3,
        vendedor: 'Damian Clausi'
      },
      {
        utileria: utileriaInsertada[2]._id, // Cuaderno A4
        nombreUtileria: utileriaInsertada[2].nombre,
        precioUtileria: utileriaInsertada[2].precio,
        cantidad: 2,
        fecha: new Date(2025, 3, 18, 16, 45), // 18 de abril 2025
        tipo: 'utileria',
        precioUnitario: utileriaInsertada[2].precio,
        total: utileriaInsertada[2].precio * 2,
        vendedor: 'Juan Pérez'
      },
      {
        utileria: utileriaInsertada[3]._id, // Resaltador amarillo
        nombreUtileria: utileriaInsertada[3].nombre,
        precioUtileria: utileriaInsertada[3].precio,
        cantidad: 4,
        fecha: new Date(2025, 3, 25, 11, 20), // 25 de abril 2025
        tipo: 'utileria',
        precioUnitario: utileriaInsertada[3].precio,
        total: utileriaInsertada[3].precio * 4,
        vendedor: 'Antonio Gill'
      },
      {
        utileria: utileriaInsertada[4]._id, // Bolígrafo azul
        nombreUtileria: utileriaInsertada[4].nombre,
        precioUtileria: utileriaInsertada[4].precio,
        cantidad: 1,
        fecha: new Date(2025, 2, 12, 13, 0), // 12 de marzo 2025
        tipo: 'utileria',
        precioUnitario: utileriaInsertada[4].precio,
        total: utileriaInsertada[4].precio * 1,
        vendedor: 'Cristian Descosido'
      },
      {
        utileria: utileriaInsertada[7]._id, // Pegamento en barra
        nombreUtileria: utileriaInsertada[7].nombre,
        precioUtileria: utileriaInsertada[7].precio,
        cantidad: 3,
        fecha: new Date(2025, 2, 28, 15, 30), // 28 de marzo 2025
        tipo: 'utileria',
        precioUnitario: utileriaInsertada[7].precio,
        total: utileriaInsertada[7].precio * 3,
        vendedor: 'Damian Clausi'
      }
    ];

    // Insertar ventas de utilería del día de hoy con validación
    console.log('INFO: Creando ventas de utilería...');
    for (const ventaUtileria of ventasUtileria) {
      try {
        // Validar utilería antes de crear venta
        const utileria = utileriaInsertada.find(u => u._id.equals(ventaUtileria.utileria));
        if (utileria) {
          validarVentaUtileria(ventaUtileria, utileria);
          const ventaValidada = crearVentaSegura(ventaUtileria);
          await new Venta(ventaValidada).save();
        }
      } catch (error) {
        console.error(`ERROR: Error creando venta de utilería: ${error.message}`);
      }
    }

    // Insertar ventas de utilería de otros meses con validación
    for (const ventaUtileria of ventasUtileriaOtrosMeses) {
      try {
        const utileria = utileriaInsertada.find(u => u._id.equals(ventaUtileria.utileria));
        if (utileria) {
          validarVentaUtileria(ventaUtileria, utileria);
          const ventaValidada = crearVentaSegura(ventaUtileria);
          await new Venta(ventaValidada).save();
        }
      } catch (error) {
        console.error(`ERROR: Error creando venta de utilería histórica: ${error.message}`);
      }
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

    // --- AGREGAR DATOS DE CAFETERÍA ---
    const proveedoresCafeteria = proveedoresInsertados.filter(p => p.tipo_proveedor === 'cafeteria');
    function randomStockCafeteria() { return Math.floor(Math.random() * 31); } // 0-30
    function randomStockMinimoCafeteria() { return Math.floor(Math.random() * 11); } // 0-10
    function randomUltimaVentaCafeteria() {
      const dias = Math.floor(Math.random() * 400);
      return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
    }
    const cafeteria = [
      { nombre: 'Café Americano', descripcion: 'Café negro clásico preparado con granos premium.', precio: 800, stock: 0, stockMinimo: 5, categoria: 'bebidas', ultimaReposicion: new Date(), ultimaVenta: hace6Meses, proveedor: proveedoresCafeteria[0]._id },
      { nombre: 'Café con Leche', descripcion: 'Café con leche cremosa y espuma suave.', precio: 950, stock: 0, stockMinimo: 4, categoria: 'bebidas', ultimaReposicion: new Date(), ultimaVenta: hace6Meses, proveedor: proveedoresCafeteria[1]._id },
      { nombre: 'Cappuccino', descripcion: 'Espresso con leche vaporizada y espuma densa.', precio: 1100, stock: 2, stockMinimo: 6, categoria: 'bebidas', ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresCafeteria[0]._id },
      { nombre: 'Latte', descripcion: 'Espresso suave con abundante leche vaporizada.', precio: 1200, stock: 1, stockMinimo: 5, categoria: 'bebidas', ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresCafeteria[1]._id },
      { nombre: 'Espresso', descripcion: 'Café concentrado de sabor intenso.', precio: 700, stock: 3, stockMinimo: 8, categoria: 'bebidas', ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresCafeteria[0]._id },
      { nombre: 'Mocha', descripcion: 'Café con chocolate y crema batida.', precio: 1350, stock: randomStockCafeteria(), stockMinimo: randomStockMinimoCafeteria(), categoria: 'bebidas', ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresCafeteria[1]._id },
      { nombre: 'Frappé', descripcion: 'Café frío batido con hielo y crema.', precio: 1500, stock: randomStockCafeteria(), stockMinimo: randomStockMinimoCafeteria(), categoria: 'bebidas', ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresCafeteria[0]._id },
      { nombre: 'Té Negro', descripcion: 'Té premium con bergamota y especias.', precio: 600, stock: randomStockCafeteria(), stockMinimo: randomStockMinimoCafeteria(), categoria: 'bebidas', ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresCafeteria[1]._id },
      { nombre: 'Chocolate Caliente', descripcion: 'Bebida de chocolate cremosa con marshmallows.', precio: 1100, stock: randomStockCafeteria(), stockMinimo: randomStockMinimoCafeteria(), categoria: 'bebidas', ultimaReposicion: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), ultimaVenta: new Date(), proveedor: proveedoresCafeteria[0]._id },
      { nombre: 'Croissant', descripcion: 'Medialuna francesa rellena de dulce de leche.', precio: 850, stock: randomStockCafeteria(), stockMinimo: randomStockMinimoCafeteria(), categoria: 'comidas', ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresCafeteria[1]._id },
      { nombre: 'Muffin de Arándanos', descripcion: 'Panecillo esponjoso con arándanos frescos.', precio: 950, stock: randomStockCafeteria(), stockMinimo: randomStockMinimoCafeteria(), categoria: 'postres', ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresCafeteria[0]._id },
      { nombre: 'Tostado de Jamón y Queso', descripcion: 'Sándwich tostado clásico con jamón y queso.', precio: 1800, stock: randomStockCafeteria(), stockMinimo: randomStockMinimoCafeteria(), categoria: 'comidas', ultimaReposicion: new Date(), ultimaVenta: new Date(), proveedor: proveedoresCafeteria[1]._id }
    ];
    for (const item of cafeteria) {
      item.ultimaVenta = randomUltimaVentaCafeteria();
    }
    const cafeteriaInsertada = await Cafeteria.insertMany(cafeteria);

    // Ventas de cafetería del día de hoy (1 venta)
    const ventasCafeteria = [
      { 
        cafeteria: cafeteriaInsertada[5]._id, // Mocha
        nombreCafeteria: cafeteriaInsertada[5].nombre,
        precioCafeteria: cafeteriaInsertada[5].precio,
        cantidad: 2,
        fecha: new Date(hoy),
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[5].precio,
        total: cafeteriaInsertada[5].precio * 2,
        vendedor: 'Juan Pérez'
      }
    ];

    // Ventas de cafetería de esta semana (2 ventas adicionales)
    const estaSemana = new Date(hoy);
    estaSemana.setDate(hoy.getDate() - 2); // Hace 2 días
    const estaSemana2 = new Date(hoy);
    estaSemana2.setDate(hoy.getDate() - 4); // Hace 4 días

    const ventasCafeteriaSemana = [
      { 
        cafeteria: cafeteriaInsertada[6]._id, // Frappé
        nombreCafeteria: cafeteriaInsertada[6].nombre,
        precioCafeteria: cafeteriaInsertada[6].precio,
        cantidad: 1,
        fecha: new Date(estaSemana),
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[6].precio,
        total: cafeteriaInsertada[6].precio * 1,
        vendedor: 'Antonio Gill'
      },
      { 
        cafeteria: cafeteriaInsertada[9]._id, // Croissant
        nombreCafeteria: cafeteriaInsertada[9].nombre,
        precioCafeteria: cafeteriaInsertada[9].precio,
        cantidad: 3,
        fecha: new Date(estaSemana2),
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[9].precio,
        total: cafeteriaInsertada[9].precio * 3,
        vendedor: 'Cristian Descosido'
      }
    ];

    // Ventas de cafetería de este mes (5 ventas adicionales)
    const esteMes1 = new Date(hoy.getFullYear(), hoy.getMonth(), 5, 10, 30);
    const esteMes2 = new Date(hoy.getFullYear(), hoy.getMonth(), 8, 14, 15);
    const esteMes3 = new Date(hoy.getFullYear(), hoy.getMonth(), 12, 16, 45);
    const esteMes4 = new Date(hoy.getFullYear(), hoy.getMonth(), 18, 11, 20);
    const esteMes5 = new Date(hoy.getFullYear(), hoy.getMonth(), 22, 13, 10);

    const ventasCafeteriaMes = [
      {
        cafeteria: cafeteriaInsertada[0]._id, // Café Americano
        nombreCafeteria: cafeteriaInsertada[0].nombre,
        precioCafeteria: cafeteriaInsertada[0].precio,
        cantidad: 2,
        fecha: esteMes1,
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[0].precio,
        total: cafeteriaInsertada[0].precio * 2,
        vendedor: 'Damian Clausi'
      },
      {
        cafeteria: cafeteriaInsertada[1]._id, // Café con Leche
        nombreCafeteria: cafeteriaInsertada[1].nombre,
        precioCafeteria: cafeteriaInsertada[1].precio,
        cantidad: 1,
        fecha: esteMes2,
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[1].precio,
        total: cafeteriaInsertada[1].precio * 1,
        vendedor: 'Juan Pérez'
      },
      {
        cafeteria: cafeteriaInsertada[2]._id, // Cappuccino
        nombreCafeteria: cafeteriaInsertada[2].nombre,
        precioCafeteria: cafeteriaInsertada[2].precio,
        cantidad: 3,
        fecha: esteMes3,
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[2].precio,
        total: cafeteriaInsertada[2].precio * 3,
        vendedor: 'Antonio Gill'
      },
      {
        cafeteria: cafeteriaInsertada[3]._id, // Latte
        nombreCafeteria: cafeteriaInsertada[3].nombre,
        precioCafeteria: cafeteriaInsertada[3].precio,
        cantidad: 2,
        fecha: esteMes4,
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[3].precio,
        total: cafeteriaInsertada[3].precio * 2,
        vendedor: 'Cristian Descosido'
      },
      {
        cafeteria: cafeteriaInsertada[7]._id, // Té Negro
        nombreCafeteria: cafeteriaInsertada[7].nombre,
        precioCafeteria: cafeteriaInsertada[7].precio,
        cantidad: 1,
        fecha: esteMes5,
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[7].precio,
        total: cafeteriaInsertada[7].precio * 1,
        vendedor: 'Damian Clausi'
      }
    ];

    // Ventas de cafetería de otros meses (8 adicionales)
    const ventasCafeteriaOtrosMeses = [
      {
        cafeteria: cafeteriaInsertada[0]._id, // Café Americano
        nombreCafeteria: cafeteriaInsertada[0].nombre,
        precioCafeteria: cafeteriaInsertada[0].precio,
        cantidad: 4,
        fecha: new Date(2025, 4, 12, 9, 15), // 12 de mayo 2025
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[0].precio,
        total: cafeteriaInsertada[0].precio * 4,
        vendedor: 'Damian Clausi'
      },
      {
        cafeteria: cafeteriaInsertada[1]._id, // Café con Leche
        nombreCafeteria: cafeteriaInsertada[1].nombre,
        precioCafeteria: cafeteriaInsertada[1].precio,
        cantidad: 3,
        fecha: new Date(2025, 4, 18, 11, 30), // 18 de mayo 2025
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[1].precio,
        total: cafeteriaInsertada[1].precio * 3,
        vendedor: 'Juan Pérez'
      },
      {
        cafeteria: cafeteriaInsertada[2]._id, // Cappuccino
        nombreCafeteria: cafeteriaInsertada[2].nombre,
        precioCafeteria: cafeteriaInsertada[2].precio,
        cantidad: 2,
        fecha: new Date(2025, 3, 22, 16, 0), // 22 de abril 2025
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[2].precio,
        total: cafeteriaInsertada[2].precio * 2,
        vendedor: 'Antonio Gill'
      },
      {
        cafeteria: cafeteriaInsertada[3]._id, // Latte
        nombreCafeteria: cafeteriaInsertada[3].nombre,
        precioCafeteria: cafeteriaInsertada[3].precio,
        cantidad: 5,
        fecha: new Date(2025, 3, 28, 14, 45), // 28 de abril 2025
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[3].precio,
        total: cafeteriaInsertada[3].precio * 5,
        vendedor: 'Cristian Descosido'
      },
      {
        cafeteria: cafeteriaInsertada[4]._id, // Espresso
        nombreCafeteria: cafeteriaInsertada[4].nombre,
        precioCafeteria: cafeteriaInsertada[4].precio,
        cantidad: 2,
        fecha: new Date(2025, 2, 15, 10, 20), // 15 de marzo 2025
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[4].precio,
        total: cafeteriaInsertada[4].precio * 2,
        vendedor: 'Damian Clausi'
      },
      {
        cafeteria: cafeteriaInsertada[7]._id, // Té Negro
        nombreCafeteria: cafeteriaInsertada[7].nombre,
        precioCafeteria: cafeteriaInsertada[7].precio,
        cantidad: 1,
        fecha: new Date(2025, 2, 25, 15, 10), // 25 de marzo 2025
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[7].precio,
        total: cafeteriaInsertada[7].precio * 1,
        vendedor: 'Juan Pérez'
      },
      {
        cafeteria: cafeteriaInsertada[10]._id, // Muffin de Arándanos
        nombreCafeteria: cafeteriaInsertada[10].nombre,
        precioCafeteria: cafeteriaInsertada[10].precio,
        cantidad: 3,
        fecha: new Date(2025, 1, 20, 13, 30), // 20 de febrero 2025
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[10].precio,
        total: cafeteriaInsertada[10].precio * 3,
        vendedor: 'Antonio Gill'
      },
      {
        cafeteria: cafeteriaInsertada[11]._id, // Tostado de Jamón y Queso
        nombreCafeteria: cafeteriaInsertada[11].nombre,
        precioCafeteria: cafeteriaInsertada[11].precio,
        cantidad: 2,
        fecha: new Date(2025, 1, 28, 12, 45), // 28 de febrero 2025
        tipo: 'cafeteria',
        precioUnitario: cafeteriaInsertada[11].precio,
        total: cafeteriaInsertada[11].precio * 2,
        vendedor: 'Cristian Descosido'
      }
    ];

    // Insertar ventas de cafetería del día de hoy (sin validación para compatibilidad)
    console.log('INFO: Creando ventas de cafetería...');
    for (const ventaCafeteria of ventasCafeteria) {
      await new Venta(ventaCafeteria).save();
    }

    // Insertar ventas de cafetería de esta semana (sin validación para compatibilidad)
    for (const ventaCafeteria of ventasCafeteriaSemana) {
      await new Venta(ventaCafeteria).save();
    }

    // Insertar ventas de cafetería de este mes (sin validación para compatibilidad)
    for (const ventaCafeteria of ventasCafeteriaMes) {
      await new Venta(ventaCafeteria).save();
    }

    // Insertar ventas de cafetería de otros meses (sin validación para compatibilidad)
    for (const ventaCafeteria of ventasCafeteriaOtrosMeses) {
      await new Venta(ventaCafeteria).save();
    }

    // Actualizar la ultimaVenta de los items de cafetería vendidos hoy
    await Cafeteria.findByIdAndUpdate(cafeteriaInsertada[5]._id, { ultimaVenta: new Date(hoy) });
    await Cafeteria.findByIdAndUpdate(cafeteriaInsertada[6]._id, { ultimaVenta: new Date(hoy) });
    await Cafeteria.findByIdAndUpdate(cafeteriaInsertada[9]._id, { ultimaVenta: new Date(hoy) });

    // Actualizar la ultimaVenta de los items vendidos en otros meses
    await Cafeteria.findByIdAndUpdate(cafeteriaInsertada[0]._id, { ultimaVenta: new Date(2025, 4, 18) });
    await Cafeteria.findByIdAndUpdate(cafeteriaInsertada[1]._id, { ultimaVenta: new Date(2025, 4, 18) });
    await Cafeteria.findByIdAndUpdate(cafeteriaInsertada[2]._id, { ultimaVenta: new Date(2025, 3, 22) });
    await Cafeteria.findByIdAndUpdate(cafeteriaInsertada[3]._id, { ultimaVenta: new Date(2025, 3, 28) });
    await Cafeteria.findByIdAndUpdate(cafeteriaInsertada[4]._id, { ultimaVenta: new Date(2025, 2, 15) });
    await Cafeteria.findByIdAndUpdate(cafeteriaInsertada[7]._id, { ultimaVenta: new Date(2025, 2, 25) });
    await Cafeteria.findByIdAndUpdate(cafeteriaInsertada[10]._id, { ultimaVenta: new Date(2025, 1, 20) });
    await Cafeteria.findByIdAndUpdate(cafeteriaInsertada[11]._id, { ultimaVenta: new Date(2025, 1, 28) });

    // LIMPIEZA FINAL REFORZADA: Eliminar solo ventas con campos undefined o null
    console.log('INFO: Limpieza final reforzada de ventas inválidas...');
    const ventasInvalidas = await Venta.find({
      $or: [
        // Ventas de libros con campos faltantes o inválidos
        { $and: [
          { tipo: 'libro' },
          { $or: [
            { nombreLibro: { $in: [null, 'undefined', undefined] } },
            { autorLibro: { $in: [null, 'undefined', undefined] } },
            { precioLibro: { $in: [null, undefined] } },
            { nombreLibro: { $exists: false } },
            { autorLibro: { $exists: false } },
            { precioLibro: { $exists: false } }
          ]}
        ]},
        // Ventas de utilería con campos faltantes o inválidos
        { $and: [
          { tipo: 'utileria' },
          { $or: [
            { nombreUtileria: { $in: [null, 'undefined', undefined] } },
            { precioUtileria: { $in: [null, undefined] } },
            { nombreUtileria: { $exists: false } },
            { precioUtileria: { $exists: false } }
          ]}
        ]},
        // Ventas de cafetería con campos faltantes o inválidos
        { $and: [
          { tipo: 'cafeteria' },
          { $or: [
            { nombreCafeteria: { $in: [null, 'undefined', undefined] } },
            { precioCafeteria: { $in: [null, undefined] } },
            { nombreCafeteria: { $exists: false } },
            { precioCafeteria: { $exists: false } }
          ]}
        ]},
        // Cualquier venta con campos básicos faltantes
        { cantidad: { $in: [null, undefined] } },
        { total: { $in: [null, undefined] } },
        { vendedor: { $in: [null, 'undefined', undefined] } },
        { tipo: { $in: [null, 'undefined', undefined] } }
      ]
    });
    if (ventasInvalidas.length > 0) {
      const ids = ventasInvalidas.map(v => v._id);
      const res = await Venta.deleteMany({ _id: { $in: ids } });
      console.log(`INFO: Eliminadas ${res.deletedCount} ventas inválidas en la limpieza final.`);
    } else {
      console.log('INFO: No se encontraron ventas inválidas en la limpieza final.');
    }

    // Verificar integridad de los datos creados
    console.log('\nINFO: Verificando integridad de los datos...');
    
    // LIMPIEZA FINAL: Eliminar cualquier venta con datos undefined que pueda haber quedado
    console.log('INFO: Buscando ventas con datos inconsistentes...');
    
    // Buscar ventas problemáticas específicamente (solo campos undefined como string)
    const ventasProblematicas = await Venta.find({
      $or: [
        { nombreLibro: "undefined" },
        { autorLibro: "undefined" },
        { nombreUtileria: "undefined" },
        { nombreCafeteria: "undefined" },
        { vendedor: "undefined" },
        { tipo: "undefined" }
      ]
    });
    
    console.log(`INFO: Encontradas ${ventasProblematicas.length} ventas problemáticas`);
    
    // Eliminar solo las ventas problemáticas
    if (ventasProblematicas.length > 0) {
      const idsProblematicos = ventasProblematicas.map(v => v._id);
      const resultado = await Venta.deleteMany({ _id: { $in: idsProblematicos } });
      console.log(`INFO: Eliminadas ${resultado.deletedCount} ventas inconsistentes`);
    }
    
    const totalVentasCreadas = await Venta.countDocuments();
    const ventasValidasCreadas = await Venta.countDocuments({
      $and: [
        { $or: [
          // Ventas de libros válidas
          { 
            tipo: 'libro',
            nombreLibro: { $exists: true, $ne: null, $ne: "undefined" },
            autorLibro: { $exists: true, $ne: null, $ne: "undefined" },
            precioLibro: { $exists: true, $type: "number" }
          },
          // Ventas de utilería válidas
          { 
            tipo: 'utileria',
            nombreUtileria: { $exists: true, $ne: null, $ne: "undefined" },
            precioUtileria: { $exists: true, $type: "number" }
          },
          // Ventas de cafetería válidas
          { 
            tipo: 'cafeteria',
            nombreCafeteria: { $exists: true, $ne: null, $ne: "undefined" },
            precioCafeteria: { $exists: true, $type: "number" }
          }
        ]},
        { cantidad: { $exists: true, $type: "number", $gt: 0 } },
        { total: { $exists: true, $type: "number", $gt: 0 } },
        { vendedor: { $exists: true, $ne: null, $ne: "undefined" } }
      ]
    });

    console.log(`EXITO: Total de ventas creadas: ${totalVentasCreadas}`);
    console.log(`EXITO: Ventas válidas: ${ventasValidasCreadas}`);
    
    if (totalVentasCreadas === ventasValidasCreadas) {
      console.log('EXITO: Todos los dados son consistentes! No hay registros con undefined o NaN.');
    } else {
      console.log(`WARNING: Se detectaron ${totalVentasCreadas - ventasValidasCreadas} ventas con datos inconsistentes.`);
    }

    console.log('\nINFO: Base de datos el-lector-voraz creada exitosamente con:');
    console.log(`   Libros: ${librosInsertados.length}`);
    console.log(`   Utilería: ${utileriaInsertada.length}`);
    console.log(`   Cafetería: ${cafeteriaInsertada.length}`);
    console.log(`   Proveedores: ${proveedoresInsertados.length}`);
    console.log(`   Usuarios: ${usuariosInsertados.length}`);
    console.log(`   Ventas totales: ${totalVentasCreadas} (${ventasValidasCreadas} válidas)`);
    
    console.log('\nINFO: Usuarios creados (TODAS LAS CONTRASEÑAS: 1234):');
    console.log('   Admin: Juan Perez (juan.perez@lectorvoraz.com)');
    console.log('   Empleado: Antonio Gill (antonio.gill@lectorvoraz.com)');
    console.log('   Empleado: Cristian Descosido (cristian.descosido@lectorvoraz.com)');
    console.log('   Empleado: Damian Clausi (damian.clausi@lectorvoraz.com)');
    console.log('   Admin: admin (admin) - (compatibilidad)');
    console.log('   INFO: Todas las contraseñas están cifradas en la base de datos');
    
    console.log('\nINFO: Puedes acceder al sistema en: http://localhost:3000');
    console.log('INFO: El script ha prevenido la creación de datos inconsistentes.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error al crear la base de datos:', err);
    process.exit(1);
  }
}

crearBaseDeDatos();
