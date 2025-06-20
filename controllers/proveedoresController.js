// controllers/proveedoresController.js
const Proveedor = require('../models/Proveedor');
const mongoose = require('mongoose');

// API RESTful
async function listar(req, res) {
  const filtro = {};
  if (req.query.tipo) {
    filtro.tipo_proveedor = req.query.tipo;
  }
  const proveedores = await Proveedor.find(filtro);
  res.json(proveedores);
}

async function crear(req, res) {
  try {
    const nuevo = new Proveedor({
      nombre: req.body.nombre,
      mail: req.body.mail,
      tipo_proveedor: req.body.tipo_proveedor,
      telefono: req.body.telefono,
      sitio_web: req.body.sitio_web
    });
    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ error: error.message || 'Error interno al crear proveedor' });
  }
}

async function eliminar(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de proveedor inválido' });
  }
  const result = await Proveedor.findByIdAndDelete(id);
  if (!result) {
    return res.status(404).json({ error: 'Proveedor no encontrado' });
  }
  res.status(200).json({ mensaje: 'Proveedor eliminado correctamente' }); // status 200 explícito
}

async function actualizar(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de proveedor inválido' });
  }
  const proveedor = await Proveedor.findById(id);
  if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
  proveedor.nombre = req.body.nombre ?? proveedor.nombre;
  proveedor.mail = req.body.mail ?? proveedor.mail;
  proveedor.tipo_proveedor = req.body.tipo_proveedor ?? proveedor.tipo_proveedor;
  proveedor.telefono = req.body.telefono ?? proveedor.telefono;
  proveedor.sitio_web = req.body.sitio_web ?? proveedor.sitio_web;
  await proveedor.save();
  res.status(200).json(proveedor); // status 200 explícito
}

// Solo vistas
async function vistaCatalogo(req, res) {
  res.render('proveedores/catalogo_proveedores');
}

function vistaNuevoProveedor(req, res) {
  res.render('proveedores/nuevo_proveedor');
}

async function formularioEditar(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID de proveedor inválido');
  }
  const proveedor = await Proveedor.findById(id);
  if (!proveedor) return res.status(404).send('Proveedor no encontrado');
  res.render('proveedores/editar_proveedor', { proveedor });
}

async function obtener(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de proveedor inválido' });
  }
  const proveedor = await Proveedor.findById(id);
  if (!proveedor) {
    return res.status(404).json({ error: 'Proveedor no encontrado' });
  }
  res.status(200).json(proveedor); // status 200 explícito
}

async function vistaEditarProveedor(req, res) {
  const id = req.params.id;
  const proveedor = await Proveedor.findById(id);
  if (!proveedor) return res.status(404).send('Proveedor no encontrado');
  res.render('proveedores/editar_proveedor', { proveedor });
}

function vistaCatalogoProveedor(req, res) {
  const exito = req.query.exito;
  res.render('proveedores/catalogo_proveedores', { exito });
}

async function guardarEdicionProveedor(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID de proveedor inválido');
  }
  const proveedor = await Proveedor.findById(id);
  if (!proveedor) return res.status(404).send('Proveedor no encontrado');
  proveedor.nombre = req.body.nombre ?? proveedor.nombre;
  proveedor.mail = req.body.mail ?? proveedor.mail;
  proveedor.tipo_proveedor = req.body.tipo_proveedor ?? proveedor.tipo_proveedor;
  proveedor.telefono = req.body.telefono ?? proveedor.telefono;
  proveedor.sitio_web = req.body.sitio_web ?? proveedor.sitio_web;
  await proveedor.save();
  res.redirect('/proveedores');
}

module.exports = {
  listar,
  crear,
  eliminar,
  actualizar,
  vistaCatalogo,
  vistaNuevoProveedor,
  formularioEditar,
  obtener,
  vistaEditarProveedor,
  vistaCatalogoProveedor,
  guardarEdicionProveedor
};