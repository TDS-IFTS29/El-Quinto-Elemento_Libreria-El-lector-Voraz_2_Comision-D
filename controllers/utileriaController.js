// Controlador para la sección de utilería
const Utileria = require('../models/Utileria');

exports.catalogo = async (req, res) => {
  try {
    const utileria = await Utileria.find().populate('proveedor');
    res.render('utileria/catalogo_utileria', { utileria });
  } catch (err) {
    res.status(500).send('Error al obtener utilería');
  }
};
