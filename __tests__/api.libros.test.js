const request = require('supertest');
const app = require('../app');

describe('API Libros', () => {
  // Test para GET /api/libros
  test('GET /api/libros debería retornar todos los libros', async () => {
    const res = await request(app).get('/api/libros');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para POST /api/libros con todos los campos requeridos
  test('POST /api/libros debería crear un nuevo libro con stock y género', async () => {
    const nuevoLibro = {
      nombre: 'Nuevo Libro de Prueba',
      autor: 'Autor de Prueba',
      precio: 19.99,
      genero: 'Ficción',
      stock: 10
    };
    const res = await request(app)
      .post('/api/libros')
      .send(nuevoLibro);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.nombre).toBe(nuevoLibro.nombre);
    expect(res.body.autor).toBe(nuevoLibro.autor);
    expect(res.body.precio).toBe(nuevoLibro.precio);
    expect(res.body.genero).toBe(nuevoLibro.genero);
    expect(res.body.stock).toBe(nuevoLibro.stock);
  });

  // Test para GET /api/libros/:id
  test('GET /api/libros/:id debería retornar un libro específico', async () => {
    const libroParaObtener = {
      nombre: 'Libro para Obtener',
      autor: 'Autor Obtener',
      precio: 25.50,
      genero: 'Aventura',
      stock: 5
    };
    const postRes = await request(app)
      .post('/api/libros')
      .send(libroParaObtener);
    const libroId = postRes.body._id;

    const getRes = await request(app).get(`/api/libros/${libroId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body._id).toBe(libroId);
    expect(getRes.body.nombre).toBe(libroParaObtener.nombre);
    expect(getRes.body.genero).toBe(libroParaObtener.genero);
  });

  // Test para PATCH /api/libros/:id
  test('PATCH /api/libros/:id debería actualizar un libro existente', async () => {
    const libroParaActualizar = {
      nombre: 'Libro para Actualizar',
      autor: 'Autor Actualizar',
      precio: 30.00,
      genero: 'Drama',
      stock: 7
    };
    const postRes = await request(app)
      .post('/api/libros')
      .send(libroParaActualizar);
    const libroId = postRes.body._id;

    const datosActualizados = {
      precio: 35.75,
      stock: 12
    };
    const patchRes = await request(app)
      .patch(`/api/libros/${libroId}`)
      .send(datosActualizados);
    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body.precio).toBe(datosActualizados.precio);
    expect(patchRes.body.stock).toBe(datosActualizados.stock);
  });

  // Test para DELETE /api/libros/:id
  test('DELETE /api/libros/:id debería eliminar un libro', async () => {
    const libroParaEliminar = {
      nombre: 'Libro para Eliminar',
      autor: 'Autor Eliminar',
      precio: 15.00,
      genero: 'Ensayo',
      stock: 3
    };
    const postRes = await request(app)
      .post('/api/libros')
      .send(libroParaEliminar);
    const libroId = postRes.body._id;

    const deleteRes = await request(app).delete(`/api/libros/${libroId}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty('mensaje');
  });
});
