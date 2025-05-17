// controllers/proveedoresController.js
const fs = require('fs').promises;
const path = require('path');
const Proveedor = require('../models/Proveedor');

const filePath = path.join(__dirname, '../data/proveedores.json');

async function leerProveedores() {
  const data = await fs.readFile(filePath, 'utf-8');
  const lista = JSON.parse(data);
  return lista.map(Proveedor.desdeObjetoPlano);
}

async function guardarProveedores(proveedores) {
  await fs.writeFile(filePath, JSON.stringify(proveedores, null, 2));
}

// API RESTful
async function listar(req, res) {
  const proveedores = await leerProveedores();
  res.json(proveedores);
}

async function crear(req, res) {
  const proveedores = await leerProveedores();
  const nuevo = new Proveedor(Date.now(), req.body.nombre, req.body.contacto);
  proveedores.push(nuevo);
  await guardarProveedores(proveedores);
  res.status(201).json(nuevo);
}

async function eliminar(req, res) {
  const id = parseInt(req.params.id);
  let proveedores = await leerProveedores();
  const originalLength = proveedores.length;
  proveedores = proveedores.filter(p => p.id !== id);

  if (proveedores.length === originalLength) {
    return res.status(404).json({ error: 'Proveedor no encontrado' });
  }

  await guardarProveedores(proveedores);
  res.json({ mensaje: 'Proveedor eliminado correctamente' });
}

async function actualizar(req, res) {
  const id = parseInt(req.params.id);
  const proveedores = await leerProveedores();
  const index = proveedores.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Proveedor no encontrado' });

  proveedores[index].nombre = req.body.nombre ?? proveedores[index].nombre;
  proveedores[index].contacto = req.body.contacto ?? proveedores[index].contacto;
  await guardarProveedores(proveedores);
  res.json(proveedores[index]);
}

// Solo vistas
async function formularioEditar(req, res) {
  const id = parseInt(req.params.id);
  const proveedores = await leerProveedores();
  const proveedor = proveedores.find(p => p.id === id);
  if (!proveedor) return res.status(404).send('Proveedor no encontrado');
  res.render('editar_proveedor', { proveedor });
}

async function vistaCatalogo(req, res) {
  res.render('catalogo_proveedores');
}

async function obtener(req, res) {
  const proveedores = await leerProveedores();
  const id = parseInt(req.params.id);
  const proveedor = proveedores.find(p => p.id === id);

  if (!proveedor) {
    return res.status(404).json({ error: 'Proveedor no encontrado' });
  }

  res.json(proveedor);
}

function vistaNuevoProveedor(req, res) {
  res.render('nuevo_proveedor');
}

function vistaEditarProveedor(req, res) {
  res.render('editar_proveedor');
}

function vistaCatalogoProveedor(req, res) {
  res.render('catalogo_proveedores');
}



module.exports = {
  listar,
  crear,
  eliminar,
  actualizar,
  formularioEditar,
  vistaCatalogo,
  obtener,
  vistaNuevoProveedor,
  vistaEditarProveedor,
  vistaCatalogoProveedor
};