// Controlador para las vistas de libros
const Libro = require('../models/Libro');

async function verCatalogo(req, res) {
  // Obtener todos los libros
  const libros = await Libro.find();
  res.render('libros/catalogo_libros', { libros });
}

async function vistaNuevoLibro(req, res) {
  res.render('nuevo_libro');
}

async function vistaReportesLibros(req, res) {
  res.render('libros/reportes_libros');
}

module.exports = {
  verCatalogo,
  vistaNuevoLibro,
  vistaReportesLibros
};
