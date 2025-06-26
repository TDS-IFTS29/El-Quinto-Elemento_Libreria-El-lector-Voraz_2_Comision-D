const Cafeteria = require('../models/Cafeteria');
const Proveedor = require('../models/Proveedor');
const Venta = require('../models/Venta');

const cafeteriaController = {
  // Mostrar catálogo de cafetería
  mostrarCatalogo: async (req, res) => {
    try {
      const items = await Cafeteria.find().populate('proveedor');
      res.render('cafeteria/catalogo_cafeteria', { 
        title: 'Catálogo de Cafetería', 
        items, 
        user: req.session.user,
        activeMenu: 'catalogo'
      });
    } catch (error) {
      res.status(500).render('error', { message: 'Error al cargar el catálogo de cafetería' });
    }
  },

  // Mostrar formulario para nuevo item
  mostrarNuevoItem: async (req, res) => {
    try {
      const proveedores = await Proveedor.find({ tipo_proveedor: 'cafeteria' });
      res.render('cafeteria/nuevo_cafeteria', { 
        title: 'Nuevo Item de Cafetería', 
        proveedores, 
        user: req.session.user,
        activeMenu: 'nuevo'
      });
    } catch (error) {
      res.status(500).render('error', { message: 'Error al cargar formulario' });
    }
  },

  // Crear nuevo item
  crearItem: async (req, res) => {
    try {
      console.log('Datos recibidos:', req.body);
      const { nombre, descripcion, precio, stock, stockMinimo, categoria, proveedor } = req.body;
      
      // Validar proveedor
      if (proveedor) {
        const proveedorValido = await Proveedor.findOne({ _id: proveedor, tipo_proveedor: 'cafeteria' });
        if (!proveedorValido) {
          return res.status(400).render('cafeteria/nuevo_cafeteria', { 
            error: 'El proveedor debe ser de tipo cafetería',
            proveedores: await Proveedor.find({ tipo_proveedor: 'cafeteria' }),
            user: req.session.user 
          });
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

      console.log('Creando nuevo item:', nuevoItem);
      const itemGuardado = await nuevoItem.save();
      console.log('Item guardado exitosamente:', itemGuardado);
      res.redirect('/cafeteria?success=Item creado exitosamente');
    } catch (error) {
      console.error('Error al crear item:', error);
      const proveedores = await Proveedor.find({ tipo_proveedor: 'cafeteria' });
      res.render('cafeteria/nuevo_cafeteria', { 
        error: 'Error al crear el item: ' + error.message,
        proveedores,
        user: req.session.user 
      });
    }
  },

  // Mostrar formulario de edición
  mostrarEditarItem: async (req, res) => {
    try {
      const item = await Cafeteria.findById(req.params.id).populate('proveedor');
      const proveedores = await Proveedor.find({ tipo_proveedor: 'cafeteria' });
      
      if (!item) {
        return res.status(404).render('error', { message: 'Item no encontrado' });
      }

      res.render('cafeteria/editar_cafeteria', { 
        title: 'Editar Item de Cafetería',
        item,
        proveedores,
        user: req.session.user 
      });
    } catch (error) {
      res.status(500).render('error', { message: 'Error al cargar el item' });
    }
  },

  // Actualizar item
  actualizarItem: async (req, res) => {
    try {
      const { nombre, descripcion, precio, stock, stockMinimo, categoria, proveedor } = req.body;
      
      // Validar proveedor
      if (proveedor) {
        const proveedorValido = await Proveedor.findOne({ _id: proveedor, tipo_proveedor: 'cafeteria' });
        if (!proveedorValido) {
          const item = await Cafeteria.findById(req.params.id);
          const proveedores = await Proveedor.find({ tipo_proveedor: 'cafeteria' });
          return res.status(400).render('cafeteria/editar_cafeteria', { 
            error: 'El proveedor debe ser de tipo cafetería',
            item,
            proveedores,
            user: req.session.user 
          });
        }
      }

      const itemActualizado = await Cafeteria.findByIdAndUpdate(
        req.params.id,
        {
          nombre,
          descripcion,
          precio: parseFloat(precio),
          stock: parseInt(stock),
          stockMinimo: parseInt(stockMinimo) || 5,
          categoria,
          proveedor: proveedor || null
        },
        { new: true }
      );

      if (!itemActualizado) {
        return res.status(404).render('error', { message: 'Item no encontrado' });
      }

      res.redirect('/cafeteria?success=Item actualizado exitosamente');
    } catch (error) {
      const item = await Cafeteria.findById(req.params.id);
      const proveedores = await Proveedor.find({ tipo_proveedor: 'cafeteria' });
      res.render('cafeteria/editar_cafeteria', { 
        error: 'Error al actualizar el item: ' + error.message,
        item,
        proveedores,
        user: req.session.user 
      });
    }
  },

  // Eliminar item
  eliminarItem: async (req, res) => {
    try {
      const itemEliminado = await Cafeteria.findByIdAndDelete(req.params.id);
      
      if (!itemEliminado) {
        return res.status(404).json({ success: false, message: 'Item no encontrado' });
      }

      res.json({ success: true, message: 'Item eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al eliminar el item' });
    }
  },

  // Mostrar formulario de venta
  mostrarVenta: async (req, res) => {
    try {
      let item = null;
      
      // Si se especifica un item en la query
      if (req.query.cafeteria) {
        item = await Cafeteria.findById(req.query.cafeteria);
      }

      const items = await Cafeteria.find({ stock: { $gt: 0 } });
      res.render('cafeteria/vender_cafeteria', { 
        title: 'Vender Item de Cafetería',
        items,
        itemSeleccionado: item,
        user: req.session.user,
        activeMenu: 'venta'
      });
    } catch (error) {
      res.status(500).render('error', { message: 'Error al cargar formulario de venta' });
    }
  },

  // Procesar venta
  procesarVenta: async (req, res) => {
    try {
      const { cafeteria, cantidad, cliente } = req.body;
      
      const item = await Cafeteria.findById(cafeteria);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item no encontrado' });
      }

      const cantidadVenta = parseInt(cantidad);
      if (cantidadVenta <= 0) {
        return res.status(400).json({ success: false, message: 'La cantidad debe ser mayor a 0' });
      }

      if (item.stock < cantidadVenta) {
        return res.status(400).json({ success: false, message: 'Stock insuficiente' });
      }

      // Crear la venta
      const nuevaVenta = new Venta({
        tipo: 'cafeteria',
        cafeteria: item._id,
        cantidad: cantidadVenta,
        precioUnitario: item.precio,
        total: item.precio * cantidadVenta,
        cliente: cliente || 'Cliente genérico',
        fecha: new Date(),
        vendedor: req.session.user.nombre
      });

      await nuevaVenta.save();

      // Actualizar stock y última venta del item
      item.stock -= cantidadVenta;
      item.ultimaVenta = new Date();
      await item.save();

      res.json({ 
        success: true, 
        message: 'Venta registrada exitosamente',
        ventaId: nuevaVenta._id
      });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al procesar la venta: ' + error.message });
    }
  },

  // Mostrar factura
  mostrarFactura: async (req, res) => {
    try {
      const venta = await Venta.findById(req.params.ventaId).populate('cafeteria');
      
      if (!venta || venta.tipo !== 'cafeteria') {
        return res.status(404).render('error', { message: 'Venta no encontrada' });
      }

      res.render('cafeteria/factura_venta_cafeteria', { 
        title: 'Factura de Venta - Cafetería',
        venta,
        user: req.session.user 
      });
    } catch (error) {
      res.status(500).render('error', { message: 'Error al cargar la factura' });
    }
  },

  // Mostrar reportes de ventas
  mostrarReportes: async (req, res) => {
    try {
      res.render('cafeteria/reportes_ventas_cafeteria', { 
        title: 'Reportes de Ventas - Cafetería',
        user: req.session.user,
        activeMenu: 'reportes'
      });
    } catch (error) {
      res.status(500).render('error', { message: 'Error al cargar reportes' });
    }
  }
};

module.exports = cafeteriaController;
