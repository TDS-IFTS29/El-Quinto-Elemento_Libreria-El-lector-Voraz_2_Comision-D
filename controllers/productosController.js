// controllers/productosController.js
const fs = require('fs').promises;
const path = require('path');
const Producto = require('../models/Producto');

const filePath = path.join(__dirname, '../data/productos.json');

async function leerProductos() {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data).map(Producto.desdeObjetoPlano);
}

async function guardarProductos(productos) {
  await fs.writeFile(filePath, JSON.stringify(productos, null, 2));
}

// API RESTful
async function listar(req, res) {
  const productos = await leerProductos();
  res.json(productos);
}

async function crear(req, res) {
  const productos = await leerProductos();
  const nuevo = new Producto(
    Date.now(),//para el id
    req.body.nombre,
    req.body.autor,
    parseFloat(req.body.precio)
  );
  productos.push(nuevo);
  await guardarProductos(productos);
  res.status(201).json(nuevo);
}

async function eliminar(req, res) {
  const id = parseInt(req.params.id);
  let productos = await leerProductos();
  const originalLength = productos.length;
  productos = productos.filter(p => p.id !== id);

  if (productos.length === originalLength) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  await guardarProductos(productos);
  res.json({ mensaje: 'Producto eliminado correctamente' });
}

async function guardarEdicion(req, res) {
  const productos = await leerProductos();
  const id = parseInt(req.params.id);
  const index = productos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  productos[index].nombre = req.body.nombre ?? productos[index].nombre;
  productos[index].autor = req.body.autor ?? productos[index].autor;
  productos[index].precio = req.body.precio !== undefined ? parseFloat(req.body.precio) : productos[index].precio;

  await guardarProductos(productos);
  res.json(productos[index]);
}

// Solo vistas: editar producto
async function formularioEditar(req, res) {
  const productos = await leerProductos();
  const producto = productos.find(p => p.id == req.params.id);
  if (!producto) return res.status(404).send('Producto no encontrado');
  res.render('editar_producto', { producto });
}

async function obtener(req, res) {
  const productos = await leerProductos();
  const id = parseInt(req.params.id);
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json(producto);
}

function vistaNuevoProducto(req, res) {
  res.render('nuevo_producto');
}

function vistaEditarProducto(req, res) {
  res.render('editar_producto');
}

function vistaCatalogoProducto(req, res) {
  res.render('catalogo');
}



module.exports = {
  listar,
  crear,
  eliminar,
  guardarEdicion,
  formularioEditar,
  obtener,
  vistaNuevoProducto,
  vistaEditarProducto,
  vistaCatalogoProducto
};
