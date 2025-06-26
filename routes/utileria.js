const express = require('express');
const router = express.Router();
const utileriaController = require('../controllers/utileriaController');
const Proveedor = require('../models/Proveedor');
const { requireRole } = require('../middleware/auth');

// Catálogo de utilería - usando dashboard
router.get('/', async (req, res) => {
  try {
    const proveedoresUtileria = await Proveedor.find({ tipo_proveedor: 'utileria' });
    res.render('dashboard', { 
      utileria: true,
      activeMenu: 'catalogo',
      proveedoresUtileria,
      user: req.usuario 
    });
  } catch (err) {
    res.status(500).send('Error al cargar utilería');
  }
});

// Formulario para agregar utilería - usando dashboard - Solo administradores
router.get('/nuevo', requireRole(['admin']), async (req, res) => {
  try {
    const proveedoresUtileria = await Proveedor.find({ tipo_proveedor: 'utileria' });
    res.render('dashboard', { 
      utileria: true,
      activeMenu: 'nuevo',
      proveedoresUtileria,
      user: req.usuario 
    });
  } catch (err) {
    res.status(500).send('Error al cargar formulario');
  }
});

router.post('/nuevo', requireRole(['admin']), utileriaController.crear);

// Formulario para registrar venta de utilería - usando dashboard
router.get('/vender', async (req, res) => {
  try {
    const proveedoresUtileria = await Proveedor.find({ tipo_proveedor: 'utileria' });
    const utileriaId = req.query.utileria; // Capturar el ID del producto de la query string
    res.render('dashboard', { 
      utileria: true,
      activeMenu: 'vender',
      proveedoresUtileria,
      utileriaId, // Pasar el ID al template
      user: req.usuario 
    });
  } catch (err) {
    res.status(500).send('Error al cargar formulario de venta');
  }
});

router.post('/vender', utileriaController.vender);

// Reportes de ventas de utilería - usando dashboard
router.get('/reportes', async (req, res) => {
  try {
    const proveedoresUtileria = await Proveedor.find({ tipo_proveedor: 'utileria' });
    res.render('dashboard', { 
      utileria: true,
      activeMenu: 'reportes',
      proveedoresUtileria,
      user: req.usuario 
    });
  } catch (err) {
    res.status(500).send('Error al cargar reportes');
  }
});

// Editar utilería - usando dashboard - Solo administradores
router.get('/editar/:id', requireRole(['admin']), async (req, res) => {
  try {
    const proveedoresUtileria = await Proveedor.find({ tipo_proveedor: 'utileria' });
    res.render('dashboard', { 
      utileria: true,
      activeMenu: 'editar',
      proveedoresUtileria,
      user: req.usuario 
    });
  } catch (err) {
    res.status(500).send('Error al cargar formulario de edición');
  }
});

router.post('/editar/:id', requireRole(['admin']), utileriaController.editar);

// Eliminar utilería - Solo administradores
router.get('/eliminar/:id', requireRole(['admin']), utileriaController.eliminar);
// Factura de venta de utilería
router.get('/factura/:id', utileriaController.facturaVenta);

module.exports = router;
