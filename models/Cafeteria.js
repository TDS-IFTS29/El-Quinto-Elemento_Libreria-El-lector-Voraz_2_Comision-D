const mongoose = require('mongoose');

const CafeteriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  stockMinimo: { type: Number, default: 5 },
  categoria: { type: String, required: true }, // bebidas, comidas, snacks, postres
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor' },
  ultimaVenta: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Cafeteria', CafeteriaSchema);
