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
    console.log('=== INVOICE REQUEST ===');
    console.log('Buscando venta con ID:', ventaId);
    console.log('ID válido:', require('mongoose').Types.ObjectId.isValid(ventaId));
    
    const venta = await Venta.findById(ventaId).populate('libro');
    console.log('Venta encontrada:', venta ? 'Sí' : 'No');
    
    if (!venta) {
      console.log('Venta no encontrada para ID:', ventaId);
      return res.render('libros/factura_venta', { venta: null });
    }
    
    // Asegurar que tenga los campos necesarios para la vista
    venta.cliente = venta.cliente || 'Cliente genérico';
    venta.vendedor = venta.vendedor || 'Vendedor';
    
    console.log('Datos de venta completos:', {
      id: venta._id,
      tipo: venta.tipo,
      fecha: venta.fecha,
      cliente: venta.cliente,
      vendedor: venta.vendedor,
      libro_poblado: venta.libro ? {
        nombre: venta.libro.nombre,
        autor: venta.libro.autor,
        precio: venta.libro.precio
      } : null,
      campos_legacy: {
        nombreLibro: venta.nombreLibro,
        autorLibro: venta.autorLibro,
        precioLibro: venta.precioLibro
      },
      cantidad: venta.cantidad,
      total: venta.total
    });
    
    res.render('libros/factura_venta', { venta: venta });
  } catch (e) {
    console.error('Error al buscar venta:', e);
    res.render('libros/factura_venta', { venta: null });
  }
});

module.exports = router;
