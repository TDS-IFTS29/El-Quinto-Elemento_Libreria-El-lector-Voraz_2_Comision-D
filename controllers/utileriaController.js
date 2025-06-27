// Controlador para la sección de utilería
const Utileria = require('../models/Utileria');
const Proveedor = require('../models/Proveedor');
const Venta = require('../models/Venta');

exports.catalogo = async (req, res) => {
  try {
    const utileria = await Utileria.find().populate('proveedor');
    res.render('utileria/catalogo_utileria', { 
      title: 'Catálogo de Utilería',
      utileria, 
      user: req.usuario,
      activeMenu: 'catalogo'
    });
  } catch (err) {
    res.status(500).send('Error al obtener utilería');
  }
};

exports.formEditar = async (req, res) => {
  try {
    const util = await Utileria.findById(req.params.id).populate('proveedor');
    const proveedores = await Proveedor.find({ tipo_proveedor: 'utileria' });
    res.render('utileria/editar_utileria', { 
      title: 'Editar Utilería',
      util, 
      proveedores, 
      user: req.usuario,
      activeMenu: 'catalogo'
    });
  } catch (err) {
    res.status(500).send('Error al cargar el formulario de edición');
  }
};

exports.editar = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, stockMinimo, ultimaReposicion, ultimaVenta, proveedor } = req.body;
    await Utileria.findByIdAndUpdate(req.params.id, {
      nombre, descripcion, precio, stock, stockMinimo, ultimaReposicion, ultimaVenta, proveedor
    });
    res.redirect('/utileria');
  } catch (err) {
    res.status(500).send('Error al editar utilería');
  }
};

exports.eliminar = async (req, res) => {
  try {
    const utileria = await Utileria.findByIdAndDelete(req.params.id);
    
    // Si es una llamada API
    if (req.headers['content-type']?.includes('application/json') || req.headers.accept?.includes('application/json')) {
      return res.json({ ok: true });
    }
    
    // Si es un formulario tradicional
    res.redirect('/utileria');
  } catch (err) {
    if (req.headers['content-type']?.includes('application/json') || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ error: 'Error al eliminar utilería' });
    }
    res.status(500).send('Error al eliminar utilería');
  }
};

exports.formNuevo = async (req, res) => {
  try {
    const proveedores = await Proveedor.find({ tipo_proveedor: 'utileria' });
    res.render('utileria/nuevo_utileria', { 
      title: 'Nueva Utilería',
      proveedores, 
      user: req.usuario,
      activeMenu: 'nuevo'
    });
  } catch (err) {
    res.status(500).send('Error al cargar el formulario de nueva utilería');
  }
};

exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, stockMinimo, proveedor } = req.body;
    
    // Si es una llamada API (Content-Type: application/json)
    if (req.headers['content-type']?.includes('application/json')) {
      const utileria = await Utileria.create({ nombre, descripcion, precio, stock, stockMinimo, proveedor });
      const utileriaCompleta = await Utileria.findById(utileria._id).populate('proveedor');
      return res.status(201).json(utileriaCompleta);
    }
    
    // Si es un formulario tradicional
    await Utileria.create({ nombre, descripcion, precio, stock, stockMinimo, proveedor });
    res.redirect('/utileria');
  } catch (err) {
    if (req.headers['content-type']?.includes('application/json')) {
      return res.status(500).json({ error: 'Error al crear utilería' });
    }
    res.status(500).send('Error al crear utilería');
  }
};

// Formulario para registrar venta de utilería
exports.formVender = async (req, res) => {
  try {
    let utileria = await Utileria.find().populate('proveedor');
    let utileriaSeleccionada = null;
    if (req.query.utileria) {
      utileriaSeleccionada = utileria.find(u => u._id.toString() === req.query.utileria);
    }
    res.render('utileria/vender_utileria', { 
      title: 'Vender Utilería',
      utileria, 
      utileriaSeleccionada, 
      user: req.usuario,
      activeMenu: 'venta'
    });
  } catch (err) {
    res.status(500).send('Error al cargar el formulario de venta');
  }
};

// Registrar venta de utilería
exports.vender = async (req, res) => {
  try {
    const { utileriaId, cantidad } = req.body;
    
    // Validar que utileriaId y cantidad existan
    if (!utileriaId || !cantidad) {
      const msg = 'Datos de venta incompletos';
      if (req.headers['content-type']?.includes('application/json')) {
        return res.status(400).json({ error: msg });
      }
      return res.status(400).send(msg);
    }
    
    const util = await Utileria.findById(utileriaId);
    if (!util) {
      const msg = 'Utilería no encontrada';
      if (req.headers['content-type']?.includes('application/json')) {
        return res.status(404).json({ error: msg });
      }
      return res.status(404).send(msg);
    }
    
    const cantidadVenta = parseInt(cantidad);
    if (isNaN(cantidadVenta) || cantidadVenta <= 0) {
      const msg = 'La cantidad debe ser un número positivo';
      if (req.headers['content-type']?.includes('application/json')) {
        return res.status(400).json({ error: msg });
      }
      return res.status(400).send(msg);
    }
    
    if (cantidadVenta > util.stock) {
      const msg = 'No hay suficiente stock disponible para realizar la venta.';
      if (req.headers['content-type']?.includes('application/json')) {
        return res.status(400).json({ error: msg });
      }
      return res.status(400).send(msg);
    }
    
    // Actualizar stock y fecha de última venta
    util.stock = (util.stock || 0) - cantidadVenta;
    util.ultimaVenta = new Date();
    await util.save();
    
    // Crear registro de venta
    const nuevaVenta = await Venta.create({ 
      tipo: 'utileria',
      utileria: util._id, 
      nombreUtileria: util.nombre, 
      precioUtileria: util.precio,
      precioUnitario: util.precio,
      cantidad: cantidadVenta,
      total: util.precio * cantidadVenta,
      vendedor: req.usuario?.nombre || 'Sistema',
      fecha: new Date() 
    });
    
    // Si es AJAX/fetch, responder con JSON
    if (req.headers['content-type']?.includes('application/json')) {
      return res.json({ 
        exito: true, 
        mensaje: 'Venta registrada correctamente',
        venta: nuevaVenta 
      });
    }
    
    // Si es submit tradicional, redirigir
    res.redirect('/utileria/vender?exito=1');
  } catch (err) {
    console.error('Error en venta de utilería:', err);
    const msg = 'Error al registrar la venta: ' + err.message;
    if (req.headers['content-type']?.includes('application/json')) {
      return res.status(500).json({ error: msg });
    }
    res.status(500).send(msg);
  }
};

// Reportes de ventas de utilería
exports.reportes = async (req, res) => {
  try {
    // Buscar solo ventas de utilería
    const ventas = await Venta.find({ utileria: { $exists: true, $ne: null } }).populate('utileria');
    res.render('utileria/reportes_ventas_utileria', { 
      title: 'Reportes de Ventas de Utilería',
      ventas, 
      user: req.usuario,
      activeMenu: 'reportes'
    });
  } catch (err) {
    res.status(500).send('Error al cargar reportes de utilería');
  }
};

// Factura de venta de utilería
exports.facturaVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id).populate('utileria');
    if (!venta) return res.status(404).send('Venta no encontrada');
    res.render('utileria/factura_venta_utileria', { 
      title: 'Factura de Venta',
      venta, 
      user: req.usuario 
    });
  } catch (err) {
    res.status(500).send('Error al cargar la factura de venta de utilería');
  }
};

// API functions for REST endpoints

// Listar todos los productos de utilería (para API)
exports.listar = async (req, res) => {
  try {
    const utileria = await Utileria.find().populate('proveedor');
    res.json(utileria);
  } catch (error) {
    console.error('Error al listar utilería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener un producto específico (para API)
exports.obtener = async (req, res) => {
  try {
    const utileria = await Utileria.findById(req.params.id).populate('proveedor');
    if (!utileria) {
      return res.status(404).json({ error: 'Producto de utilería no encontrado' });
    }
    res.json(utileria);
  } catch (error) {
    console.error('Error al obtener utilería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Guardar edición (para API)
exports.guardarEdicion = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, stockMinimo, proveedor } = req.body;
    const utileria = await Utileria.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, precio, stock, stockMinimo, proveedor },
      { new: true }
    ).populate('proveedor');
    
    if (!utileria) {
      return res.status(404).json({ error: 'Producto de utilería no encontrado' });
    }
    
    res.json(utileria);
  } catch (error) {
    console.error('Error al editar utilería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
