const request = require('supertest');
const app = require('../app'); // Asegúrate de que app.js exporta la instancia de Express

describe('API de Proveedores', () => {
  // Test para GET /api/proveedores
  test('GET /api/proveedores debería retornar todos los proveedores', async () => {
    const res = await request(app).get('/api/proveedores');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Puedes añadir más aserciones sobre la estructura de los objetos Proveedor si es necesario
  });

  // Test para POST /api/proveedores
  test('POST /api/proveedores debería crear un nuevo proveedor', async () => {
    const nuevoProveedor = {
      nombre: 'Nuevo Proveedor de Prueba',
      contacto: 'Contacto de Prueba'
    };
    const res = await request(app)
      .post('/api/proveedores')
      .send(nuevoProveedor);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe(nuevoProveedor.nombre);
    expect(res.body.contacto).toBe(nuevoProveedor.contacto);
  });

  // Test para GET /api/proveedores/:id
  test('GET /api/proveedores/:id debería retornar un proveedor específico', async () => {
    // Primero, crea un proveedor para asegurarte de que existe uno para obtener
    const proveedorParaObtener = {
      nombre: 'Proveedor para Obtener',
      contacto: 'Contacto Obtener'
    };
    const postRes = await request(app)
      .post('/api/proveedores')
      .send(proveedorParaObtener);
    const proveedorId = postRes.body.id;

    const getRes = await request(app).get(`/api/proveedores/${proveedorId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.id).toBe(proveedorId);
    expect(getRes.body.nombre).toBe(proveedorParaObtener.nombre);
  });

  // Test para PATCH /api/proveedores/:id
  test('PATCH /api/proveedores/:id debería actualizar un proveedor existente', async () => {
    // Primero, crea un proveedor para actualizar
    const proveedorParaActualizar = {
      nombre: 'Proveedor para Actualizar',
      contacto: 'Contacto Actualizar'
    };
    const postRes = await request(app)
      .post('/api/proveedores')
      .send(proveedorParaActualizar);
    const proveedorId = postRes.body.id;

    const datosActualizados = {
      contacto: 'Nuevo Contacto'
    };
    const patchRes = await request(app)
      .patch(`/api/proveedores/${proveedorId}`)
      .send(datosActualizados);
    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body.id).toBe(proveedorId);
    expect(patchRes.body.contacto).toBe(datosActualizados.contacto);
  });

  // Test para DELETE /api/proveedores/:id
  test('DELETE /api/proveedores/:id debería eliminar un proveedor', async () => {
    // Primero, crea un proveedor para eliminar
    const proveedorParaEliminar = {
      nombre: 'Proveedor para Eliminar',
      contacto: 'Contacto Eliminar'
    };
    const postRes = await request(app)
      .post('/api/proveedores')
      .send(proveedorParaEliminar);
    const proveedorId = postRes.body.id;

    const deleteRes = await request(app).delete(`/api/proveedores/${proveedorId}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty('mensaje', 'Proveedor eliminado correctamente');

    // Verifica que el proveedor ya no existe
    const getRes = await request(app).get(`/api/proveedores/${proveedorId}`);
    expect(getRes.statusCode).toBe(404);
  });
});