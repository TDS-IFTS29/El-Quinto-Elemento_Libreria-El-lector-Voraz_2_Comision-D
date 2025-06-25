const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'empleado', 'vendedor'], default: 'empleado' },
  telefono: { type: String },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now }
});

// Middleware para cifrar la contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
  // Solo cifrar la contraseña si ha sido modificada
  if (!this.isModified('password')) return next();
  
  try {
    // Generar salt y cifrar la contraseña
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
