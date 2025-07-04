const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();

// Cargar variables de entorno desde .env
require('dotenv').config();

// Conexión a MongoDB
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Configurar sesiones
app.use(session({
  secret: process.env.SESSION_SECRET,
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
app.use('/utileria', requireAuth, require('./routes/utileria')); // requiere autenticación
app.use('/cafeteria', requireAuth, require('./routes/cafeteria')); // requiere autenticación
app.use('/proveedores', requireAuth, require('./routes/proveedores')); // requiere autenticación
app.use('/usuarios', requireAuth, require('./routes/usuarios')); // CRUD de usuarios - requiere autenticación

// Ruta para la documentación de la API
app.use('/api-docs', require('./routes/apiDocs'));

// Rutas API RESTful - requieren autenticación
app.use('/api/proveedores', requireAuth, require('./routes/api/proveedores'));
app.use('/api/libros', requireAuth, require('./routes/api/libros'));
app.use('/api/utileria', requireAuth, require('./routes/api/utileria'));
app.use('/api/cafeteria', requireAuth, require('./routes/api/cafeteria'));
app.use('/api/ventas', requireAuth, require('./routes/api/ventas'));
app.use('/api/usuarios', requireAuth, require('./routes/api/usuarios')); // API de usuarios

// Puerto
const PORT = process.env.PORT || 3000;

// Solo iniciar el servidor si no estamos en un entorno de test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
