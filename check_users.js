require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/el-lector-voraz';

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    const usuarios = await Usuario.find();
    console.log('Usuarios en la base de datos:');
    usuarios.forEach(user => {
      console.log(`- Nombre: ${user.nombre}, Email: ${user.email}, Rol: ${user.rol}, Activo: ${user.activo}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();
