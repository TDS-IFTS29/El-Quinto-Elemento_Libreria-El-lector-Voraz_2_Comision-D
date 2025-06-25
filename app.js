const express = require('express');
const path = require('path');
const session = require('express-session');
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

// Configurar sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'el-lector-voraz-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Cambiar a true en producción con HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Configurar Express para servir archivos estáticos
app.use(express.static('public'));

// Configuración pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware para parsear formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Importar middleware de autenticación
const { requireAuth, requireRole } = require('./middleware/auth');

// Rutas de vistas
app.use('/', require('./routes/auth')); // login en "/"
app.use('/auth', require('./routes/auth')); // rutas de autenticación en "/auth"
app.use('/inicio', requireAuth, require('./routes/home')); // home en "/inicio" - requiere autenticación

// app.use('/catalogo', (req, res) => res.render('catalogo_libros'));
app.use('/libros', requireAuth, require('./routes/libros')); // requiere autenticación
app.use('/proveedores', requireAuth, require('./routes/proveedores')); // requiere autenticación
app.use('/usuarios', requireAuth, require('./routes/usuarios')); // CRUD de usuarios - requiere autenticación

// Ruta para la documentación de la API
app.use('/api-docs', require('./routes/apiDocs'));

// Rutas API RESTful - requieren autenticación
// app.use('/api/productos', require('./routes/api/productos'));
app.use('/api/proveedores', requireAuth, require('./routes/api/proveedores'));
app.use('/api/libros', requireAuth, require('./routes/api/libros'));
app.use('/api/ventas', requireAuth, require('./routes/api/ventas'));
app.use('/api/usuarios', requireAuth, require('./routes/api/usuarios')); // API de usuarios
// app.use('/api/proveedores_libros', require('./routes/api/proveedores_libros'));
// app.use('/api/ventas', require('./routes/api/ventas'));
// app.use('/api/debug', require('./routes/debug'));

// Nueva ruta de utilería
app.use('/utileria', require('./routes/utileria'));
app.use('/api/utileria', require('./routes/api/utileria/index.js'));

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
