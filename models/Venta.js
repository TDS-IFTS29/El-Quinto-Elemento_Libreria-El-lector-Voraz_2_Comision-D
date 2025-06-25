const mongoose = require('mongoose');
// Registrar el modelo correcto para las ventas de libros y utilería
const Libro = require('./Libro');
const Utileria = require('./Utileria');

const ventaSchema = new mongoose.Schema({
  // --- LIBROS ---
  libro: { type: mongoose.Schema.Types.ObjectId, ref: 'Libro', required: false },
  nombreLibro: { type: String },
  autorLibro: { type: String },
  generoLibro: { type: String },
  precioLibro: { type: Number },
  // --- UTILERÍA ---
  utileria: { type: mongoose.Schema.Types.ObjectId, ref: 'Utileria', required: false },
  nombreUtileria: { type: String },
  precioUtileria: { type: Number },
  // --- GENERAL ---
  cantidad: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

const Venta = mongoose.model('Venta', ventaSchema);

module.exports = Venta;
