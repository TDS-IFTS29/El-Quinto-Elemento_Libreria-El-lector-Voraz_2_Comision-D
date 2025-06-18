// controllers/proveedoresController.js
const Proveedor = require('../models/Proveedor');
const mongoose = require('mongoose');

// API RESTful
async function listar(req, res) {
  const proveedores = await Proveedor.find();
  res.json(proveedores);
}

async function crear(req, res) {
  const nuevo = new Proveedor({
    nombre: req.body.nombre,
    contacto: req.body.contacto
  });
  await nuevo.save();
  res.status(201).json(nuevo); // Cambiado a status 201 y respuesta JSON
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
  proveedor.contacto = req.body.contacto ?? proveedor.contacto;
  await proveedor.save();
  res.status(200).json(proveedor); // status 200 explícito
}

// Solo vistas
async function vistaCatalogo(req, res) {
  res.render('proveedor/catalogo_proveedores');
}

function vistaNuevoProveedor(req, res) {
  res.render('proveedor/nuevo_proveedor');
}

async function formularioEditar(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID de proveedor inválido');
  }
  const proveedor = await Proveedor.findById(id);
  if (!proveedor) return res.status(404).send('Proveedor no encontrado');
  res.render('proveedor/editar_proveedor', { proveedor });
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
  res.render('proveedor/editar_proveedor', { proveedor });
}

function vistaCatalogoProveedor(req, res) {
  const exito = req.query.exito;
  res.render('proveedor/catalogo_proveedores', { exito });
}

async function guardarEdicionProveedor(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID de proveedor inválido');
  }
  const proveedor = await Proveedor.findById(id);
  if (!proveedor) return res.status(404).send('Proveedor no encontrado');
  proveedor.nombre = req.body.nombre ?? proveedor.nombre;
  proveedor.contacto = req.body.contacto ?? proveedor.contacto;
  await proveedor.save();
  res.redirect('/proveedores/catalogo');
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