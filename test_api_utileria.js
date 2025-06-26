const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');

// Simular app básica para testear API
const app = express();
app.use(express.json());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false
}));

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/el-lector-voraz')
  .then(async () => {
    console.log('Conectado a MongoDB para test');
    
    // Simular usuario autenticado
    const Usuario = require('./models/Usuario');
    const admin = await Usuario.findOne({ email: 'admin' });
    
    if (admin) {
      console.log('Usuario admin encontrado para test');
      
      // Importar y probar el controlador directamente
      const utileriaController = require('./controllers/utileriaController');
      
      // Simular req y res para probar listar
      const req = {};
      const res = {
        json: (data) => {
          console.log(`Productos de utilería encontrados en API: ${data.length}`);
          data.forEach((item, index) => {
            console.log(`${index + 1}. ${item.nombre} - $${item.precio} - Stock: ${item.stock}`);
          });
          mongoose.connection.close();
        },
        status: (code) => ({
          json: (error) => {
            console.error(`Error ${code}:`, error);
            mongoose.connection.close();
          }
        })
      };
      
      // Ejecutar la función listar
      utileriaController.listar(req, res);
    } else {
      console.log('No se encontró usuario admin');
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });
