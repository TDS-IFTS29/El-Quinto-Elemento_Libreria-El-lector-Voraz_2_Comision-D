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
      // Crear sesión con datos del usuario
      req.session.user = {
        _id: existe._id.toString(),
        nombre: existe.nombre,
        email: existe.email,
        rol: existe.rol,
        activo: existe.activo
      };
      
      console.log(`✅ Login exitoso: Usuario ${existe.nombre} (${existe.email}) - Rol: ${existe.rol}`);
      res.redirect('/inicio');
    } else {
      res.redirect(`/login?error=1&usuario=${encodeURIComponent(usuario)}`);
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.redirect(`/login?error=1&usuario=${encodeURIComponent(usuario)}`);
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/login');
  });
}

function vistaLogin(req, res) {
  const error = req.query.error === '1';
  const errorAuth = req.query.error === '2';
  const usuarioIngresado = req.query.usuario || '';
  const mensaje = req.query.mensaje || '';
  
  res.render('login', { 
    error, 
    errorAuth,
    usuario: usuarioIngresado,
    mensaje 
  });
}

// Función para mostrar el catálogo de usuarios (solo admin)
async function verCatalogo(req, res) {
  try {
    // Solo admin puede acceder (verificado por middleware), mostrar todos los usuarios
    const usuarios = await Usuario.find({}).select('-password').sort({ fechaCreacion: -1 });
    
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
    
    // Retornar usuario sin contraseña
    const usuarioSinPassword = await Usuario.findById(nuevoUsuario._id).select('-password');
    res.status(201).json({ mensaje: 'Usuario creado exitosamente', usuario: usuarioSinPassword });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario: ' + error.message });
  }
}

// Función para obtener un usuario por ID
async function obtenerPorId(req, res) {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('Error en obtenerPorId:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
}

// Función para actualizar un usuario (empleado solo puede cambiar su propia contraseña)
async function actualizar(req, res) {
  try {
    const { nombre, email, password, rol, telefono, activo } = req.body;
    const usuarioId = req.params.id;
    
    // Buscar el usuario primero
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Si es empleado, solo puede modificar sus propios datos básicos
    if (req.usuario.rol === 'empleado') {
      if (req.usuario._id.toString() !== usuarioId.toString()) {
        return res.status(403).json({ error: 'Solo puede modificar sus propios datos' });
      }
      
      // Empleado puede cambiar nombre, email y contraseña, pero no rol ni activo
      if (nombre !== undefined) usuario.nombre = nombre;
      if (email !== undefined) usuario.email = email;
      if (password && password.trim() !== '') {
        usuario.password = password;
      }
      
      await usuario.save();
      // Retornar usuario sin contraseña
      const usuarioSinPassword = await Usuario.findById(usuarioId).select('-password');
      return res.json(usuarioSinPassword);
    }
    
    // Solo admin puede modificar todos los campos de cualquier usuario
    if (req.usuario.rol === 'admin') {
      // Verificar si existe otro usuario con el mismo email (solo si se cambió el email)
      if (email && email !== usuario.email) {
        const usuarioConEmail = await Usuario.findOne({ 
          email, 
          _id: { $ne: usuarioId } 
        });
        
        if (usuarioConEmail) {
          return res.status(400).json({ error: 'Ya existe otro usuario con ese email' });
        }
      }

      // Actualizar los campos solo si se proporcionan
      if (nombre !== undefined) usuario.nombre = nombre;
      if (email !== undefined) usuario.email = email;
      if (rol !== undefined) usuario.rol = rol;
      if (telefono !== undefined) usuario.telefono = telefono;
      if (activo !== undefined) usuario.activo = activo;

      // Solo actualizar password si se proporciona
      if (password && password.trim() !== '') {
        usuario.password = password;
      }

      // Guardar con .save() para activar el middleware de cifrado
      await usuario.save();

      // Retornar usuario sin contraseña
      const usuarioSinPassword = await Usuario.findById(usuarioId).select('-password');
      res.json(usuarioSinPassword);
    } else {
      return res.status(403).json({ error: 'No tiene permisos para realizar esta acción' });
    }
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
  logout,
  vistaLogin,
  verCatalogo,
  crear,
  obtenerPorId,
  actualizar,
  eliminar
};
