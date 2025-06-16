const express = require('express');
const path = require('path');
const app = express();

// Cargar variables de entorno desde .env
require('dotenv').config();

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


app.use('/catalogo', require('./routes/catalogo'));
app.use('/productos', require('./routes/productos'));
app.use('/ventas', require('./routes/ventas'));
app.use('/proveedores', require('./routes/proveedores'));

// Ruta para la documentación de la API
app.use('/api-docs', require('./routes/apiDocs'));

// Rutas API RESTful
app.use('/api/productos', require('./routes/api/productos'));
app.use('/api/proveedores', require('./routes/api/proveedores'));
app.use('/api/ventas', require('./routes/api/ventas'));

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
