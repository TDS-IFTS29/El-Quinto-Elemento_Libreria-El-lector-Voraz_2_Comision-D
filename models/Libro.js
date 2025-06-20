const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  autor: { type: String, required: true },
  precio: { type: Number, required: true },
  genero: { type: String, required: true },
  stock: { type: Number, default: 0 },
  stockMinimo: { type: Number, default: 5 }, // Nuevo campo para alerta
  ultimaReposicion: { type: Date },
  ultimaVenta: { type: Date }, // Nueva propiedad para guardar la última venta
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true } // Referencia a proveedor
});

const Libro = mongoose.model('Libro', libroSchema);

module.exports = Libro;
