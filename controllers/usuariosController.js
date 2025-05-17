const fs = require('fs').promises;
const path = require('path');
const filePath = path.join(__dirname, '../data/usuarios.json');

async function leerUsuarios() {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function login(req, res) {
  const { usuario, contrasena } = req.body;
  const usuarios = await leerUsuarios();
  const existe = usuarios.find(u => u.usuario === usuario && u.contrasena === contrasena);

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
