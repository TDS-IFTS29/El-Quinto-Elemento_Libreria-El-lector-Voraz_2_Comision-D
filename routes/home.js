const express = require('express');
const router = express.Router();
const { verInicio } = require('../controllers/homeController');

router.get('/', verInicio); // Muestra la vista principal en /inicio

module.exports = router;
