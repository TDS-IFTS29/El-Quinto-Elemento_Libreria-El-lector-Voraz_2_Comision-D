const mongoose = require('mongoose');
// Registrar el modelo correcto para las ventas de libros
const Libro = require('./Libro');

const ventaSchema = new mongoose.Schema({
  libro: { type: mongoose.Schema.Types.ObjectId, ref: 'Libro', required: true },
  nombreLibro: { type: String, required: true },
  autorLibro: { type: String, required: true },
  cantidad: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

const Venta = mongoose.model('Venta', ventaSchema);

module.exports = Venta;
