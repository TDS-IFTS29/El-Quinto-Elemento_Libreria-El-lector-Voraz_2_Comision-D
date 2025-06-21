const mongoose = require('mongoose');

const utileriaSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  precio: Number,
  stock: Number,
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor' }
});

module.exports = mongoose.model('Utileria', utileriaSchema);
