const express = require('express');
const router = express.Router();
const { requireRole, requireOwnerOrAdmin } = require('../../middleware/auth');
const {
  verCatalogo,
  crear,
  obtenerPorId,
  actualizar,
  eliminar
} = require('../../controllers/usuariosController');

// GET /api/usuarios - Obtener todos los usuarios (solo admin)
router.get('/', requireRole(['admin']), verCatalogo);

// GET /api/usuarios/me - Obtener información del usuario actual
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'No autorizado' });
  }
});

// POST /api/usuarios - Crear nuevo usuario (solo admin)
router.post('/', requireRole(['admin']), crear);

// GET /api/usuarios/:id - Obtener usuario por ID (propietario o admin)
router.get('/:id', requireOwnerOrAdmin, obtenerPorId);

// PUT /api/usuarios/:id - Actualizar usuario (propietario puede cambiar password, admin todo)
router.put('/:id', requireOwnerOrAdmin, actualizar);

// DELETE /api/usuarios/:id - Eliminar usuario (solo admin)
router.delete('/:id', requireRole(['admin']), eliminar);

module.exports = router;
