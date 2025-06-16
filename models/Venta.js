const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

const Venta = mongoose.model('Venta', ventaSchema);

module.exports = Venta;
