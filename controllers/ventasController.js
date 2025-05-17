// controllers/ventasController.js
const fs = require('fs').promises;
const path = require('path');
const Venta = require('../models/Venta');

const filePath = path.join(__dirname, '../data/ventas.json');

async function leerVentas() {
  const data = await fs.readFile(filePath, 'utf-8');
  const lista = JSON.parse(data);
  return lista.map(Venta.desdeObjetoPlano);
}

async function guardarVentas(ventas) {
  await fs.writeFile(filePath, JSON.stringify(ventas, null, 2));
}

// API RESTful
async function listar(req, res) {
  const ventas = await leerVentas();
  res.json(ventas);
}

async function registrar(req, res) {
  const ventas = await leerVentas();
  const nueva = new Venta(Date.now(), req.body.producto, parseInt(req.body.cantidad), new Date().toISOString());
  ventas.push(nueva);
  await guardarVentas(ventas);
  res.status(201).json(nueva);
}

async function masVendidos(req, res) {
  const ventas = await leerVentas();
  const contador = {};

  for (const venta of ventas) {
    if (!contador[venta.producto]) {
      contador[venta.producto] = 0;
    }
    contador[venta.producto] += venta.cantidad;
  }

  const resultado = Object.entries(contador)
    .map(([producto, total]) => ({ producto, total }))
    .sort((a, b) => b.total - a.total);

  res.json(resultado);
}

async function ventasSemana(req, res) {
  const ventas = await leerVentas();
  const hace7dias = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recientes = ventas.filter(v => new Date(v.fecha).getTime() >= hace7dias);
  res.json(recientes);
}

// Solo vistas
async function verCatalogo(req, res) {
  res.render('catalogo_ventas');
}

async function verReportes(req, res) {
  const ventas = await leerVentas();

  const contador = {};
  for (const venta of ventas) {
    if (!contador[venta.producto]) {
      contador[venta.producto] = 0;
    }
    contador[venta.producto] += venta.cantidad;
  }

  const masVendidos = Object.entries(contador)
    .map(([producto, total]) => ({ producto, total }))
    .sort((a, b) => b.total - a.total);

  const hace7dias = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const ventasSemana = ventas.filter(v => new Date(v.fecha).getTime() >= hace7dias);

  res.render('reportes_ventas', { masVendidos, ventasSemana });
}

function vistaNuevaVenta(req, res) {
  res.render('nueva_venta');
}

function vistaCatalogoVentas(req, res) {
  res.render('catalogo_ventas');
}

function vistaReportesVentas(req, res) {
  res.render('reportes_ventas');
}


module.exports = {
  listar,
  registrar,
  masVendidos,
  ventasSemana,
  verCatalogo,
  verReportes,
  vistaNuevaVenta,
  vistaCatalogoVentas,
  vistaReportesVentas
};
