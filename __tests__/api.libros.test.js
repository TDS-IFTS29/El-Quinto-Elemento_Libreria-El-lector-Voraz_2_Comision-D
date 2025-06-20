const request = require('supertest');
const app = require('../app');

let proveedorLibreriaId;

beforeAll(async () => {
  // Crea un proveedor de tipo 'libreria' para usar en los tests
  const proveedorRes = await request(app)
    .post('/api/proveedores')
    .send({
      nombre: 'Proveedor Test Libros',
      mail: 'libros@test.com',
      tipo_proveedor: 'libreria'
    });
  proveedorLibreriaId = proveedorRes.body._id;
});

describe('API Libros', () => {
  // Test para GET /api/libros
  test('GET /api/libros debería retornar todos los libros', async () => {
    const res = await request(app).get('/api/libros');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para POST /api/libros con todos los campos requeridos
  test('POST /api/libros debería crear un nuevo libro con stock y género y proveedor', async () => {
    const nuevoLibro = {
      nombre: 'Nuevo Libro de Prueba',
      autor: 'Autor de Prueba',
      precio: 19.99,
      genero: 'Ficción',
      stock: 10,
      proveedor: proveedorLibreriaId
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
    expect(res.body.proveedor).toHaveProperty('_id', proveedorLibreriaId);
    expect(res.body.proveedor).toHaveProperty('tipo_proveedor', 'libreria');
  });

  test('POST /api/libros falla si falta proveedor', async () => {
    const nuevoLibro = {
      nombre: 'Libro sin proveedor',
      autor: 'Autor',
      precio: 10,
      genero: 'Test',
      stock: 1
    };
    const res = await request(app)
      .post('/api/libros')
      .send(nuevoLibro);
    // Puede devolver 400 o 500 según la validación, pero nunca 201
    expect(res.statusCode).not.toBe(201);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/libros falla si proveedor no es de tipo libreria', async () => {
    // Crea proveedor de otro tipo
    const prov = await request(app)
      .post('/api/proveedores')
      .send({ nombre: 'No Libreria', mail: 'no@lib.com', tipo_proveedor: 'cafeteria' });
    const nuevoLibro = {
      nombre: 'Libro proveedor mal',
      autor: 'Autor',
      precio: 10,
      genero: 'Test',
      stock: 1,
      proveedor: prov.body._id
    };
    const res = await request(app)
      .post('/api/libros')
      .send(nuevoLibro);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test para GET /api/libros/:id
  test('GET /api/libros/:id debería retornar un libro específico', async () => {
    const libroParaObtener = {
      nombre: 'Libro para Obtener',
      autor: 'Autor Obtener',
      precio: 25.50,
      genero: 'Aventura',
      stock: 5,
      proveedor: proveedorLibreriaId
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
    expect(getRes.body.proveedor).toHaveProperty('_id', proveedorLibreriaId);
    expect(getRes.body.proveedor).toHaveProperty('tipo_proveedor', 'libreria');
  });

  // Test para PATCH /api/libros/:id
  test('PATCH /api/libros/:id debería actualizar un libro existente y su proveedor', async () => {
    const libroParaActualizar = {
      nombre: 'Libro para Actualizar',
      autor: 'Autor Actualizar',
      precio: 30.00,
      genero: 'Drama',
      stock: 7,
      proveedor: proveedorLibreriaId
    };
    const postRes = await request(app)
      .post('/api/libros')
      .send(libroParaActualizar);
    const libroId = postRes.body._id;

    // Crea otro proveedor válido
    const prov2 = await request(app)
      .post('/api/proveedores')
      .send({ nombre: 'Proveedor 2', mail: 'prov2@lib.com', tipo_proveedor: 'libreria' });

    const datosActualizados = {
      precio: 35.75,
      stock: 12,
      proveedor: prov2.body._id
    };
    const patchRes = await request(app)
      .patch(`/api/libros/${libroId}`)
      .send(datosActualizados);
    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body.precio).toBe(datosActualizados.precio);
    expect(patchRes.body.stock).toBe(datosActualizados.stock);
    expect(patchRes.body.proveedor).toHaveProperty('_id', prov2.body._id);
    expect(patchRes.body.proveedor).toHaveProperty('tipo_proveedor', 'libreria');
  });

  // Test para DELETE /api/libros/:id
  test('DELETE /api/libros/:id debería eliminar un libro', async () => {
    const libroParaEliminar = {
      nombre: 'Libro para Eliminar',
      autor: 'Autor Eliminar',
      precio: 15.00,
      genero: 'Ensayo',
      stock: 3,
      proveedor: proveedorLibreriaId
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
