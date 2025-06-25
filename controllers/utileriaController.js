// Controlador para la sección de utilería
const Utileria = require('../models/Utileria');
const Proveedor = require('../models/Proveedor');
const Venta = require('../models/Venta');

exports.catalogo = async (req, res) => {
  try {
    const utileria = await Utileria.find().populate('proveedor');
    res.render('utileria/catalogo_utileria', { utileria });
  } catch (err) {
    res.status(500).send('Error al obtener utilería');
  }
};

exports.formEditar = async (req, res) => {
  try {
    const util = await Utileria.findById(req.params.id).populate('proveedor');
    const proveedores = await Proveedor.find({ tipo_proveedor: 'utileria' });
    res.render('utileria/editar_utileria', { util, proveedores });
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
    await Utileria.findByIdAndDelete(req.params.id);
    res.redirect('/utileria');
  } catch (err) {
    res.status(500).send('Error al eliminar utilería');
  }
};

exports.formNuevo = async (req, res) => {
  try {
    const proveedores = await Proveedor.find({ tipo_proveedor: 'utileria' });
    res.render('utileria/nuevo_utileria', { proveedores });
  } catch (err) {
    res.status(500).send('Error al cargar el formulario de nueva utilería');
  }
};

exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, stockMinimo, proveedor } = req.body;
    await Utileria.create({ nombre, descripcion, precio, stock, stockMinimo, proveedor });
    res.redirect('/utileria');
  } catch (err) {
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
    res.render('utileria/vender_utileria', { utileria, utileriaSeleccionada });
  } catch (err) {
    res.status(500).send('Error al cargar el formulario de venta');
  }
};

// Registrar venta de utilería
exports.vender = async (req, res) => {
  try {
    const { utileriaId, cantidad } = req.body;
    const util = await Utileria.findById(utileriaId);
    if (!util) {
      if (req.headers['content-type'] === 'application/json') {
        return res.status(404).json({ error: 'Utilería no encontrada' });
      }
      return res.status(404).send('Utilería no encontrada');
    }
    if (parseInt(cantidad) > util.stock) {
      const msg = 'No hay suficiente stock disponible para realizar la venta.';
      if (req.headers['content-type'] === 'application/json') {
        return res.status(400).json({ error: msg });
      }
      return res.status(400).send(msg);
    }
    util.stock = (util.stock || 0) - parseInt(cantidad);
    util.ultimaVenta = new Date();
    await util.save();
    await Venta.create({ 
      utileria: util._id, 
      nombreUtileria: util.nombre, 
      precioUtileria: util.precio, 
      cantidad, 
      fecha: new Date() 
    });
    // Si es AJAX/fetch, responder con JSON
    if (req.headers['content-type'] === 'application/json') {
      return res.json({ exito: true });
    }
    // Si es submit tradicional, redirigir
    res.redirect('/utileria/vender?exito=1');
  } catch (err) {
    if (req.headers['content-type'] === 'application/json') {
      return res.status(500).json({ error: 'Error al registrar la venta' });
    }
    res.status(500).send('Error al registrar la venta');
  }
};

// Reportes de ventas de utilería
exports.reportes = async (req, res) => {
  try {
    // Buscar solo ventas de utilería
    const ventas = await Venta.find({ utileria: { $exists: true, $ne: null } }).populate('utileria');
    res.render('utileria/reportes_ventas_utileria', { ventas });
  } catch (err) {
    res.status(500).send('Error al cargar reportes de utilería');
  }
};

// Factura de venta de utilería
exports.facturaVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id).populate('utileria');
    if (!venta) return res.status(404).send('Venta no encontrada');
    res.render('utileria/factura_venta_utileria', { venta });
  } catch (err) {
    res.status(500).send('Error al cargar la factura de venta de utilería');
  }
};
