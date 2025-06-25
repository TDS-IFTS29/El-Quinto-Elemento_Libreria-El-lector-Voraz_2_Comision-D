const express = require('express');
const router = express.Router();
const {
  verCatalogo,
  crear,
  obtenerPorId,
  actualizar,
  eliminar
} = require('../../controllers/usuariosController');

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', verCatalogo);

// POST /api/usuarios - Crear nuevo usuario
router.post('/', crear);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', obtenerPorId);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', actualizar);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', eliminar);

module.exports = router;
