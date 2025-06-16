const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  autor: { type: String, required: true },
  precio: { type: Number, required: true }
});

const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;
