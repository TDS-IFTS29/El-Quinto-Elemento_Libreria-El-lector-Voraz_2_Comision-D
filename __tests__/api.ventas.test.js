const request = require('supertest');
const app = require('../app');
const Venta = require('../models/Venta');
const Libro = require('../models/Libro');
const Proveedor = require('../models/Proveedor');
const { crearUsuarioPrueba, loginComoUsuario, limpiarUsuariosPrueba } = require('./test-helpers');

describe('API de Ventas de Libros', () => {
  let proveedorLibreriaId;
  let adminAgent;
  let empleadoAgent;
  let usuarioAdmin;
  let usuarioEmpleado;

  beforeAll(async () => {
    // Crear usuarios de prueba
    usuarioAdmin = await crearUsuarioPrueba('admin');
    usuarioEmpleado = await crearUsuarioPrueba('empleado');
    
    // Iniciar sesión con ambos usuarios
    adminAgent = await loginComoUsuario(app, usuarioAdmin);
    empleadoAgent = await loginComoUsuario(app, usuarioEmpleado);

    // Crea un proveedor de tipo 'libreria' para usar en los tests de ventas
    const proveedorRes = await adminAgent
      .post('/api/proveedores')
      .send({
        nombre: 'Proveedor Test Ventas',
        mail: 'ventas@test.com',
        tipo_proveedor: 'libreria'
      });
    proveedorLibreriaId = proveedorRes.body._id;
  });

  afterEach(async () => {
    // Limpiar datos de prueba después de cada test
    try {
      await Venta.deleteMany({ 
        $or: [
          { nombreLibro: { $regex: /test|prueba/i } },
          { autorLibro: { $regex: /test|prueba/i } }
        ]
      });
      await Libro.deleteMany({ 
        $or: [
          { nombre: { $regex: /test|prueba/i } },
          { autor: { $regex: /test|prueba/i } }
        ]
      });
    } catch (error) {
      console.log('Error limpiando datos de prueba:', error);
    }
  });

  afterAll(async () => {
    // Limpiar todos los datos de prueba al final
    try {
      await Proveedor.findByIdAndDelete(proveedorLibreriaId);
    } catch (error) {
      console.log('Error limpiando proveedor de prueba:', error);
    }
    await limpiarUsuariosPrueba();
  });
  // Test para GET /api/ventas (todas las ventas) - ambos roles pueden ver ventas
  test('GET /api/ventas debería retornar todas las ventas (admin)', async () => {
    const res = await adminAgent.get('/api/ventas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/ventas debería retornar todas las ventas (empleado)', async () => {
    const res = await empleadoAgent.get('/api/ventas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para POST /api/ventas (registrar venta) - ambos roles pueden registrar ventas
  test('POST /api/ventas debería registrar una nueva venta de un libro existente y actualizar stock y ultimaVenta (admin)', async () => {
    // Primero crea un libro de prueba con proveedor válido
    const libroRes = await adminAgent
      .post('/api/libros')
      .send({ nombre: 'Rayuela Test', autor: 'Julio Cortázar Test', precio: 100, genero: 'Novela', stock: 20, proveedor: proveedorLibreriaId });
    const libroId = libroRes.body._id;

    const nuevaVenta = {
      libro: libroId,
      cantidad: 5
    };
    const res = await adminAgent
      .post('/api/ventas')
      .send(nuevaVenta);
    expect(res.statusCode).toBe(201);
    // Ahora se espera el objeto venta con los campos históricos
    expect(res.body).toHaveProperty('libro', libroId);
    expect(res.body).toHaveProperty('nombreLibro', 'Rayuela Test');
    expect(res.body).toHaveProperty('autorLibro', 'Julio Cortázar Test');
    expect(res.body).toHaveProperty('generoLibro', 'Novela');
    expect(res.body).toHaveProperty('precioLibro', 100);
    expect(res.body).toHaveProperty('cantidad', 5);
    expect(res.body).toHaveProperty('fecha');

    // Verifica que el stock se haya actualizado
    const libroActualizado = await adminAgent.get(`/api/libros/${libroId}`);
    expect(libroActualizado.body.stock).toBe(15);
    // Verifica que ultimaVenta se haya actualizado
    expect(new Date(libroActualizado.body.ultimaVenta).getTime()).toBeGreaterThan(0);
  });

  test('POST /api/ventas debería registrar una nueva venta de un libro existente (empleado)', async () => {
    // Primero crea un libro de prueba con proveedor válido
    const libroRes = await adminAgent
      .post('/api/libros')
      .send({ nombre: 'Cien años de soledad Test', autor: 'Gabriel García Márquez Test', precio: 120, genero: 'Realismo mágico', stock: 15, proveedor: proveedorLibreriaId });
    const libroId = libroRes.body._id;

    const nuevaVenta = {
      libro: libroId,
      cantidad: 3
    };
    const res = await empleadoAgent
      .post('/api/ventas')
      .send(nuevaVenta);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('libro', libroId);
    expect(res.body).toHaveProperty('nombreLibro', 'Cien años de soledad Test');
    expect(res.body).toHaveProperty('cantidad', 3);
  });

  // Test para GET /api/ventas/mas-vendidos - ambos roles pueden ver reportes
  test('GET /api/ventas/mas-vendidos debería retornar los libros más vendidos (admin)', async () => {
    const res = await adminAgent.get('/api/ventas/mas-vendidos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/ventas/mas-vendidos debería retornar los libros más vendidos (empleado)', async () => {
    const res = await empleadoAgent.get('/api/ventas/mas-vendidos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para GET /api/ventas/ventas-semana - ambos roles pueden ver reportes
  test('GET /api/ventas/ventas-semana debería retornar las ventas de la última semana (admin)', async () => {
    const res = await adminAgent.get('/api/ventas/ventas-semana');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Verifica que todas las ventas sean de la última semana
    const sieteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;
    res.body.forEach(venta => {
      expect(new Date(venta.fecha).getTime()).toBeGreaterThanOrEqual(sieteDiasAtras);
    });
  });

  test('GET /api/ventas/ventas-semana debería retornar las ventas de la última semana (empleado)', async () => {
    const res = await empleadoAgent.get('/api/ventas/ventas-semana');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Verifica que todas las ventas sean de la última semana
    const sieteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;
    res.body.forEach(venta => {
      expect(new Date(venta.fecha).getTime()).toBeGreaterThanOrEqual(sieteDiasAtras);
    });
  });
});