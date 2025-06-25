const request = require('supertest');
const app = require('../app');
const Usuario = require('../models/Usuario');

describe('API de Usuarios', () => {
  let usuarioId;
  let testEmail;

  beforeEach(() => {
    // Generar un email único para cada test
    testEmail = `test.${Date.now()}@usuario.com`;
  });

  afterEach(async () => {
    // Limpiar usuarios de prueba después de cada test
    try {
      await Usuario.deleteMany({ email: { $regex: /test.*@usuario\.com/ } });
    } catch (error) {
      console.log('Error limpiando datos de prueba:', error);
    }
  });

  // Test para GET /api/usuarios
  test('GET /api/usuarios debería retornar todos los usuarios', async () => {
    const res = await request(app).get('/api/usuarios');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para POST /api/usuarios
  test('POST /api/usuarios debería crear un nuevo usuario', async () => {
    const nuevoUsuario = {
      nombre: 'Usuario de Prueba',
      email: testEmail,
      password: '123456',
      rol: 'empleado',
      telefono: '11-1234-5678',
      activo: true
    };
    const res = await request(app)
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
    // La contraseña debe estar hasheada, no ser la original
    expect(res.body.usuario.password).not.toBe(nuevoUsuario.password);
    expect(res.body.usuario.password).toBeDefined();
    
    usuarioId = res.body.usuario._id;
  });

  // Test para POST /api/usuarios con datos faltantes
  test('POST /api/usuarios debería fallar si faltan datos requeridos', async () => {
    const usuarioIncompleto = {
      nombre: 'Usuario Incompleto'
    };
    const res = await request(app)
      .post('/api/usuarios')
      .send(usuarioIncompleto);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test para POST /api/usuarios con email duplicado
  test('POST /api/usuarios debería fallar con email duplicado', async () => {
    // Primero crear un usuario
    const primerUsuario = {
      nombre: 'Primer Usuario',
      email: testEmail,
      password: '123456',
      rol: 'empleado'
    };
    await request(app)
      .post('/api/usuarios')
      .send(primerUsuario);

    // Luego intentar crear otro con el mismo email
    const usuarioDuplicado = {
      nombre: 'Usuario Duplicado',
      email: testEmail, // Mismo email
      password: '123456',
      rol: 'empleado'
    };
    const res = await request(app)
      .post('/api/usuarios')
      .send(usuarioDuplicado);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test para GET /api/usuarios/:id
  test('GET /api/usuarios/:id debería retornar un usuario específico', async () => {
    // Primero crear el usuario para este test
    const nuevoUsuario = {
      nombre: 'Usuario de Prueba',
      email: testEmail,
      password: '123456',
      rol: 'empleado'
    };
    const createRes = await request(app)
      .post('/api/usuarios')
      .send(nuevoUsuario);
    
    const testUsuarioId = createRes.body.usuario._id;
    
    const res = await request(app).get(`/api/usuarios/${testUsuarioId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(testUsuarioId);
    expect(res.body.nombre).toBe('Usuario de Prueba');
    expect(res.body.email).toBe(testEmail);
    // La contraseña debe estar presente pero hasheada
    expect(res.body.password).toBeDefined();
    expect(res.body.password).not.toBe('123456');
  });

  // Test para PUT /api/usuarios/:id
  test('PUT /api/usuarios/:id debería actualizar un usuario existente', async () => {
    // Primero crear el usuario para este test
    const nuevoUsuario = {
      nombre: 'Usuario Original',
      email: testEmail,
      password: '123456',
      rol: 'empleado'
    };
    const createRes = await request(app)
      .post('/api/usuarios')
      .send(nuevoUsuario);
    
    const testUsuarioId = createRes.body.usuario._id;
    
    const usuarioActualizado = {
      nombre: 'Usuario Actualizado',
      email: `actualizado.${testEmail}`,
      rol: 'vendedor',
      telefono: '11-9876-5432',
      activo: false
    };
    const res = await request(app)
      .put(`/api/usuarios/${testUsuarioId}`)
      .send(usuarioActualizado);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario.nombre).toBe(usuarioActualizado.nombre);
    expect(res.body.usuario.email).toBe(usuarioActualizado.email);
    expect(res.body.usuario.rol).toBe(usuarioActualizado.rol);
    expect(res.body.usuario.telefono).toBe(usuarioActualizado.telefono);
    expect(res.body.usuario.activo).toBe(usuarioActualizado.activo);
  });

  // Test para PUT /api/usuarios/:id con cambio de contraseña
  test('PUT /api/usuarios/:id debería actualizar la contraseña', async () => {
    // Primero crear el usuario para este test
    const nuevoUsuario = {
      nombre: 'Usuario Para Password',
      email: testEmail,
      password: '123456',
      rol: 'empleado'
    };
    const createRes = await request(app)
      .post('/api/usuarios')
      .send(nuevoUsuario);
    
    const testUsuarioId = createRes.body.usuario._id;
    
    const usuarioConNuevaPassword = {
      nombre: 'Usuario Para Password',
      email: testEmail,
      password: 'nuevaPassword123',
      rol: 'empleado'
    };
    const res = await request(app)
      .put(`/api/usuarios/${testUsuarioId}`)
      .send(usuarioConNuevaPassword);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body).toHaveProperty('usuario');
    // La contraseña debe estar hasheada en la respuesta
    expect(res.body.usuario.password).toBeDefined();
    expect(res.body.usuario.password).not.toBe(usuarioConNuevaPassword.password);
  });

  // Test para DELETE /api/usuarios/:id
  test('DELETE /api/usuarios/:id debería eliminar un usuario', async () => {
    // Primero crear el usuario para este test
    const nuevoUsuario = {
      nombre: 'Usuario Para Eliminar',
      email: testEmail,
      password: '123456',
      rol: 'empleado'
    };
    const createRes = await request(app)
      .post('/api/usuarios')
      .send(nuevoUsuario);
    
    const testUsuarioId = createRes.body.usuario._id;
    
    const res = await request(app).delete(`/api/usuarios/${testUsuarioId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
    
    // Verificar que el usuario fue eliminado
    const getRes = await request(app).get(`/api/usuarios/${testUsuarioId}`);
    expect(getRes.statusCode).toBe(404);
  });

  // Test para GET /api/usuarios/:id con ID inexistente
  test('GET /api/usuarios/:id debería retornar 404 para usuario inexistente', async () => {
    const res = await request(app).get('/api/usuarios/507f1f77bcf86cd799439011');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  // Test para PUT /api/usuarios/:id con ID inexistente
  test('PUT /api/usuarios/:id debería retornar 404 para usuario inexistente', async () => {
    const res = await request(app)
      .put('/api/usuarios/507f1f77bcf86cd799439011')
      .send({ nombre: 'Test' });
    expect(res.statusCode).toBe(404);
  });

  // Test para DELETE /api/usuarios/:id con ID inexistente
  test('DELETE /api/usuarios/:id debería retornar 404 para usuario inexistente', async () => {
    const res = await request(app).delete('/api/usuarios/507f1f77bcf86cd799439011');
    expect(res.statusCode).toBe(404);
  });
});