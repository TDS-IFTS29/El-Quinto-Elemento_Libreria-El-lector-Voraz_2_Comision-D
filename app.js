const express = require('express');
const path = require('path');
const app = express();

// Cargar variables de entorno desde .env
require('dotenv').config();

// Conexión a MongoDB
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Configurar Express para servir archivos estáticos
app.use(express.static('public'));

// Configuración pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware para parsear formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas de vistas
app.use('/', require('./routes/usuarios')); // login en "/"
app.use('/inicio', require('./routes/home')); // home en "/inicio"

// app.use('/catalogo', (req, res) => res.render('catalogo_libros'));
app.use('/libros', require('./routes/libros'));
app.use('/proveedores', require('./routes/proveedores'));

// Ruta para la documentación de la API
app.use('/api-docs', require('./routes/apiDocs'));

// Rutas API RESTful
// app.use('/api/productos', require('./routes/api/productos'));
app.use('/api/proveedores', require('./routes/api/proveedores/index.js'));
app.use('/api/libros', require('./routes/api/libros'));
app.use('/api/ventas', require('./routes/api/ventas'));
// app.use('/api/proveedores_libros', require('./routes/api/proveedores_libros'));
// app.use('/api/ventas', require('./routes/api/ventas'));
// app.use('/api/debug', require('./routes/debug'));

// Nueva ruta de utilería
app.use('/utileria', require('./routes/utileria'));
app.use('/api/utileria', require('./routes/api/utileria'));

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
