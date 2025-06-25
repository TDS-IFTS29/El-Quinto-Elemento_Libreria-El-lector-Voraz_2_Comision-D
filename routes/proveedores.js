const express = require('express');
const router = express.Router();

// Middleware para verificar que solo admin puede acceder a proveedores
function requireAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).render('error', { 
      mensaje: 'Solo los administradores pueden acceder a la gestión de proveedores.',
      user: req.usuario 
    });
  }
  next();
}

// Solo renderiza dashboard para navegación visual
router.get('/', requireAdmin, (req, res) => {
  res.render('dashboard', { 
    proveedores: true, 
    activeMenu: 'catalogo',
    user: req.usuario 
  });
});
router.get('/nuevo', requireAdmin, (req, res) => {
  res.render('dashboard', { 
    proveedores: true, 
    activeMenu: 'nuevo',
    user: req.usuario 
  });
});
router.get('/editar/:id', requireAdmin, (req, res) => {
  res.render('dashboard', { 
    proveedores: true, 
    activeMenu: 'editar', 
    proveedorId: req.params.id,
    user: req.usuario 
  });
});

module.exports = router;
