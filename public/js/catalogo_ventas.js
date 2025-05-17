// public/js/catalogo_ventas.js
document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tabla-ventas');

  fetch('/api/ventas')
    .then(res => res.json())
    .then(ventas => {
      tabla.innerHTML = '';
      ventas.forEach(v => {
        const fila = document.createElement('tr');
        const fecha = new Date(v.fecha).toLocaleString();
        fila.innerHTML = `
          <td>${fecha}</td>
          <td>${v.producto}</td>
          <td>${v.cantidad}</td>
        `;
        tabla.appendChild(fila);
      });
    })
    .catch(error => {
      tabla.innerHTML = '<tr><td colspan="3">Error al cargar ventas.</td></tr>';
      console.error('Error al cargar ventas:', error);
    });
});
