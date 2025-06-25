const Usuario = require('../models/Usuario');

async function login(req, res) {
  const { usuario, contrasena } = req.body;
  try {
    let existe;
    
    // Si el usuario es "admin", buscar por nombre
    if (usuario === 'admin') {
      existe = await Usuario.findOne({ nombre: 'admin' });
    } else {
      // Para todos los demás, buscar solo por email
      existe = await Usuario.findOne({ email: usuario });
    }
    
    if (existe && await existe.compararPassword(contrasena)) {
      console.log(`✅ Login exitoso: ${existe.nombre} (${existe.email})`);
      res.redirect('/inicio');
    } else {
      console.log(`❌ Login fallido para: ${usuario}`);
      res.redirect(`/login?error=1&usuario=${encodeURIComponent(usuario)}`);
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.redirect(`/login?error=1&usuario=${encodeURIComponent(usuario)}`);
  }
}

function vistaLogin(req, res) {
  const error = req.query.error === '1';
  const usuarioIngresado = req.query.usuario || '';
  res.render('login', { error, usuario: usuarioIngresado });
}

// Función para mostrar el catálogo de usuarios
async function verCatalogo(req, res) {
  try {
    const usuarios = await Usuario.find({}).sort({ fechaCreacion: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

// Función para crear un nuevo usuario
async function crear(req, res) {
  try {
    const { nombre, email, password, rol, telefono, activo } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son campos requeridos' });
    }
    
    // Verificar si ya existe un usuario con ese email
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password,
      rol: rol || 'empleado',
      telefono,
      activo: activo !== undefined ? activo : true
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario creado exitosamente', usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario: ' + error.message });
  }
}

// Función para obtener un usuario por ID
async function obtenerPorId(req, res) {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
}

// Función para actualizar un usuario
async function actualizar(req, res) {
  try {
    const { nombre, email, password, rol, telefono, activo } = req.body;
    
    // Buscar el usuario primero
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Verificar si existe otro usuario con el mismo email
    const usuarioConEmail = await Usuario.findOne({ 
      email, 
      _id: { $ne: req.params.id } 
    });
    
    if (usuarioConEmail) {
      return res.status(400).json({ error: 'Ya existe otro usuario con ese email' });
    }

    // Actualizar los campos
    usuario.nombre = nombre;
    usuario.email = email;
    usuario.rol = rol;
    usuario.telefono = telefono;
    usuario.activo = activo;

    // Solo actualizar password si se proporciona
    if (password && password.trim() !== '') {
      usuario.password = password; // Esto activará el middleware pre('save') para cifrar
    }

    // Guardar con .save() para activar el middleware de cifrado
    await usuario.save();

    res.json({ mensaje: 'Usuario actualizado exitosamente', usuario });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario: ' + error.message });
  }
}

// Función para eliminar un usuario
async function eliminar(req, res) {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
}

module.exports = {
  login,
  vistaLogin,
  verCatalogo,
  crear,
  obtenerPorId,
  actualizar,
  eliminar
};
