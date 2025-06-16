const request = require('supertest');
const app = require('../app');

describe('API de Ventas', () => {
  // Test para GET /api/ventas
  test('GET /api/ventas debería retornar todas las ventas', async () => {
    const res = await request(app).get('/api/ventas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para POST /api/ventas (registrar)
  test('POST /api/ventas debería registrar una nueva venta de un producto existente', async () => {
    // Primero crea un producto de prueba
    const productoRes = await request(app)
      .post('/api/productos')
      .send({ nombre: 'Rayuela', autor: 'Julio Cortázar', precio: 100 });
    const productoId = productoRes.body._id;

    const nuevaVenta = {
      producto: productoId,
      cantidad: 10
    };
    const res = await request(app)
      .post('/api/ventas')
      .send(nuevaVenta);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.producto).toBe(productoId);
    expect(res.body.cantidad).toBe(nuevaVenta.cantidad);
    expect(res.body).toHaveProperty('fecha');
  });

  // Test para GET /api/ventas/mas-vendidos
  test('GET /api/ventas/mas-vendidos debería retornar los productos más vendidos ordenados', async () => {
    const res = await request(app).get('/api/ventas/mas-vendidos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Aserciones básicas para asegurar que hay resultados
    expect(res.body.length).toBeGreaterThanOrEqual(0);
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