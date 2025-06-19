// dashboard.js
// Control SPA para navegación de secciones (proveedores, libros, etc.)

window.mostrarSeccion = function(seccion, submenu, id) {
  // Cambia el hash según la sección y submenu
  let hash = `#${seccion}`;
  if (submenu) hash += `-${submenu}`;
  if (id) hash += `-${id}`;
  window.location.hash = hash;
  renderSeccionDesdeHash();
};

function renderSeccionDesdeHash() {
  const hash = window.location.hash.replace('#', '');
  const [seccion, submenu, id] = hash.split('-');
  // Oculta todas las secciones principales
  document.querySelectorAll('.main-panel > section, .main-panel > .nuevo-proveedor-content, .main-panel > .editar-proveedor-content, .dashboard-cards').forEach(el => el.style.display = 'none');

  if (seccion === 'proveedores') {
    if (submenu === 'nuevo') {
      const nuevo = document.querySelector('.nuevo-proveedor-content');
      if (nuevo) nuevo.style.display = '';
    } else if (submenu === 'editar' && id) {
      const editar = document.querySelector('.editar-proveedor-content');
      if (editar) editar.style.display = '';
    } else {
      const catalogo = document.querySelector('.catalogo-content');
      if (catalogo) catalogo.style.display = '';
    }
  } else if (seccion === 'libros') {
    // Mostrar la sección de libros (SPA)
    document.getElementById('seccion-libros').style.display = '';
    document.querySelector('.dashboard-cards')?.style.display = 'none';
  } else {
    // Por defecto, muestra el panel principal
    document.querySelector('.dashboard-cards')?.parentElement.style.display = '';
    document.querySelector('.dashboard-cards')?.style.display = '';
  }
}

window.addEventListener('DOMContentLoaded', renderSeccionDesdeHash);
window.addEventListener('hashchange', renderSeccionDesdeHash);
