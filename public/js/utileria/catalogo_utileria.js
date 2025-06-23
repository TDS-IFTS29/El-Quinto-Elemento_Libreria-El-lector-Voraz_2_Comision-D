document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tabla-utileria');
  fetch('/api/utileria')
    .then(res => res.json())
    .then(items => {
      tabla.innerHTML = '';
      items.forEach(u => {
        let color = '';
        let ahora = new Date();
        let ultimaVenta = u.ultimaVenta ? new Date(u.ultimaVenta) : null;
        let diffMeses = ultimaVenta ? ((ahora.getFullYear() - ultimaVenta.getFullYear()) * 12 + (ahora.getMonth() - ultimaVenta.getMonth())) : 0;
        if (u.stock === 0) {
          color = 'stock-cero';
        } else if (u.stock <= (u.stockMinimo ?? 5)) {
          color = 'stock-bajo';
        } else {
          color = 'stock-ok';
        }
        if (diffMeses >= 6) {
          color = 'stock-sin-venta';
        }
        let badge = `<span class="stock-badge ${color}">${typeof u.stock !== 'undefined' && u.stock !== null ? u.stock : '-'} unidades</span>`;
        tabla.innerHTML += `
          <tr>
            <td>${u.nombre}</td>
            <td>${u.descripcion}</td>
            <td>$${u.precio}</td>
            <td>${badge}</td>
            <td>${u.stockMinimo ?? 5}</td>
            <td>${u.ultimaVenta ? new Date(u.ultimaVenta).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</td>
            <td>${u.proveedor && u.proveedor.nombre ? u.proveedor.nombre : '-'}</td>
            <td style="text-align:center;display:flex;flex-direction:row;align-items:center;gap:4px;justify-content:center;">
              <a href="/utileria/vender?utileria=${u._id}" class="icon-btn" title="Vender" style="color:#64b5f6;"><i class="fas fa-shopping-cart"></i></a>
              <button data-id="${u._id}" class="icon-btn sumar-stock" title="Sumar 1 al stock" style="color:#43a047;"><i class="fas fa-plus-circle"></i></button>
              <a href="/utileria/editar/${u._id}" class="icon-btn" title="Modificar"><i class="fas fa-edit"></i></a>
              <button data-id="${u._id}" class="icon-btn delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
            </td>
          </tr>
        `;
      });
      tabla.addEventListener('click', async (e) => {
        if (e.target.closest('.sumar-stock')) {
          const btn = e.target.closest('.sumar-stock');
          const id = btn.dataset.id;
          const fila = btn.closest('tr');
          try {
            const resp = await fetch(`/api/utileria/${id}/sumar-stock`, { method: 'PATCH' });
            if (resp.ok) {
              const data = await resp.json();
              const stockSpan = fila.querySelector('.stock-badge');
              stockSpan.textContent = `${data.stock} unidades`;
              stockSpan.className = `stock-badge ${data.stock === 0 ? 'stock-cero' : data.stock <= 5 ? 'stock-bajo' : 'stock-ok'}`;
            } else {
              alert('Error al sumar stock');
            }
          } catch {
            alert('Error de red');
          }
        }
        if (e.target.closest('.delete')) {
          const btn = e.target.closest('.delete');
          const id = btn.dataset.id;
          if (confirm('¿Seguro que deseas eliminar este producto?')) {
            try {
              const resp = await fetch(`/api/utileria/${id}`, { method: 'DELETE' });
              if (resp.ok) {
                btn.closest('tr').remove();
              } else {
                alert('Error al eliminar');
              }
            } catch {
              alert('Error de red');
            }
          }
        }
      });
    });
});
