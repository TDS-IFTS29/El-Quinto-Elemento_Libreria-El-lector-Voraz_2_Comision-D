const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  mail: { type: String, required: true },
  tipo_proveedor: { type: String, enum: ['libreria', 'cafeteria', 'utileria'], required: true, default: 'libreria' },
  whatsapp: { type: String },
  sitio_web: { type: String }
});

const Proveedor = mongoose.model('Proveedor', proveedorSchema);

module.exports = Proveedor;
