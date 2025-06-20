const request = require('supertest');
const app = require('../app');

describe('API de Ventas de Libros', () => {
  // Test para GET /api/ventas (todas las ventas)
  test('GET /api/ventas debería retornar todas las ventas', async () => {
    const res = await request(app).get('/api/ventas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para POST /api/ventas (registrar venta)
  test('POST /api/ventas debería registrar una nueva venta de un libro existente y actualizar stock', async () => {
    // Primero crea un libro de prueba
    const libroRes = await request(app)
      .post('/api/libros')
      .send({ nombre: 'Rayuela', autor: 'Julio Cortázar', precio: 100, genero: 'Novela', stock: 20 });
    const libroId = libroRes.body._id;

    const nuevaVenta = {
      libro: libroId,
      cantidad: 5
    };
    const res = await request(app)
      .post('/api/ventas')
      .send(nuevaVenta);
    expect(res.statusCode).toBe(201);
    // Ahora se espera el objeto venta con los campos históricos
    expect(res.body).toHaveProperty('libro', libroId);
    expect(res.body).toHaveProperty('nombreLibro', 'Rayuela');
    expect(res.body).toHaveProperty('autorLibro', 'Julio Cortázar');
    expect(res.body).toHaveProperty('generoLibro', 'Novela');
    expect(res.body).toHaveProperty('precioLibro', 100);
    expect(res.body).toHaveProperty('cantidad', 5);
    expect(res.body).toHaveProperty('fecha');

    // Verifica que el stock se haya actualizado
    const libroActualizado = await request(app).get(`/api/libros/${libroId}`);
    expect(libroActualizado.body.stock).toBe(15);
  });

  // Test para GET /api/ventas/mas-vendidos
  test('GET /api/ventas/mas-vendidos debería retornar los libros más vendidos', async () => {
    const res = await request(app).get('/api/ventas/mas-vendidos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para GET /api/ventas/ventas-semana
  test('GET /api/ventas/ventas-semana debería retornar las ventas de la última semana', async () => {
    const res = await request(app).get('/api/ventas/ventas-semana');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Verifica que todas las ventas sean de la última semana
    const sieteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;
    res.body.forEach(venta => {
      expect(new Date(venta.fecha).getTime()).toBeGreaterThanOrEqual(sieteDiasAtras);
    });
  });
});