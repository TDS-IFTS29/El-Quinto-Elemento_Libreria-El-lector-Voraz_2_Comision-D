document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tabla-proveedores');

  fetch('/api/proveedores')
    .then(res => res.json())
    .then(proveedores => {
      tabla.innerHTML = '';
      proveedores.forEach(p => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${p.nombre}</td>
          <td>${p.contacto}</td>
          <td style="text-align:center;">
            <a href="/proveedores/editar/${p._id}" class="icon-btn" title="Editar"><i class="fas fa-edit"></i></a>
            <button data-id="${p._id}" class="icon-btn delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
          </td>
        `;
        tabla.appendChild(fila);
      });

      tabla.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete')) {
          const id = e.target.dataset.id;
          if (confirm('¿Seguro que querés eliminar este proveedor?')) {
            const resp = await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
            if (resp.ok) {
              alert('Proveedor eliminado exitosamente');
              location.reload();
            } else {
              alert('Error al eliminar el proveedor');
            }
          }
        }
      });
    })
    .catch(error => {
      tabla.innerHTML = '<tr><td colspan="3">Error al cargar proveedores</td></tr>';
      console.error(error);
    });
});