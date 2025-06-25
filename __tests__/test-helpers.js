const request = require('supertest');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');

/**
 * Crea un usuario de prueba con el rol especificado
 * @param {string} rol - 'admin' o 'empleado'
 * @param {string} email - Email opcional, se genera uno único si no se proporciona
 * @returns {Object} Usuario creado
 */
async function crearUsuarioPrueba(rol = 'admin', email = null) {
  const testEmail = email || `test.${Date.now()}.${Math.random()}@test.com`;
  
  const usuario = new Usuario({
    nombre: `Usuario ${rol} Test`,
    email: testEmail,
    password: 'password123', // No hashear manualmente, dejar que el pre-save lo haga
    rol: rol
  });
  
  return await usuario.save();
}

/**
 * Inicia sesión con un usuario específico y retorna el agente con la sesión activa
 * @param {Object} app - La aplicación Express
 * @param {Object} usuario - El usuario con el que iniciar sesión
 * @returns {Object} Agente de supertest con sesión activa
 */
async function loginComoUsuario(app, usuario) {
  const agent = request.agent(app);
  
  const res = await agent
    .post('/auth/login')
    .send({
      usuario: usuario.email,  // El campo esperado es 'usuario'
      contrasena: 'password123'  // El campo esperado es 'contrasena'
    });
    
  if (res.statusCode !== 200 && res.statusCode !== 302) {
    throw new Error(`Error al iniciar sesión: ${res.statusCode} - ${JSON.stringify(res.body)}`);
  }
  
  return agent;
}

/**
 * Limpia todos los usuarios de prueba
 */
async function limpiarUsuariosPrueba() {
  try {
    await Usuario.deleteMany({ 
      email: { $regex: /test\..*@test\.com|test.*@usuario\.com/ } 
    });
  } catch (error) {
    console.log('Error limpiando usuarios de prueba:', error);
  }
}

module.exports = {
  crearUsuarioPrueba,
  loginComoUsuario,
  limpiarUsuariosPrueba
};

// Jest requires at least one test per file
describe('Test Helpers', () => {
  test('should have helper functions available', () => {
    expect(typeof crearUsuarioPrueba).toBe('function');
    expect(typeof loginComoUsuario).toBe('function');
    expect(typeof limpiarUsuariosPrueba).toBe('function');
  });
});
