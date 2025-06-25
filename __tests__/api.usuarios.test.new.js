const request = require('supertest');
const app = require('../app');
const Usuario = require('../models/Usuario');
const { crearUsuarioPrueba, loginComoUsuario, limpiarUsuariosPrueba } = require('./test-helpers');

describe('API de Usuarios', () => {
  let usuarioId;
  let testEmail;
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

  beforeEach(() => {
    // Generar un email único para cada test
    testEmail = `test.${Date.now()}@usuario.com`;
  });

  afterEach(async () => {
    // Limpiar usuarios de prueba después de cada test (excepto los usuarios base)
    try {
      await Usuario.deleteMany({ 
        email: { $regex: /test.*@usuario\.com/ },
        _id: { $nin: [usuarioAdmin._id, usuarioEmpleado._id] }
      });
    } catch (error) {
      console.log('Error limpiando datos de prueba:', error);
    }
  });

  afterAll(async () => {
    // Limpiar todos los usuarios de prueba al final
    await limpiarUsuariosPrueba();
  });

  // Test para GET /api/usuarios
  test('GET /api/usuarios debería retornar todos los usuarios (admin)', async () => {
    const res = await adminAgent.get('/api/usuarios');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/usuarios debería fallar para empleados', async () => {
    const res = await empleadoAgent.get('/api/usuarios');
    expect(res.statusCode).toBe(403);
  });

  // Test para POST /api/usuarios
  test('POST /api/usuarios debería crear un nuevo usuario (admin)', async () => {
    const nuevoUsuario = {
      nombre: 'Usuario de Prueba',
      email: testEmail,
      password: '123456',
      rol: 'empleado',
      telefono: '11-1234-5678',
      activo: true
    };
    const res = await adminAgent
      .post('/api/usuarios')
      .send(nuevoUsuario);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario).toHaveProperty('_id');
    expect(res.body.usuario.nombre).toBe(nuevoUsuario.nombre);
    expect(res.body.usuario.email).toBe(nuevoUsuario.email);
    expect(res.body.usuario.rol).toBe(nuevoUsuario.rol);
    expect(res.body.usuario.telefono).toBe(nuevoUsuario.telefono);
    expect(res.body.usuario.activo).toBe(nuevoUsuario.activo);
    // La contraseña NO debe estar en la respuesta por seguridad
    expect(res.body.usuario.password).toBeUndefined();
    
    usuarioId = res.body.usuario._id;
  });

  test('POST /api/usuarios debería fallar para empleados', async () => {
    const nuevoUsuario = {
      nombre: 'Usuario Test',
      email: testEmail,
      password: 'password123',
      rol: 'empleado'
    };

    const res = await empleadoAgent
      .post('/api/usuarios')
      .send(nuevoUsuario);

    expect(res.statusCode).toBe(403);
  });

  // Test para POST /api/usuarios con datos faltantes
  test('POST /api/usuarios debería fallar si faltan datos requeridos (admin)', async () => {
    const usuarioIncompleto = {
      nombre: 'Usuario Incompleto'
      // Faltan email, password y rol
    };

    const res = await adminAgent
      .post('/api/usuarios')
      .send(usuarioIncompleto);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test para POST /api/usuarios con email duplicado
  test('POST /api/usuarios debería fallar con email duplicado (admin)', async () => {
    const primerUsuario = {
      nombre: 'Primer Usuario',
      email: testEmail,
      password: '123456',
      rol: 'empleado'
    };

    // Crear primer usuario
    await adminAgent
      .post('/api/usuarios')
      .send(primerUsuario);

    // Intentar crear segundo usuario con mismo email
    const usuarioDuplicado = {
      nombre: 'Usuario Duplicado',
      email: testEmail,
      password: '654321',
      rol: 'admin'
    };

    const res = await adminAgent
      .post('/api/usuarios')
      .send(usuarioDuplicado);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test para GET /api/usuarios/:id
  test('GET /api/usuarios/:id debería retornar un usuario específico (admin)', async () => {
    const nuevoUsuario = {
      nombre: 'Usuario para Obtener',
      email: testEmail,
      password: '123456',
      rol: 'empleado'
    };

    const createRes = await adminAgent
      .post('/api/usuarios')
      .send(nuevoUsuario);

    const testUsuarioId = createRes.body.usuario._id;

    const res = await adminAgent.get(`/api/usuarios/${testUsuarioId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(testUsuarioId);
    expect(res.body.nombre).toBe(nuevoUsuario.nombre);
    expect(res.body.email).toBe(nuevoUsuario.email);
    expect(res.body.rol).toBe(nuevoUsuario.rol);
    expect(res.body).not.toHaveProperty('password');
  });

  test('GET /api/usuarios/:id empleado puede ver solo su propio perfil', async () => {
    const res = await empleadoAgent.get(`/api/usuarios/${usuarioEmpleado._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(usuarioEmpleado._id.toString());
  });

  test('GET /api/usuarios/:id empleado no puede ver otros perfiles', async () => {
    const res = await empleadoAgent.get(`/api/usuarios/${usuarioAdmin._id}`);
    expect(res.statusCode).toBe(403);
  });

  // Test para PUT /api/usuarios/:id
  test('PUT /api/usuarios/:id debería actualizar un usuario existente (admin)', async () => {
    const nuevoUsuario = {
      nombre: 'Usuario Para Actualizar',
      email: testEmail,
      password: '123456',
      rol: 'empleado'
    };

    const createRes = await adminAgent
      .post('/api/usuarios')
      .send(nuevoUsuario);

    const testUsuarioId = createRes.body.usuario._id;

    const usuarioActualizado = {
      nombre: 'Usuario Actualizado',
      email: nuevoUsuario.email,
      rol: 'admin',
      activo: false
    };

    const res = await adminAgent
      .put(`/api/usuarios/${testUsuarioId}`)
      .send(usuarioActualizado);

    expect(res.statusCode).toBe(200);
    expect(res.body.nombre).toBe(usuarioActualizado.nombre);
    expect(res.body.rol).toBe(usuarioActualizado.rol);
    expect(res.body.activo).toBe(usuarioActualizado.activo);
  });

  test('PUT /api/usuarios/:id empleado puede actualizar solo su propio perfil', async () => {
    const usuarioActualizado = {
      nombre: 'Empleado Actualizado',
      email: usuarioEmpleado.email
    };

    const res = await empleadoAgent
      .put(`/api/usuarios/${usuarioEmpleado._id}`)
      .send(usuarioActualizado);

    expect(res.statusCode).toBe(200);
    expect(res.body.nombre).toBe(usuarioActualizado.nombre);
  });

  test('PUT /api/usuarios/:id empleado no puede actualizar otros perfiles', async () => {
    const usuarioActualizado = {
      nombre: 'Admin Hackeado'
    };

    const res = await empleadoAgent
      .put(`/api/usuarios/${usuarioAdmin._id}`)
      .send(usuarioActualizado);

    expect(res.statusCode).toBe(403);
  });

  // Test para cambio de contraseña
  test('PUT /api/usuarios/:id debería actualizar la contraseña (admin)', async () => {
    const nuevoUsuario = {
      nombre: 'Usuario Para Password',
      email: testEmail,
      password: '123456',
      rol: 'empleado'
    };

    const createRes = await adminAgent
      .post('/api/usuarios')
      .send(nuevoUsuario);

    const testUsuarioId = createRes.body.usuario._id;

    const usuarioConNuevaPassword = {
      nombre: 'Usuario Para Password',
      email: nuevoUsuario.email,
      password: 'nuevapassword',
      rol: 'empleado'
    };

    const res = await adminAgent
      .put(`/api/usuarios/${testUsuarioId}`)
      .send(usuarioConNuevaPassword);

    expect(res.statusCode).toBe(200);
    expect(res.body.password).not.toBe(nuevoUsuario.password);
    expect(res.body.password).not.toBe(usuarioConNuevaPassword.password);
  });

  // Test para DELETE /api/usuarios/:id
  test('DELETE /api/usuarios/:id debería eliminar un usuario (admin)', async () => {
    const nuevoUsuario = {
      nombre: 'Usuario Para Eliminar',
      email: testEmail,
      password: '123456',
      rol: 'empleado'
    };

    const createRes = await adminAgent
      .post('/api/usuarios')
      .send(nuevoUsuario);

    const testUsuarioId = createRes.body.usuario._id;

    const res = await adminAgent.delete(`/api/usuarios/${testUsuarioId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje');

    // Verificar que el usuario ya no existe
    const getRes = await adminAgent.get(`/api/usuarios/${testUsuarioId}`);
    expect(getRes.statusCode).toBe(404);
  });

  test('DELETE /api/usuarios/:id debería fallar para empleados', async () => {
    const res = await empleadoAgent.delete(`/api/usuarios/${usuarioAdmin._id}`);
    expect(res.statusCode).toBe(403);
  });

  // Test para casos de error
  test('GET /api/usuarios/:id debería retornar 404 para usuario inexistente (admin)', async () => {
    const res = await adminAgent.get('/api/usuarios/507f1f77bcf86cd799439011');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /api/usuarios/:id debería retornar 404 para usuario inexistente (admin)', async () => {
    const res = await adminAgent
      .put('/api/usuarios/507f1f77bcf86cd799439011')
      .send({ nombre: 'Test' });
    expect(res.statusCode).toBe(404);
  });

  test('DELETE /api/usuarios/:id debería retornar 404 para usuario inexistente (admin)', async () => {
    const res = await adminAgent.delete('/api/usuarios/507f1f77bcf86cd799439011');
    expect(res.statusCode).toBe(404);
  });

  // Test para /api/usuarios/me
  test('GET /api/usuarios/me debería retornar la información del usuario actual', async () => {
    const res = await empleadoAgent.get('/api/usuarios/me');
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(usuarioEmpleado._id.toString());
    expect(res.body.rol).toBe('empleado');
  });

  test('GET /api/usuarios/me debería fallar sin autenticación', async () => {
    const res = await request(app).get('/api/usuarios/me');
    expect(res.statusCode).toBe(401);
  });
});
