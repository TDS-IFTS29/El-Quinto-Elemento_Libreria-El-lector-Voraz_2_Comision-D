document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tabla-libros');

  fetch('/api/libros')
    .then(res => res.json())
    .then(libros => {
      tabla.innerHTML = '';
      libros.forEach(l => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${l.nombre}</td>
          <td>${l.autor}</td>
          <td>${l.genero || '-'}</td>
          <td>$${l.precio}</td>
          <td><span class="stock-badge ${l.stock === 0 ? 'stock-cero' : l.stock <= 5 ? 'stock-bajo' : 'stock-ok'}">${l.stock ?? '-'} unidades</span></td>
          <td>${l.ultimaVenta ? new Date(l.ultimaVenta).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</td>
          <td style="text-align:center;">
            <a href="/libros/editar/${l._id}" class="icon-btn" title="Editar"><i class="fas fa-edit"></i></a>
            <a href="/libros/ventas/nueva?libro=${l._id}" class="icon-btn" title="Vender" style="color:#64b5f6;"><i class="fas fa-shopping-cart"></i></a>
            <button data-id="${l._id}" class="icon-btn delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
          </td>
        `;
        tabla.appendChild(fila);
      });

      tabla.addEventListener('click', async (e) => {
        if (e.target.closest('.delete')) {
          const btn = e.target.closest('.delete');
          const id = btn.dataset.id;
          const fila = btn.closest('tr');
          if (confirm('¿Seguro que querés eliminar este libro? Esta acción no se puede deshacer.')) {
            const resp = await fetch(`/api/libros/${id}`, { method: 'DELETE' });
            if (resp.ok) {
              fila.style.transition = 'opacity 0.5s';
              fila.style.opacity = '0';
              setTimeout(() => fila.remove(), 500);
              alert('Libro eliminado exitosamente');
            } else {
              alert('Error al eliminar el libro');
            }
          }
        }
      });
    })
    .catch(error => {
      tabla.innerHTML = '<tr><td colspan="7">Error al cargar libros</td></tr>';
      console.error(error);
    });
});