document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tabla-proveedores');

  const cargarProveedores = () => {
    fetch('/api/proveedores')
      .then(res => res.json())
      .then(proveedores => {
        tabla.innerHTML = '';
        proveedores.forEach(p => {
          const fila = document.createElement('tr');
          fila.innerHTML = `
            <td>${p.nombre}</td>
            <td>${p.tipo_proveedor ? p.tipo_proveedor.charAt(0).toUpperCase() + p.tipo_proveedor.slice(1) : ''}</td>
            <td>${p.mail}</td>
            <td>${p.telefono ? `<a href='tel:${p.telefono}'>${p.telefono}</a>` : ''}</td>
            <td>${p.sitio_web ? `<a href='${p.sitio_web}' target='_blank'>${p.sitio_web}</a>` : ''}</td>
            <td style="text-align:center;">
              <a href="/proveedores/editar/${p._id}" class="icon-btn" title="Editar"><i class="fas fa-edit"></i></a>
              <button data-id="${p._id}" class="icon-btn delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
            </td>
          `;
          tabla.appendChild(fila);
        });

        tabla.addEventListener('click', async (e) => {
          let btn = e.target;
          if (btn.classList.contains('delete') || (btn.closest && btn.closest('button.delete'))) {
            if (!btn.classList.contains('delete')) {
              btn = btn.closest('button.delete');
            }
            const id = btn.dataset.id;
            const fila = btn.closest('tr');
            const nombreProveedor = fila.querySelector('td').textContent;
            if (id && confirm(`¿Seguro que querés eliminar este proveedor ${nombreProveedor}?`)) {
              const resp = await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
              if (resp.ok) {
                alert('Proveedor eliminado exitosamente');
                window.location.reload();
              } else {
                alert('Error al eliminar el proveedor');
              }
            }
          }
        });
      })
      .catch(error => {
        tabla.innerHTML = '<tr><td colspan="6">Error al cargar proveedores</td></tr>';
        console.error(error);
      });
  }

  cargarProveedores();
});
