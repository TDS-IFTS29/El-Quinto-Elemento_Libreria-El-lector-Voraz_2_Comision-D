const express = require('express');
const router = express.Router();
const { verCatalogo } = require('../controllers/catalogoController');

router.get('/', verCatalogo);

module.exports = router;
