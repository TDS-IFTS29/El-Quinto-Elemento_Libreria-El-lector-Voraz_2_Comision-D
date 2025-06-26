const express = require('express');
const router = express.Router();
const Cafeteria = require('../../models/Cafeteria');
const Proveedor = require('../../models/Proveedor');
const { requireAuth, requireRole } = require('../../middleware/auth');

// Todas las rutas de API requieren autenticación
router.use(requireAuth);

// GET /api/cafeteria - Obtener todos los items
router.get('/', async (req, res) => {
  try {
    const items = await Cafeteria.find().populate('proveedor').sort({ nombre: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener items de cafetería' });
  }
});

// GET /api/cafeteria/:id - Obtener un item específico
router.get('/:id', async (req, res) => {
  try {
    const item = await Cafeteria.findById(req.params.id).populate('proveedor');
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el item' });
  }
});

// POST /api/cafeteria - Crear nuevo item (solo admin)
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, stockMinimo, categoria, proveedor } = req.body;

    // Validar campos requeridos
    if (!nombre || !descripcion || !precio || !categoria) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Validar proveedor si se proporciona
    if (proveedor) {
      const proveedorValido = await Proveedor.findOne({ _id: proveedor, tipo: 'cafeteria' });
      if (!proveedorValido) {
        return res.status(400).json({ error: 'El proveedor debe ser de tipo cafetería' });
      }
    }

    const nuevoItem = new Cafeteria({
      nombre,
      descripcion,
      precio: parseFloat(precio),
      stock: parseInt(stock) || 0,
      stockMinimo: parseInt(stockMinimo) || 5,
      categoria,
      proveedor: proveedor || null
    });

    const itemGuardado = await nuevoItem.save();
    const itemCompleto = await Cafeteria.findById(itemGuardado._id).populate('proveedor');
    
    res.status(201).json(itemCompleto);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el item: ' + error.message });
  }
});

// PATCH /api/cafeteria/:id - Actualizar item (solo admin)
router.patch('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, stockMinimo, categoria, proveedor } = req.body;

    // Validar proveedor si se proporciona
    if (proveedor) {
      const proveedorValido = await Proveedor.findOne({ _id: proveedor, tipo: 'cafeteria' });
      if (!proveedorValido) {
        return res.status(400).json({ error: 'El proveedor debe ser de tipo cafetería' });
      }
    }

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (precio !== undefined) updateData.precio = parseFloat(precio);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (stockMinimo !== undefined) updateData.stockMinimo = parseInt(stockMinimo) || 5;
    if (categoria !== undefined) updateData.categoria = categoria;
    if (proveedor !== undefined) updateData.proveedor = proveedor || null;

    const itemActualizado = await Cafeteria.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('proveedor');

    if (!itemActualizado) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    res.json(itemActualizado);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el item: ' + error.message });
  }
});

// PUT /api/cafeteria/:id - Actualizar item (solo admin) - Alias para PATCH
router.put('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, stockMinimo, categoria, proveedor } = req.body;

    // Validar proveedor si se proporciona
    if (proveedor) {
      const proveedorValido = await Proveedor.findOne({ _id: proveedor, tipo: 'cafeteria' });
      if (!proveedorValido) {
        return res.status(400).json({ error: 'El proveedor debe ser de tipo cafetería' });
      }
    }

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (precio !== undefined) updateData.precio = parseFloat(precio);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (stockMinimo !== undefined) updateData.stockMinimo = parseInt(stockMinimo) || 5;
    if (categoria !== undefined) updateData.categoria = categoria;
    if (proveedor !== undefined) updateData.proveedor = proveedor || null;

    const itemActualizado = await Cafeteria.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('proveedor');

    if (!itemActualizado) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    res.json(itemActualizado);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el item: ' + error.message });
  }
});

// PATCH /api/cafeteria/:id/sumar-stock - Sumar 1 al stock (solo admin)
router.patch('/:id/sumar-stock', requireRole(['admin']), async (req, res) => {
  try {
    const item = await Cafeteria.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    item.stock += 1;
    await item.save();

    res.json({ stock: item.stock, message: 'Stock incrementado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al incrementar stock' });
  }
});

// POST /api/cafeteria/vender - Realizar venta (nueva ruta compatible)
router.post('/vender', async (req, res) => {
  try {
    const { cafeteriaId, cantidad, cliente } = req.body;

    // Validar campos requeridos
    if (!cafeteriaId) {
      return res.status(400).json({ error: 'El ID del producto es requerido' });
    }
    
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    // Buscar el item
    const item = await Cafeteria.findById(cafeteriaId);
    if (!item) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar stock
    if (item.stock < cantidad) {
      return res.status(400).json({ 
        error: 'Stock insuficiente',
        stockDisponible: item.stock,
        cantidadSolicitada: cantidad
      });
    }

    // Crear venta
    const Venta = require('../../../models/Venta');
    const venta = new Venta({
      tipo: 'cafeteria',
      cafeteria: cafeteriaId,
      nombreCafeteria: item.nombre,
      precioCafeteria: item.precio,
      cantidad: parseInt(cantidad),
      precioUnitario: item.precio,
      total: item.precio * parseInt(cantidad),
      cliente: cliente || 'Cliente genérico',
      vendedor: req.user?.nombre || 'Usuario Test',
      fecha: new Date()
    });

    await venta.save();

    // Actualizar stock y última venta
    item.stock -= parseInt(cantidad);
    item.ultimaVenta = new Date();
    await item.save();

    res.json({
      success: true,
      venta: venta,
      stockRestante: item.stock,
      message: 'Venta registrada exitosamente'
    });
  } catch (error) {
    console.error('Error en venta:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al procesar la venta: ' + error.message 
    });
  }
});

// POST /api/cafeteria/:id/vender - Realizar venta
router.post('/:id/vender', async (req, res) => {
  try {
    const { cantidad, cliente } = req.body;
    const itemId = req.params.id;

    // Validar cantidad
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    // Buscar el item
    const item = await Cafeteria.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Verificar stock
    if (item.stock < cantidad) {
      return res.status(400).json({ 
        error: 'Stock insuficiente',
        stockDisponible: item.stock,
        cantidadSolicitada: cantidad
      });
    }

    // Crear venta
    const Venta = require('../../../models/Venta');
    const venta = new Venta({
      tipo: 'cafeteria',
      cafeteria: itemId,
      nombreCafeteria: item.nombre,
      precioCafeteria: item.precio,
      cantidad: parseInt(cantidad),
      precioUnitario: item.precio,
      total: item.precio * parseInt(cantidad),
      cliente: cliente || 'Cliente genérico',
      vendedor: req.user?.nombre || 'Usuario Test',
      fecha: new Date()
    });

    await venta.save();

    // Actualizar stock y última venta
    item.stock -= parseInt(cantidad);
    item.ultimaVenta = new Date();
    await item.save();

    res.json({
      success: true,
      venta: venta,
      stockRestante: item.stock,
      message: 'Venta registrada exitosamente'
    });
  } catch (error) {
    console.error('Error en venta:', error);
    res.status(500).json({ error: 'Error al procesar la venta: ' + error.message });
  }
});

// GET /api/cafeteria/reportes/:periodo - Obtener reportes de ventas
router.get('/reportes/:periodo', async (req, res) => {
  try {
    const periodo = req.params.periodo;
    const ahora = new Date();
    let fechaInicio;
    
    switch (periodo) {
      case 'diario':
        fechaInicio = new Date(ahora);
        fechaInicio.setHours(0, 0, 0, 0);
        break;
      case 'semanal':
        fechaInicio = new Date(ahora);
        fechaInicio.setDate(ahora.getDate() - 7);
        fechaInicio.setHours(0, 0, 0, 0);
        break;
      case 'mensual':
        fechaInicio = new Date(ahora);
        fechaInicio.setDate(1);
        fechaInicio.setHours(0, 0, 0, 0);
        break;
      default:
        return res.status(400).json({ error: 'Período inválido. Use: diario, semanal, o mensual' });
    }

    const Venta = require('../../../models/Venta');
    const ventas = await Venta.find({
      tipo: 'cafeteria',
      fecha: { $gte: fechaInicio, $lte: ahora }
    }).populate('cafeteria').sort({ fecha: -1 });

    // Calcular resumen
    const totalVentas = ventas.length;
    const ingresoTotal = ventas.reduce((sum, venta) => sum + venta.total, 0);
    const cantidadTotal = ventas.reduce((sum, venta) => sum + venta.cantidad, 0);

    // Items más vendidos
    const itemsVendidos = {};
    ventas.forEach(venta => {
      const itemNombre = venta.nombreCafeteria;
      if (!itemsVendidos[itemNombre]) {
        itemsVendidos[itemNombre] = { 
          nombre: itemNombre, 
          cantidad: 0, 
          ingresos: 0 
        };
      }
      itemsVendidos[itemNombre].cantidad += venta.cantidad;
      itemsVendidos[itemNombre].ingresos += venta.total;
    });

    const itemsMasVendidos = Object.values(itemsVendidos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    res.json({
      periodo,
      fechaInicio,
      fechaFin: ahora,
      ventas,
      resumen: {
        totalVentas,
        ingresoTotal,
        cantidadTotal,
        itemsMasVendidos
      }
    });
  } catch (error) {
    console.error('Error en reportes:', error);
    res.status(500).json({ error: 'Error al generar reportes: ' + error.message });
  }
});

// DELETE /api/cafeteria/:id - Eliminar item (solo admin)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const itemEliminado = await Cafeteria.findByIdAndDelete(req.params.id);
    
    if (!itemEliminado) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    res.json({ message: 'Item eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el item' });
  }
});

module.exports = router;
