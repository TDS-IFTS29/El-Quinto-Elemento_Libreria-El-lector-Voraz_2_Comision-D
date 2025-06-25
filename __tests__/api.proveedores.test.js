const request = require('supertest');
const app = require('../app');
const Proveedor = require('../models/Proveedor');
const { crearUsuarioPrueba, loginComoUsuario, limpiarUsuariosPrueba } = require('./test-helpers');

describe('API de Proveedores', () => {
  let testProveedorId;
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
  });

  afterEach(async () => {
    // Limpiar proveedores de prueba después de cada test
    try {
      if (testProveedorId) {
        await Proveedor.findByIdAndDelete(testProveedorId);
        testProveedorId = null;
      }
      await Proveedor.deleteMany({ 
        nombre: { $regex: /.*prueba.*|.*test.*/i }
      });
    } catch (error) {
      console.log('Error limpiando datos de prueba:', error);
    }
  });

  afterAll(async () => {
    // Limpiar todos los usuarios de prueba al final
    await limpiarUsuariosPrueba();
  });

  // Test para GET /api/proveedores (admin)
  test('GET /api/proveedores debería retornar todos los proveedores (admin)', async () => {
    const res = await adminAgent.get('/api/proveedores');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para GET /api/proveedores (empleado) - debería fallar
  test('GET /api/proveedores debería fallar para empleados', async () => {
    const res = await empleadoAgent.get('/api/proveedores');
    expect(res.statusCode).toBe(403);
  });

  // Test para POST /api/proveedores (admin)
  test('POST /api/proveedores debería crear un nuevo proveedor (admin)', async () => {
    const nuevoProveedor = {
      nombre: 'Nuevo Proveedor de Prueba',
      mail: 'proveedorprueba@mail.com',
      tipo_proveedor: 'libreria'
    };
    const res = await adminAgent
      .post('/api/proveedores')
      .send(nuevoProveedor);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.nombre).toBe(nuevoProveedor.nombre);
    expect(res.body.mail).toBe(nuevoProveedor.mail);
    
    testProveedorId = res.body._id;
  });

  // Test para POST /api/proveedores (empleado) - debería fallar
  test('POST /api/proveedores debería fallar para empleados', async () => {
    const nuevoProveedor = {
      nombre: 'Proveedor Test Empleado',
      mail: 'empleado@mail.com',
      tipo_proveedor: 'libreria'
    };
    const res = await empleadoAgent
      .post('/api/proveedores')
      .send(nuevoProveedor);
    expect(res.statusCode).toBe(403);
  });

  // Test para GET /api/proveedores/:id (admin)
  test('GET /api/proveedores/:id debería retornar un proveedor específico (admin)', async () => {
    const proveedorParaObtener = {
      nombre: 'Proveedor para Obtener',
      mail: 'obtener@mail.com',
      tipo_proveedor: 'libreria'
    };
    const postRes = await adminAgent
      .post('/api/proveedores')
      .send(proveedorParaObtener);
    const proveedorId = postRes.body._id;

    const getRes = await adminAgent.get(`/api/proveedores/${proveedorId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body._id).toBe(proveedorId);
    expect(getRes.body.nombre).toBe(proveedorParaObtener.nombre);
    expect(getRes.body.mail).toBe(proveedorParaObtener.mail);
    
    testProveedorId = proveedorId;
  });

  // Test para GET /api/proveedores/:id (empleado) - debería fallar
  test('GET /api/proveedores/:id debería fallar para empleados', async () => {
    const proveedorParaObtener = {
      nombre: 'Proveedor Test ID',
      mail: 'testid@mail.com',
      tipo_proveedor: 'libreria'
    };
    const postRes = await adminAgent
      .post('/api/proveedores')
      .send(proveedorParaObtener);
    const proveedorId = postRes.body._id;

    const getRes = await empleadoAgent.get(`/api/proveedores/${proveedorId}`);
    expect(getRes.statusCode).toBe(403);
    
    testProveedorId = proveedorId;
  });

  // Test para PATCH /api/proveedores/:id (admin)
  test('PATCH /api/proveedores/:id debería actualizar un proveedor existente (admin)', async () => {
    const proveedorParaActualizar = {
      nombre: 'Proveedor para Actualizar',
      mail: 'actualizar@mail.com',
      tipo_proveedor: 'libreria'
    };
    const postRes = await adminAgent
      .post('/api/proveedores')
      .send(proveedorParaActualizar);
    const proveedorId = postRes.body._id;

    const datosActualizados = {
      mail: 'nuevoactualizar@mail.com'
    };
    const patchRes = await adminAgent
      .patch(`/api/proveedores/${proveedorId}`)
      .send(datosActualizados);
    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body._id).toBe(proveedorId);
    expect(patchRes.body.mail).toBe(datosActualizados.mail);
    
    testProveedorId = proveedorId;
  });

  // Test para PATCH /api/proveedores/:id (empleado) - debería fallar
  test('PATCH /api/proveedores/:id debería fallar para empleados', async () => {
    const proveedorParaActualizar = {
      nombre: 'Proveedor Test Update',
      mail: 'testupdate@mail.com',
      tipo_proveedor: 'libreria'
    };
    const postRes = await adminAgent
      .post('/api/proveedores')
      .send(proveedorParaActualizar);
    const proveedorId = postRes.body._id;

    const datosActualizados = {
      mail: 'empleadoupdate@mail.com'
    };
    const patchRes = await empleadoAgent
      .patch(`/api/proveedores/${proveedorId}`)
      .send(datosActualizados);
    expect(patchRes.statusCode).toBe(403);
    
    testProveedorId = proveedorId;
  });

  // Test para DELETE /api/proveedores/:id (admin)
  test('DELETE /api/proveedores/:id debería eliminar un proveedor (admin)', async () => {
    const proveedorParaEliminar = {
      nombre: 'Proveedor para Eliminar',
      mail: 'eliminar@mail.com',
      tipo_proveedor: 'libreria'
    };
    const postRes = await adminAgent
      .post('/api/proveedores')
      .send(proveedorParaEliminar);
    const proveedorId = postRes.body._id;

    const deleteRes = await adminAgent.delete(`/api/proveedores/${proveedorId}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty('mensaje', 'Proveedor eliminado correctamente');

    // Verifica que el proveedor ya no existe
    const getRes = await adminAgent.get(`/api/proveedores/${proveedorId}`);
    expect(getRes.statusCode).toBe(404);
  });

  // Test para DELETE /api/proveedores/:id (empleado) - debería fallar
  test('DELETE /api/proveedores/:id debería fallar para empleados', async () => {
    const proveedorParaEliminar = {
      nombre: 'Proveedor Test Delete',
      mail: 'testdelete@mail.com',
      tipo_proveedor: 'libreria'
    };
    const postRes = await adminAgent
      .post('/api/proveedores')
      .send(proveedorParaEliminar);
    const proveedorId = postRes.body._id;

    const deleteRes = await empleadoAgent.delete(`/api/proveedores/${proveedorId}`);
    expect(deleteRes.statusCode).toBe(403);
    
    testProveedorId = proveedorId;
  });

  // Test para el filtro por tipo en proveedores (?tipo=libreria) (admin)
  test('GET /api/proveedores?tipo=libreria debería retornar solo proveedores de tipo libreria (admin)', async () => {
    // Crea dos proveedores de distinto tipo
    await adminAgent.post('/api/proveedores').send({ nombre: 'Libreria 1', mail: 'l1@mail.com', tipo_proveedor: 'libreria' });
    await adminAgent.post('/api/proveedores').send({ nombre: 'Cafeteria 1', mail: 'c1@mail.com', tipo_proveedor: 'cafeteria' });
    const res = await adminAgent.get('/api/proveedores?tipo=libreria');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every(p => p.tipo_proveedor === 'libreria')).toBe(true);
  });
});