const request = require('supertest');
const app = require('../app');
const { crearUsuarioPrueba, loginComoUsuario, limpiarUsuariosPrueba } = require('./test-helpers');
const mongoose = require('mongoose');
const Utileria = require('../models/Utileria');
const Proveedor = require('../models/Proveedor');

describe('Test Helpers', () => {
  test('should have helper functions available', () => {
    expect(crearUsuarioPrueba).toBeInstanceOf(Function);
    expect(loginComoUsuario).toBeInstanceOf(Function);
    expect(limpiarUsuariosPrueba).toBeInstanceOf(Function);
  });
});

describe('API de Utilería', () => {
  let adminAgent;
  let empleadoAgent;
  let usuarioAdmin;
  let usuarioEmpleado;
  let testProveedor;
  let testUtileria;

  beforeAll(async () => {
    // Crear usuarios de prueba
    usuarioAdmin = await crearUsuarioPrueba('admin');
    usuarioEmpleado = await crearUsuarioPrueba('empleado');
    
    // Iniciar sesión con ambos usuarios
    adminAgent = await loginComoUsuario(app, usuarioAdmin);
    empleadoAgent = await loginComoUsuario(app, usuarioEmpleado);

    // Crear un proveedor de utilería para las pruebas
    const proveedorRes = await adminAgent
      .post('/api/proveedores')
      .send({
        nombre: 'Proveedor Utilería Test',
        mail: 'utileria@test.com',
        tipo_proveedor: 'utileria'
      });
    testProveedor = proveedorRes.body;
  });

  afterAll(async () => {
    try {
      await limpiarUsuariosPrueba();
      if (testProveedor) {
        await Proveedor.findByIdAndDelete(testProveedor._id);
      }
      await Utileria.deleteMany({ nombre: /Test/ });
    } catch (error) {
      console.log('Error limpiando datos de prueba:', error);
    }
  });

  beforeEach(async () => {
    // Limpiar utilería existente
    await Utileria.deleteMany({ nombre: /Test/ });
    
    // Crear un item de utilería para las pruebas
    testUtileria = await Utileria.create({
      nombre: 'Cuaderno Test',
      descripcion: 'Cuaderno de prueba',
      precio: 150,
      stock: 10,
      stockMinimo: 5,
      proveedor: testProveedor._id
    });
  });

  describe('Permisos de lectura', () => {
    test('GET /api/utileria debería retornar todos los items (admin)', async () => {
      const response = await adminAgent
        .get('/api/utileria');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/utileria debería retornar todos los items (empleado)', async () => {
      const response = await empleadoAgent
        .get('/api/utileria');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/utileria/:id debería retornar un item específico (admin)', async () => {
      const response = await adminAgent
        .get(`/api/utileria/${testUtileria._id}`);

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Cuaderno Test');
    });

    test('GET /api/utileria/:id debería retornar un item específico (empleado)', async () => {
      const response = await empleadoAgent
        .get(`/api/utileria/${testUtileria._id}`);

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Cuaderno Test');
    });
  });

  describe('Permisos de creación - Solo admin', () => {
    test('POST /api/utileria debería crear un nuevo item (admin)', async () => {
      const nuevoItem = {
        nombre: 'Lapiz Test',
        descripcion: 'Lapiz de prueba',
        precio: 50,
        stock: 20,
        stockMinimo: 10,
        proveedor: testProveedor._id
      };

      const response = await adminAgent
        .post('/api/utileria')
        .send(nuevoItem);

      expect(response.status).toBe(201);
      expect(response.body.nombre).toBe('Lapiz Test');
    });

    test('POST /api/utileria debería fallar para empleados', async () => {
      const nuevoItem = {
        nombre: 'Lapiz Test Empleado',
        descripcion: 'Lapiz de prueba empleado',
        precio: 50,
        stock: 20,
        stockMinimo: 10,
        proveedor: testProveedor._id
      };

      const response = await empleadoAgent
        .post('/api/utileria')
        .send(nuevoItem);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('No tiene permisos');
    });
  });

  describe('Permisos de edición - Solo admin', () => {
    test('PATCH /api/utileria/:id debería actualizar un item (admin)', async () => {
      const actualizacion = {
        nombre: 'Cuaderno Test Actualizado',
        precio: 200
      };

      const response = await adminAgent
        .patch(`/api/utileria/${testUtileria._id}`)
        .send(actualizacion);

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Cuaderno Test Actualizado');
      expect(response.body.precio).toBe(200);
    });

    test('PATCH /api/utileria/:id debería fallar para empleados', async () => {
      const actualizacion = {
        nombre: 'Cuaderno Test Empleado',
        precio: 200
      };

      const response = await empleadoAgent
        .patch(`/api/utileria/${testUtileria._id}`)
        .send(actualizacion);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('No tiene permisos');
    });

    test('PATCH /api/utileria/:id/sumar-stock debería funcionar solo para admin', async () => {
      const stockInicial = testUtileria.stock;

      const response = await adminAgent
        .patch(`/api/utileria/${testUtileria._id}/sumar-stock`);

      expect(response.status).toBe(200);
      expect(response.body.stock).toBe(stockInicial + 1);
    });

    test('PATCH /api/utileria/:id/sumar-stock debería fallar para empleados', async () => {
      const response = await empleadoAgent
        .patch(`/api/utileria/${testUtileria._id}/sumar-stock`);

      expect(response.status).toBe(403);
      expect(response.body.error || response.text).toContain('No tiene permisos');
    });
  });

  describe('Permisos de eliminación - Solo admin', () => {
    test('DELETE /api/utileria/:id debería eliminar un item (admin)', async () => {
      const response = await adminAgent
        .delete(`/api/utileria/${testUtileria._id}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);

      // Verificar que el item fue eliminado
      const itemEliminado = await Utileria.findById(testUtileria._id);
      expect(itemEliminado).toBeNull();
    });

    test('DELETE /api/utileria/:id debería fallar para empleados', async () => {
      const response = await empleadoAgent
        .delete(`/api/utileria/${testUtileria._id}`);

      expect(response.status).toBe(403);
      expect(response.body.error || response.text).toContain('No tiene permisos');

      // Verificar que el item NO fue eliminado
      const itemIntacto = await Utileria.findById(testUtileria._id);
      expect(itemIntacto).not.toBeNull();
      expect(itemIntacto.nombre).toBe('Cuaderno Test');
    });
  });

  describe('Casos edge', () => {
    test('GET /api/utileria/:id debería retornar 404 para item inexistente', async () => {
      const idInexistente = new mongoose.Types.ObjectId();
      
      const response = await adminAgent
        .get(`/api/utileria/${idInexistente}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('No encontrado');
    });

    test('PATCH /api/utileria/:id debería retornar 404 para item inexistente (admin)', async () => {
      const idInexistente = new mongoose.Types.ObjectId();
      
      const response = await adminAgent
        .patch(`/api/utileria/${idInexistente}`)
        .send({ nombre: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('No encontrado');
    });

    test('DELETE /api/utileria/:id debería funcionar silenciosamente para item inexistente (admin)', async () => {
      const idInexistente = new mongoose.Types.ObjectId();
      
      const response = await adminAgent
        .delete(`/api/utileria/${idInexistente}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
  });
});
