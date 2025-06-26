const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { crearUsuarioPrueba, loginComoUsuario, limpiarUsuariosPrueba } = require('./test-helpers');

describe('API Cafetería', () => {
  let employeeAgent;
  let adminAgent;
  let testCafeteriaId;

  beforeAll(async () => {
    // Crear usuarios de prueba
    const empleado = await crearUsuarioPrueba('empleado');
    const admin = await crearUsuarioPrueba('admin');
    
    // Iniciar sesión con cada usuario
    employeeAgent = await loginComoUsuario(app, empleado);
    adminAgent = await loginComoUsuario(app, admin);
  });

  afterAll(async () => {
    await limpiarUsuariosPrueba();
  });

  describe('GET /api/cafeteria', () => {
    test('debe obtener todos los productos de cafetería', async () => {
      const response = await employeeAgent
        .get('/api/cafeteria')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verificar estructura de los items
      if (response.body.length > 0) {
        const item = response.body[0];
        expect(item).toHaveProperty('_id');
        expect(item).toHaveProperty('nombre');
        expect(item).toHaveProperty('descripcion');
        expect(item).toHaveProperty('precio');
        expect(item).toHaveProperty('stock');
        expect(item).toHaveProperty('categoria');
        
        testCafeteriaId = item._id;
      }
    });

    test('debe requerir autenticación', async () => {
      await request(app)
        .get('/api/cafeteria')
        .expect(401);
    });
  });

  describe('POST /api/cafeteria', () => {
    test('admin debe poder crear nuevo producto de cafetería', async () => {
      const nuevoItem = {
        nombre: 'Test Café',
        descripcion: 'Café de prueba',
        precio: 1000,
        stock: 10,
        stockMinimo: 5,
        categoria: 'bebidas'
      };

      const response = await adminAgent
        .post('/api/cafeteria')
        .send(nuevoItem)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.nombre).toBe(nuevoItem.nombre);
      expect(response.body.precio).toBe(nuevoItem.precio);
      expect(response.body.categoria).toBe(nuevoItem.categoria);
      
      testCafeteriaId = response.body._id;
    });

    test('empleado no debe poder crear producto de cafetería', async () => {
      const nuevoItem = {
        nombre: 'Test Café Empleado',
        descripcion: 'Café de prueba empleado',
        precio: 1000,
        stock: 10,
        categoria: 'bebidas'
      };

      await employeeAgent
        .post('/api/cafeteria')
        .send(nuevoItem)
        .expect(403);
    });

    test('debe requerir campos obligatorios', async () => {
      const itemIncompleto = {
        nombre: 'Test Café Incompleto'
        // Faltan campos obligatorios
      };

      await adminAgent
        .post('/api/cafeteria')
        .send(itemIncompleto)
        .expect(400);
    });
  });

  describe('GET /api/cafeteria/:id', () => {
    test('debe obtener un producto específico', async () => {
      if (!testCafeteriaId) {
        const items = await employeeAgent.get('/api/cafeteria');
        testCafeteriaId = items.body[0]._id;
      }

      const response = await employeeAgent
        .get(`/api/cafeteria/${testCafeteriaId}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBe(testCafeteriaId);
    });

    test('debe retornar 404 para ID inválido', async () => {
      const idInvalido = new mongoose.Types.ObjectId();
      
      await employeeAgent
        .get(`/api/cafeteria/${idInvalido}`)
        .expect(404);
    });
  });

  describe('PUT /api/cafeteria/:id', () => {
    test('admin debe poder actualizar producto', async () => {
      if (!testCafeteriaId) {
        const items = await employeeAgent.get('/api/cafeteria');
        testCafeteriaId = items.body[0]._id;
      }

      const datosActualizados = {
        nombre: 'Café Actualizado',
        descripcion: 'Descripción actualizada',
        precio: 1200,
        stock: 15,
        categoria: 'bebidas'
      };

      const response = await adminAgent
        .put(`/api/cafeteria/${testCafeteriaId}`)
        .send(datosActualizados)
        .expect(200);

      expect(response.body.nombre).toBe(datosActualizados.nombre);
      expect(response.body.precio).toBe(datosActualizados.precio);
    });

    test('empleado no debe poder actualizar producto', async () => {
      if (!testCafeteriaId) {
        const items = await employeeAgent.get('/api/cafeteria');
        testCafeteriaId = items.body[0]._id;
      }

      const datosActualizados = {
        nombre: 'Café Empleado Update',
        precio: 1100
      };

      await employeeAgent
        .put(`/api/cafeteria/${testCafeteriaId}`)
        .send(datosActualizados)
        .expect(403);
    });
  });

  describe('DELETE /api/cafeteria/:id', () => {
    test('admin debe poder eliminar producto', async () => {
      // Crear un producto específico para eliminar
      const nuevoItem = {
        nombre: 'Café para Eliminar',
        descripcion: 'Este café será eliminado',
        precio: 800,
        stock: 5,
        categoria: 'bebidas'
      };

      const createResponse = await adminAgent
        .post('/api/cafeteria')
        .send(nuevoItem);

      const idParaEliminar = createResponse.body._id;

      await adminAgent
        .delete(`/api/cafeteria/${idParaEliminar}`)
        .expect(200);

      // Verificar que el producto fue eliminado
      await employeeAgent
        .get(`/api/cafeteria/${idParaEliminar}`)
        .expect(404);
    });

    test('empleado no debe poder eliminar producto', async () => {
      if (!testCafeteriaId) {
        const items = await employeeAgent.get('/api/cafeteria');
        testCafeteriaId = items.body[0]._id;
      }

      await employeeAgent
        .delete(`/api/cafeteria/${testCafeteriaId}`)
        .expect(403);
    });
  });

  describe('POST /api/cafeteria/:id/vender', () => {
    test('debe poder realizar una venta', async () => {
      if (!testCafeteriaId) {
        const items = await employeeAgent.get('/api/cafeteria');
        testCafeteriaId = items.body[0]._id;
      }

      const ventaData = {
        cantidad: 2,
        cliente: 'Cliente Test'
      };

      const response = await employeeAgent
        .post(`/api/cafeteria/${testCafeteriaId}/vender`)
        .send(ventaData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('venta');
      expect(response.body.venta).toHaveProperty('_id');
      expect(response.body.venta.cantidad).toBe(ventaData.cantidad);
      expect(response.body.venta.tipo).toBe('cafeteria');
    });

    test('debe fallar si no hay stock suficiente', async () => {
      if (!testCafeteriaId) {
        const items = await employeeAgent.get('/api/cafeteria');
        testCafeteriaId = items.body[0]._id;
      }

      const ventaData = {
        cantidad: 999, // Cantidad excesiva
        cliente: 'Cliente Test'
      };

      await employeeAgent
        .post(`/api/cafeteria/${testCafeteriaId}/vender`)
        .send(ventaData)
        .expect(400);
    });
  });

  describe('GET /api/cafeteria/reportes/:periodo', () => {
    test('debe obtener reportes de ventas', async () => {
      const response = await employeeAgent
        .get('/api/cafeteria/reportes/diario')
        .expect(200);

      expect(response.body).toHaveProperty('ventas');
      expect(response.body).toHaveProperty('resumen');
      expect(response.body.ventas).toBeInstanceOf(Array);
    });

    test('debe obtener reportes semanales', async () => {
      const response = await employeeAgent
        .get('/api/cafeteria/reportes/semanal')
        .expect(200);

      expect(response.body).toHaveProperty('ventas');
      expect(response.body).toHaveProperty('resumen');
    });

    test('debe obtener reportes mensuales', async () => {
      const response = await employeeAgent
        .get('/api/cafeteria/reportes/mensual')
        .expect(200);

      expect(response.body).toHaveProperty('ventas');
      expect(response.body).toHaveProperty('resumen');
    });
  });
});
