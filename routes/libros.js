const express = require('express');
const router = express.Router();
const Venta = require('../models/Venta');
const Libro = require('../models/Libro');
const {
  vistaNuevoLibro,
  vistaEditarLibro,
  verCatalogo,
  crear,
  verCatalogoVentas,
  vistaNuevaVenta,
  vistaReportesVentas,
  vistaDashboard
} = require('../controllers/librosController');

// Middleware para verificar que solo admin puede crear/editar libros
function requireAdminForLibroManagement(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).render('error', { 
      mensaje: 'Solo los administradores pueden crear y editar libros.',
      user: req.usuario 
    });
  }
  next();
}

// Solo renderiza dashboard/layout para navegación visual
router.get('/', (req, res) => {
  res.render('libros/catalogo_libros', { 
    activeMenu: 'catalogo',
    user: req.usuario 
  });
});
router.get('/nuevo', requireAdminForLibroManagement, (req, res) => {
  res.render('libros/nuevo_libro', { 
    activeMenu: 'nuevo',
    user: req.usuario 
  });
});
router.get('/editar/:id', requireAdminForLibroManagement, (req, res) => {
  res.render('libros/editar_libro', { 
    activeMenu: 'editar', 
    libroId: req.params.id,
    user: req.usuario 
  });
});
router.get('/ventas/editar/:id', (req, res) => {
  res.render('libros/editar_venta', { 
    ventaId: req.params.id,
    user: req.usuario 
  });
});
router.get('/ventas/nueva', (req, res) => {
  res.render('libros/nueva_venta', { 
    libros: [],
    user: req.usuario 
  });
});
router.get('/ventas/reportes', require('../controllers/librosController').vistaReportesVentas);
router.get('/ventas', (req, res) => {
  res.render('libros/catalogo_ventas_libros', {
    user: req.usuario 
  });
});
router.get('/ventas/factura/:id', async (req, res) => {
  const ventaId = req.params.id;
  try {
    const venta = await Venta.findById(ventaId).populate('libro');
    if (!venta) return res.render('libros/factura_venta', { venta: null });
    // Adaptar los campos para la vista
    const datos = {
      fecha: venta.fecha,
      titulo: venta.nombreLibro || (venta.libro && venta.libro.nombre),
      autor: venta.autorLibro || (venta.libro && venta.libro.autor),
      genero: venta.generoLibro || (venta.libro && venta.libro.genero),
      precio: venta.precioLibro,
      cantidad: venta.cantidad,
      ingresos: venta.precioLibro * venta.cantidad
    };
    res.render('libros/factura_venta', { venta: datos });
  } catch (e) {
    res.render('libros/factura_venta', { venta: null });
  }
});

module.exports = router;
