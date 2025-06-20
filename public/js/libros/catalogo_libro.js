document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tabla-libros');

  fetch('/api/libros')
    .then(res => res.json())
    .then(libros => {
      tabla.innerHTML = '';
      libros.forEach(l => {
        const fila = document.createElement('tr');
        let alerta = '';
        // Alerta de stock 0
        if (l.stock === 0) {
          alerta = `<span class="libro-alerta"><i class='fas fa-book' style='color:#c62828;margin-right:4px;'></i>"${l.nombre}" - Agotado</span>`;
        } else if (l.stock <= (l.stockMinimo ?? 5)) {
          alerta = `<span class="libro-alerta"><i class='fas fa-book' style='color:#fbc02d;margin-right:4px;'></i>"${l.nombre}" - Solo ${l.stock} unidades</span>`;
        }
        // Alerta de libro sin ventas hace más de 6 meses
        if (l.ultimaVenta) {
          const fechaUltimaVenta = new Date(l.ultimaVenta);
          const ahora = new Date();
          const diffMeses = (ahora.getFullYear() - fechaUltimaVenta.getFullYear()) * 12 + (ahora.getMonth() - fechaUltimaVenta.getMonth());
          if (diffMeses >= 6) {
            alerta += `<span class="libro-alerta"><i class='fas fa-book' style='color:#1976d2;margin-right:4px;'></i>"${l.nombre}" - No se vende hace más de 6 meses</span>`;
          }
        }
        fila.innerHTML = `
          <td>${l.nombre}</td>
          <td>${l.autor}</td>
          <td>${l.genero || '-'} </td>
          <td>$${l.precio}</td>
          <td><span class="stock-badge ${l.stock === 0 ? 'stock-cero' : l.stock <= (l.stockMinimo ?? 5) ? 'stock-bajo' : 'stock-ok'}">${l.stock ?? '-'} unidades</span></td>
          <td>${l.stockMinimo ?? 5}</td>
          <td>${l.ultimaVenta ? new Date(l.ultimaVenta).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</td>
          <td>${l.proveedor && l.proveedor.nombre ? l.proveedor.nombre : '-'}</td>
          <td style="text-align:center;display:flex;flex-direction:row;align-items:center;gap:4px;justify-content:center;">
            <a href="/libros/ventas/nueva?libro=${l._id}" class="icon-btn" title="Comprar" style="color:#64b5f6;"><i class="fas fa-shopping-cart"></i></a>
            <button data-id="${l._id}" class="icon-btn sumar-stock" title="Sumar 1 al stock" style="color:#43a047;"><i class="fas fa-plus-circle"></i></button>
            <a href="/libros/editar/${l._id}" class="icon-btn" title="Modificar"><i class="fas fa-edit"></i></a>
            <button data-id="${l._id}" class="icon-btn delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
          </td>
        `;
        tabla.appendChild(fila);
      });

      tabla.addEventListener('click', async (e) => {
        if (e.target.closest('.sumar-stock')) {
          const btn = e.target.closest('.sumar-stock');
          const id = btn.dataset.id;
          const fila = btn.closest('tr');
          try {
            const resp = await fetch(`/api/libros/${id}/sumar-stock`, { method: 'PATCH' });
            if (resp.ok) {
              // Actualizar el stock en la tabla
              const data = await resp.json();
              const stockSpan = fila.querySelector('.stock-badge');
              stockSpan.textContent = `${data.stock} unidades`;
              stockSpan.className = `stock-badge ${data.stock === 0 ? 'stock-cero' : data.stock <= 5 ? 'stock-bajo' : 'stock-ok'}`;
            } else {
              alert('Error al sumar stock');
            }
          } catch (err) {
            alert('Error al sumar stock');
          }
        }

        if (e.target.closest('.delete')) {
          const btn = e.target.closest('.delete');
          const id = btn.dataset.id;
          const fila = btn.closest('tr');
          const nombreLibro = fila.querySelector('td').textContent;
          if (confirm(`¿Seguro que querés eliminar el libro "${nombreLibro}"? Esta acción no se puede deshacer.`)) {
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