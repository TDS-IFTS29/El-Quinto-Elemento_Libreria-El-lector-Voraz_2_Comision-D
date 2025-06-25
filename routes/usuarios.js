const express = require('express');
const router = express.Router();

// Ruta principal: cuando viene del dashboard (/usuarios) mostrar catálogo
router.get('/', (req, res) => {
  res.render('usuarios/catalogo_usuarios', { 
    activeMenu: 'catalogo',
    user: req.session.user
  });
});

// Rutas para vistas del CRUD de usuarios
router.get('/catalogo', (req, res) => {
  res.render('usuarios/catalogo_usuarios', { 
    activeMenu: 'catalogo',
    user: req.session.user
  });
});

router.get('/nuevo', (req, res) => {
  // Solo admin puede acceder a crear nuevos usuarios
  if (req.session.user.rol !== 'admin') {
    return res.status(403).render('error', { 
      mensaje: 'Solo los administradores pueden crear nuevos usuarios.',
      user: req.session.user 
    });
  }
  
  res.render('usuarios/nuevo_usuario', { 
    activeMenu: 'nuevo',
    user: req.session.user
  });
});

router.get('/editar/:id', (req, res) => {
  const usuarioId = req.params.id;
  
  // Verificar permisos: admin puede editar cualquiera, empleado solo a sí mismo
  if (req.session.user.rol !== 'admin' && req.session.user._id !== usuarioId) {
    return res.status(403).render('error', { 
      mensaje: 'Solo puede editar sus propios datos.',
      user: req.session.user 
    });
  }
  
  res.render('usuarios/editar_usuario', { 
    activeMenu: 'editar', 
    usuarioId: req.params.id,
    user: req.session.user,
    esEmpleado: req.session.user.rol === 'empleado'
  });
});

module.exports = router;
