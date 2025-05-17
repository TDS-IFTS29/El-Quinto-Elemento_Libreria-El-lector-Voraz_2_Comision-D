const request = require('supertest');
const app = require('../app');
const fs = require('fs').promises;
const path = require('path');

const ventasFilePath = path.join(__dirname, '../data/ventas.json');
let originalVentasData;

describe('API de Ventas', () => {
  beforeAll(async () => {
    // Guarda el estado original del archivo de ventas antes de todos los tests
    originalVentasData = await fs.readFile(ventasFilePath, 'utf-8');
  });

  afterEach(async () => {
    // Restaura el estado original del archivo de ventas después de cada test
    await fs.writeFile(ventasFilePath, originalVentasData);
  });

  // Test para GET /api/ventas
  test('GET /api/ventas debería retornar todas las ventas', async () => {
    const res = await request(app).get('/api/ventas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test para POST /api/ventas (registrar)
  test('POST /api/ventas debería registrar una nueva venta de un producto existente', async () => {
    const nuevaVenta = {
      producto: 'Rayuela',
      cantidad: 10
    };
    const res = await request(app)
      .post('/api/ventas')
      .send(nuevaVenta);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.producto).toBe(nuevaVenta.producto);
    expect(res.body.cantidad).toBe(nuevaVenta.cantidad);
    expect(res.body).toHaveProperty('fecha');
  });

  // Test para GET /api/ventas/mas-vendidos
  test('GET /api/ventas/mas-vendidos debería retornar los productos más vendidos ordenados', async () => {
    const res = await request(app).get('/api/ventas/mas-vendidos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Aserciones basadas en los datos proporcionados
    expect(res.body.length).toBeGreaterThan(0); // Asegura que hay resultados
    expect(res.body[0]).toHaveProperty('producto', 'Rayuela');
    expect(res.body[0]).toHaveProperty('total', 74);
    expect(res.body[1]).toHaveProperty('producto', '2001');
    expect(res.body[1]).toHaveProperty('total', 35);
  });

  // Test para GET /api/ventas/semana
  test('GET /api/ventas/semana debería retornar las ventas de la última semana', async () => {
    const res = await request(app).get('/api/ventas/ventas-semana');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(19);
    const sieteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;
    res.body.forEach(venta => {
      expect(new Date(venta.fecha).getTime()).toBeGreaterThanOrEqual(sieteDiasAtras);
    });
  });
});