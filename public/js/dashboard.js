// dashboard.js
// Control para navegación de secciones (NO SPA - navegación tradicional)

window.mostrarSeccion = function(seccion, submenu, id) {
  // Navegación tradicional - redirigir a la URL correspondiente
  let url = '/' + seccion;
  if (submenu) url += '/' + submenu;
  if (id) url += '/' + id;
  window.location.href = url;
};

function renderSeccionDesdeHash() {
  // No hacer nada - dejar que cada página se renderice normalmente
  // Sin ocultar secciones ni manejar SPA
}

// No cargar event listeners para SPA
// window.addEventListener('DOMContentLoaded', renderSeccionDesdeHash);
// window.addEventListener('hashchange', renderSeccionDesdeHash);
