// controllers/productosController.js
const Producto = require('../models/Producto');
const mongoose = require('mongoose');

// API RESTful
async function listar(req, res) {
  const productos = await Producto.find();
  res.json(productos);
}

async function crear(req, res) {
  const nuevo = new Producto({
    nombre: req.body.nombre,
    autor: req.body.autor,
    precio: parseFloat(req.body.precio)
  });
  await nuevo.save();
  res.status(201).json(nuevo);
}

async function eliminar(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }
  const result = await Producto.findByIdAndDelete(id);
  if (!result) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json({ mensaje: 'Producto eliminado correctamente' });
}

async function guardarEdicion(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }
  const producto = await Producto.findById(id);
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  producto.nombre = req.body.nombre ?? producto.nombre;
  producto.autor = req.body.autor ?? producto.autor;
  producto.precio = req.body.precio ?? producto.precio;
  await producto.save();
  res.json(producto);
}

async function vistaNuevoProducto(req, res) {
  res.render('nuevo_producto');
}

async function vistaEditarProducto(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID de producto inválido');
  }
  const producto = await Producto.findById(id);
  if (!producto) return res.status(404).send('Producto no encontrado');
  res.render('editar_producto', { producto });
}

async function obtener(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }
  const producto = await Producto.findById(id);
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json(producto);
}

module.exports = {
  listar,
  crear,
  eliminar,
  guardarEdicion,
  vistaNuevoProducto,
  vistaEditarProducto,
  obtener
};
