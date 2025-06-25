const request = require('supertest');
const app = require('../app');
const { crearUsuarioPrueba, loginComoUsuario, limpiarUsuariosPrueba } = require('./test-helpers');

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

  // Crea un proveedor de tipo 'libreria' para usar en los tests
  const proveedorRes = await adminAgent
    .post('/api/proveedores')
    .send({
      nombre: 'Proveedor Test Libros',
      mail: 'libros@test.com',
      tipo_proveedor: 'libreria'
    });
  
  proveedorLibreriaId = proveedorRes.body._id;
});

afterAll(async () => {
  // Limpiar todos los usuarios de prueba al final
  await limpiarUsuariosPrueba();
});

describe('API Libros', () => {
  // Test para GET /api/libros
  test('GET /api/libros debería retornar todos los libros (autenticado)', async () => {
    const res = await adminAgent.get('/api/libros');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/libros debería fallar sin autenticación', async () => {
    const res = await request(app).get('/api/libros');
    expect(res.statusCode).toBe(401);
  });

  // Test para POST /api/libros con todos los campos requeridos
  test('POST /api/libros debería crear un nuevo libro con stock y género y proveedor (admin)', async () => {
    const nuevoLibro = {
      nombre: 'Nuevo Libro de Prueba',
      autor: 'Autor de Prueba',
      genero: 'Ficción',
      precio: 25.99,
      stock: 10,
      stockMinimo: 5,
      proveedor: proveedorLibreriaId
    };

    const res = await adminAgent
      .post('/api/libros')
      .send(nuevoLibro);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.nombre).toBe(nuevoLibro.nombre);
    expect(res.body.autor).toBe(nuevoLibro.autor);
    expect(res.body.genero).toBe(nuevoLibro.genero);
    expect(res.body.precio).toBe(nuevoLibro.precio);
    expect(res.body.stock).toBe(nuevoLibro.stock);
    expect(res.body.stockMinimo).toBe(nuevoLibro.stockMinimo);
    expect(res.body.proveedor).toHaveProperty('_id', proveedorLibreriaId);
  });

  test('POST /api/libros debería fallar para empleados', async () => {
    const nuevoLibro = {
      nombre: 'Libro Test',
      autor: 'Autor Test',
      precio: 25.99,
      proveedor: proveedorLibreriaId
    };

    const res = await empleadoAgent
      .post('/api/libros')
      .send(nuevoLibro);
    expect(res.statusCode).toBe(403);
  });

  // Test para falta de proveedor
  test('POST /api/libros falla si falta proveedor (admin)', async () => {
    const nuevoLibro = {
      nombre: 'Libro Sin Proveedor',
      autor: 'Autor Sin Proveedor',
      precio: 30,
      stock: 5
    };
    const res = await adminAgent
      .post('/api/libros')
      .send(nuevoLibro);
    // Puede devolver 400 o 500 según la validación, pero nunca 201
    expect(res.statusCode).not.toBe(201);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/libros falla si proveedor no es de tipo libreria (admin)', async () => {
    // Crear un proveedor que no sea de libreria
    const proveedorCafeteria = await adminAgent
      .post('/api/proveedores')
      .send({
        nombre: 'Cafeteria Test',
        mail: 'cafeteria@test.com',
        tipo_proveedor: 'cafeteria'
      });

    const nuevoLibro = {
      nombre: 'Libro Con Proveedor Incorrecto',
      autor: 'Autor Test',
      precio: 30,
      proveedor: proveedorCafeteria.body._id
    };
    const res = await adminAgent
      .post('/api/libros')
      .send(nuevoLibro);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test para GET /api/libros/:id
  test('GET /api/libros/:id debería retornar un libro específico (autenticado)', async () => {
    const libroParaObtener = {
      nombre: 'Libro Para Obtener',
      autor: 'Autor Para Obtener',
      genero: 'Drama',
      precio: 20.50,
      stock: 8,
      proveedor: proveedorLibreriaId
    };

    const createRes = await adminAgent
      .post('/api/libros')
      .send(libroParaObtener);

    const libroId = createRes.body._id;

    const getRes = await adminAgent.get(`/api/libros/${libroId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body._id).toBe(libroId);
    expect(getRes.body.nombre).toBe(libroParaObtener.nombre);
    expect(getRes.body.genero).toBe(libroParaObtener.genero);
    expect(getRes.body.precio).toBe(libroParaObtener.precio);
    expect(getRes.body.stock).toBe(libroParaObtener.stock);
  });

  // Test para PATCH /api/libros/:id
  test('PATCH /api/libros/:id debería actualizar un libro existente y su proveedor (admin)', async () => {
    const libroParaActualizar = {
      nombre: 'Libro Para Actualizar',
      autor: 'Autor Para Actualizar',
      precio: 18,
      genero: 'Ficcion',
      stock: 12,
      proveedor: proveedorLibreriaId
    };

    const createRes = await adminAgent
      .post('/api/libros')
      .send(libroParaActualizar);

    const libroId = createRes.body._id;

    // Crear un segundo proveedor
    const prov2 = await adminAgent
      .post('/api/proveedores')
      .send({
        nombre: 'Segundo Proveedor',
        mail: 'segundo@proveedor.com',
        tipo_proveedor: 'libreria'
      });

    const datosActualizados = {
      precio: 22,
      stock: 15,
      proveedor: prov2.body._id
    };

    const patchRes = await adminAgent
      .patch(`/api/libros/${libroId}`)
      .send(datosActualizados);
    
    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body.precio).toBe(datosActualizados.precio);
    expect(patchRes.body.stock).toBe(datosActualizados.stock);
    expect(patchRes.body.proveedor).toHaveProperty('_id', prov2.body._id);
  });

  test('PATCH /api/libros/:id debería fallar para empleados', async () => {
    const libroParaActualizar = {
      nombre: 'Libro Test',
      autor: 'Autor Test',
      precio: 18,
      proveedor: proveedorLibreriaId
    };

    const createRes = await adminAgent
      .post('/api/libros')
      .send(libroParaActualizar);

    const libroId = createRes.body._id;
    const datosActualizados = { precio: 22 };

    const res = await empleadoAgent
      .patch(`/api/libros/${libroId}`)
      .send(datosActualizados);
    expect(res.statusCode).toBe(403);
  });

  // Test para DELETE /api/libros/:id
  test('DELETE /api/libros/:id debería eliminar un libro (admin)', async () => {
    const libroParaEliminar = {
      nombre: 'Libro Para Eliminar',
      autor: 'Autor Para Eliminar',
      precio: 15,
      genero: 'Ensayo',
      proveedor: proveedorLibreriaId
    };

    const createRes = await adminAgent
      .post('/api/libros')
      .send(libroParaEliminar);

    const libroId = createRes.body._id;

    const deleteRes = await adminAgent.delete(`/api/libros/${libroId}`);
    
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty('mensaje');
  });

  test('DELETE /api/libros/:id debería fallar para empleados', async () => {
    const libroParaEliminar = {
      nombre: 'Libro Test',
      autor: 'Autor Test',
      precio: 15,
      proveedor: proveedorLibreriaId
    };

    const createRes = await adminAgent
      .post('/api/libros')
      .send(libroParaEliminar);

    const libroId = createRes.body._id;

    const res = await empleadoAgent.delete(`/api/libros/${libroId}`);
    expect(res.statusCode).toBe(403);
  });
});
