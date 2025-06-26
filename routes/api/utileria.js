const express = require('express');
const router = express.Router();
const { requireRole } = require('../../middleware/auth');
const utileriaController = require('../../controllers/utileriaController');

// API REST para utilería - Los empleados solo pueden ver utilería
router.get('/', utileriaController.listar); // Todos pueden ver utilería
router.post('/', requireRole(['admin']), utileriaController.crear); // Solo admin puede crear
router.patch('/:id', requireRole(['admin']), utileriaController.guardarEdicion); // Solo admin puede editar
router.delete('/:id', requireRole(['admin']), utileriaController.eliminar); // Solo admin puede eliminar
router.get('/:id', utileriaController.obtener); // Todos pueden ver un producto específico
router.patch('/:id/sumar-stock', requireRole(['admin']), async (req, res) => {
  const Utileria = require('../../models/Utileria');
  const id = req.params.id;
  try {
    const utileria = await Utileria.findById(id);
    if (!utileria) return res.status(404).json({ error: 'Producto de utilería no encontrado' });
    utileria.stock = (utileria.stock || 0) + 1;
    await utileria.save();
    res.json({ stock: utileria.stock });
  } catch (err) {
    res.status(500).json({ error: 'Error al sumar stock' });
  }
});

// Ruta para registrar ventas de utilería
router.post('/vender', async (req, res) => {
  try {
    const { producto, cantidad } = req.body;
    
    if (!producto || !cantidad) {
      return res.status(400).json({ error: 'Producto y cantidad son requeridos' });
    }

    const Utileria = require('../../models/Utileria');
    const Venta = require('../../models/Venta');

    // Verificar que el producto existe
    const utileria = await Utileria.findById(producto);
    if (!utileria) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar stock suficiente
    if (utileria.stock < cantidad) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    // Crear la venta
    const venta = new Venta({
      tipoProducto: 'utileria',
      producto: producto,
      nombreUtileria: utileria.nombre,
      precioUtileria: utileria.precio,
      cantidad: cantidad,
      fecha: new Date()
    });

    await venta.save();

    // Actualizar stock
    utileria.stock -= cantidad;
    await utileria.save();

    res.status(201).json(venta);
  } catch (error) {
    console.error('Error al registrar venta de utilería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener ventas de utilería
router.get('/ventas', async (req, res) => {
  try {
    const Venta = require('../../models/Venta');
    const ventas = await Venta.find({ tipoProducto: 'utileria' })
      .populate('producto')
      .sort({ fecha: -1 });

    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas de utilería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para productos más vendidos de utilería
router.get('/ventas/mas-vendidos', async (req, res) => {
  try {
    const { periodo = 'todo' } = req.query;
    const Venta = require('../../models/Venta');
    
    let fechaInicio;
    const ahora = new Date();
    
    switch (periodo) {
      case 'dia':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        break;
      case 'semana':
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - ahora.getDay());
        fechaInicio = new Date(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate());
        break;
      case 'mes':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        break;
      case 'todo':
      default:
        fechaInicio = new Date(0); // Desde el principio de los tiempos
        break;
    }

    const pipeline = [
      {
        $match: {
          tipoProducto: 'utileria',
          fecha: { $gte: fechaInicio }
        }
      },
      {
        $group: {
          _id: '$producto',
          nombreUtileria: { $first: '$nombreUtileria' },
          precioUtileria: { $first: '$precioUtileria' },
          cantidadVendida: { $sum: '$cantidad' }
        }
      },
      {
        $sort: { cantidadVendida: -1 }
      },
      {
        $limit: 10
      }
    ];

    const masVendidos = await Venta.aggregate(pipeline);
    res.json(masVendidos);
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
