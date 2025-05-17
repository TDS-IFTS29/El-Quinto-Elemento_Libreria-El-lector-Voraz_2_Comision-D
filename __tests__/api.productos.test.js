const request = require('supertest');
const app = require('../app'); // Asegúrate de que app.js exporta la instancia de Express

describe('API de Productos', () => {
  // Test para GET /api/productos
  test('GET /api/productos debería retornar todos los productos', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Puedes añadir más aserciones sobre la estructura de los objetos Producto si es necesario
  });

  // Test para POST /api/productos
  test('POST /api/productos debería crear un nuevo producto', async () => {
    const nuevoProducto = {
      nombre: 'Nuevo Libro de Prueba',
      autor: 'Autor de Prueba',
      precio: 19.99
    };
    const res = await request(app)
      .post('/api/productos')
      .send(nuevoProducto);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe(nuevoProducto.nombre);
    expect(res.body.autor).toBe(nuevoProducto.autor);
    expect(res.body.precio).toBe(nuevoProducto.precio);
  });

 
  test('GET /api/productos/:id debería retornar un producto específico', async () => {
    // Primero, crea un producto para asegurarte de que existe uno para obtener
    const productoParaObtener = {
      nombre: 'Libro para Obtener',
      autor: 'Autor Obtener',
      precio: 25.50
    };
    const postRes = await request(app)
      .post('/api/productos')
      .send(productoParaObtener);
    const productoId = postRes.body.id;

    const getRes = await request(app).get(`/api/productos/${productoId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.id).toBe(productoId);
    expect(getRes.body.nombre).toBe(productoParaObtener.nombre);
  });

  // Test para PATCH /api/productos/:id
  test('PATCH /api/productos/:id debería actualizar un producto existente', async () => {
    // Primero, crea un producto para actualizar
    const productoParaActualizar = {
      nombre: 'Libro para Actualizar',
      autor: 'Autor Actualizar',
      precio: 30.00
    };
    const postRes = await request(app)
      .post('/api/productos')
      .send(productoParaActualizar);
    const productoId = postRes.body.id;

    const datosActualizados = {
      precio: 35.75
    };
    const patchRes = await request(app)
      .patch(`/api/productos/${productoId}`)
      .send(datosActualizados);
    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body.id).toBe(productoId);
    expect(patchRes.body.precio).toBe(datosActualizados.precio);
  });

  // Test para DELETE /api/productos/:id
  test('DELETE /api/productos/:id debería eliminar un producto', async () => {
    // Primero, crea un producto para eliminar
    const productoParaEliminar = {
      nombre: 'Libro para Eliminar',
      autor: 'Autor Eliminar',
      precio: 40.00
    };
    const postRes = await request(app)
      .post('/api/productos')
      .send(productoParaEliminar);
    const productoId = postRes.body.id;

    const deleteRes = await request(app).delete(`/api/productos/${productoId}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty('mensaje', 'Producto eliminado correctamente');

    // Verifica que el producto ya no existe
    const getRes = await request(app).get(`/api/productos/${productoId}`);
    expect(getRes.statusCode).toBe(404);
  });
});