const Usuario = require('../models/Usuario');

async function login(req, res) {
  const { usuario, contrasena } = req.body;
  // Buscar usuario por nombre y password
  const existe = await Usuario.findOne({ nombre: usuario, password: contrasena });
  if (existe) {
    res.redirect('/inicio');
  } else {
    res.redirect(`/login?error=1&usuario=${encodeURIComponent(usuario)}`);
  }
}

function vistaLogin(req, res) {
  const error = req.query.error === '1';
  const usuarioIngresado = req.query.usuario || '';
  res.render('login', { error, usuario: usuarioIngresado });
}

module.exports = {
  login,
  vistaLogin
};
