const express = require('express');
const router = express.Router();

// Ruta para la documentación de la API
router.get('/', (req, res) => {
  res.render('api_docs');
});

module.exports = router;