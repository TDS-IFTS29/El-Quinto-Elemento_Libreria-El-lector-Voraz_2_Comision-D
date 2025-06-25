const mongoose = require('mongoose');

const utileriaSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  precio: Number,
  stock: Number,
  stockMinimo: Number,
  ultimaVenta: Date,
  ultimaReposicion: Date,
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor' }
});

module.exports = mongoose.model('Utileria', utileriaSchema);
