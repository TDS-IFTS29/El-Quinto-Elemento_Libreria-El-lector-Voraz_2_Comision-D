const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  autor: { type: String, required: true },
  precio: { type: Number, required: true },
  genero: { type: String, required: true },
  stock: { type: Number, default: 0 },
  ultimaReposicion: { type: Date },
  ultimaVenta: { type: Date } // Nueva propiedad para guardar la última venta
});

const Libro = mongoose.model('Libro', libroSchema);

module.exports = Libro;
