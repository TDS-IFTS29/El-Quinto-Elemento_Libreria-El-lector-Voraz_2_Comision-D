const mongoose = require('mongoose');
// Registrar el modelo correcto para las ventas de libros, utilería y cafetería
const Libro = require('./Libro');
const Utileria = require('./Utileria');
const Cafeteria = require('./Cafeteria');

const ventaSchema = new mongoose.Schema({
  // Tipo de venta
  tipo: { type: String, enum: ['libro', 'utileria', 'cafeteria'], required: true },
  
  // --- LIBROS ---
  libro: { type: mongoose.Schema.Types.ObjectId, ref: 'Libro', required: false },
  
  // --- UTILERÍA ---
  utileria: { type: mongoose.Schema.Types.ObjectId, ref: 'Utileria', required: false },
  
  // --- CAFETERÍA ---
  cafeteria: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafeteria', required: false },
  
  // --- INFORMACIÓN GENERAL DE LA VENTA ---
  cantidad: { type: Number, required: true },
  precioUnitario: { type: Number, required: true },
  total: { type: Number, required: true },
  cliente: { type: String, default: 'Cliente genérico' },
  vendedor: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  
  // --- CAMPOS LEGACY (mantener compatibilidad) ---
  nombreLibro: { type: String },
  autorLibro: { type: String },
  generoLibro: { type: String },
  precioLibro: { type: Number },
  nombreUtileria: { type: String },
  precioUtileria: { type: Number },
  nombreCafeteria: { type: String },
  precioCafeteria: { type: Number }
});

const Venta = mongoose.model('Venta', ventaSchema);

module.exports = Venta;
