const request = require('supertest');
const app = require('../app');

describe('API de Proveedores', () => {
  // Test para GET /api/proveedores
  test('GET /api/proveedores debería retornar todos los proveedores', async () => {
    const res = await request(app).get('/api/proveedores');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para POST /api/proveedores
  test('POST /api/proveedores debería crear un nuevo proveedor', async () => {
    const nuevoProveedor = {
      nombre: 'Nuevo Proveedor de Prueba',
      mail: 'proveedorprueba@mail.com',
      tipo_proveedor: 'libreria'
    };
    const res = await request(app)
      .post('/api/proveedores')
      .send(nuevoProveedor);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.nombre).toBe(nuevoProveedor.nombre);
    expect(res.body.mail).toBe(nuevoProveedor.mail);
  });

  // Test para GET /api/proveedores/:id
  test('GET /api/proveedores/:id debería retornar un proveedor específico', async () => {
    const proveedorParaObtener = {
      nombre: 'Proveedor para Obtener',
      mail: 'obtener@mail.com',
      tipo_proveedor: 'libreria'
    };
    const postRes = await request(app)
      .post('/api/proveedores')
      .send(proveedorParaObtener);
    const proveedorId = postRes.body._id;

    const getRes = await request(app).get(`/api/proveedores/${proveedorId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body._id).toBe(proveedorId);
    expect(getRes.body.nombre).toBe(proveedorParaObtener.nombre);
    expect(getRes.body.mail).toBe(proveedorParaObtener.mail);
  });

  // Test para PATCH /api/proveedores/:id
  test('PATCH /api/proveedores/:id debería actualizar un proveedor existente', async () => {
    const proveedorParaActualizar = {
      nombre: 'Proveedor para Actualizar',
      mail: 'actualizar@mail.com',
      tipo_proveedor: 'libreria'
    };
    const postRes = await request(app)
      .post('/api/proveedores')
      .send(proveedorParaActualizar);
    const proveedorId = postRes.body._id;

    const datosActualizados = {
      mail: 'nuevoactualizar@mail.com'
    };
    const patchRes = await request(app)
      .patch(`/api/proveedores/${proveedorId}`)
      .send(datosActualizados);
    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body._id).toBe(proveedorId);
    expect(patchRes.body.mail).toBe(datosActualizados.mail);
  });

  // Test para DELETE /api/proveedores/:id
  test('DELETE /api/proveedores/:id debería eliminar un proveedor', async () => {
    const proveedorParaEliminar = {
      nombre: 'Proveedor para Eliminar',
      mail: 'eliminar@mail.com',
      tipo_proveedor: 'libreria'
    };
    const postRes = await request(app)
      .post('/api/proveedores')
      .send(proveedorParaEliminar);
    const proveedorId = postRes.body._id;

    const deleteRes = await request(app).delete(`/api/proveedores/${proveedorId}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty('mensaje', 'Proveedor eliminado correctamente');

    // Verifica que el proveedor ya no existe
    const getRes = await request(app).get(`/api/proveedores/${proveedorId}`);
    expect(getRes.statusCode).toBe(404);
  });
});