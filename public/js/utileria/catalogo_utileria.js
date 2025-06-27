document.addEventListener('DOMContentLoaded', async () => {
  const tabla = document.getElementById('tabla-utileria');
  
  // Obtener información del usuario actual para verificar permisos
  let currentUser = null;
  try {
    const userResponse = await fetch('/api/usuarios/me');
    if (userResponse.ok) {
      currentUser = await userResponse.json();
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }

  fetch('/api/utileria')
    .then(res => res.json())
    .then(items => {
      tabla.innerHTML = '';
      items.forEach(u => {
        let color = '';
        const stock = Number(u.stock || 0);
        const stockMinimo = Number(u.stockMinimo || 5);
        
        // Lógica de colores según las especificaciones:
        // 0 unidades: #E57373 (rojo)
        // Menor al stock mínimo: #FFB74D (naranja/amarillo) 
        // Igual o mayor al stock mínimo: #4CAF50 (verde)
        if (stock === 0) {
          color = 'stock-cero';
        } else if (stock < stockMinimo) {
          color = 'stock-bajo';
        } else {
          color = 'stock-ok';
        }
        
        let badge = `<span class="stock-badge ${color}">${stock} unidades</span>`;
        
        // Determinar qué acciones están disponibles según el rol del usuario
        let acciones = '';
        
        // Todos pueden vender, pero solo si hay stock
        if (stock > 0) {
          acciones += `<a href="/utileria/vender?utileria=${u._id}" class="icon-btn" title="Vender" style="color:#64b5f6;"><i class="fas fa-shopping-cart"></i></a>`;
        } else {
          acciones += `<span class="icon-btn" title="Sin stock disponible" style="color:#ccc;cursor:not-allowed;"><i class="fas fa-shopping-cart"></i></span>`;
        }
        
        // Solo admin puede sumar stock, editar y eliminar
        if (currentUser && currentUser.rol === 'admin') {
          acciones += `<button data-id="${u._id}" class="icon-btn sumar-stock" title="Sumar 1 al stock" style="color:#43a047;"><i class="fas fa-plus-circle"></i></button>`;
          acciones += `<a href="/utileria/editar/${u._id}" class="icon-btn" title="Modificar"><i class="fas fa-edit"></i></a>`;
          acciones += `<button data-id="${u._id}" class="icon-btn delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button>`;
        } else {
          // Los empleados ven iconos deshabilitados
          acciones += `<span class="icon-btn" title="Solo administradores pueden editar stock" style="color:#ccc;cursor:not-allowed;"><i class="fas fa-plus-circle"></i></span>`;
          acciones += `<span class="icon-btn" title="Solo administradores pueden editar" style="color:#ccc;cursor:not-allowed;"><i class="fas fa-edit"></i></span>`;
          acciones += `<span class="icon-btn" title="Solo administradores pueden eliminar" style="color:#ccc;cursor:not-allowed;"><i class="fas fa-trash-alt"></i></span>`;
        }
        
        tabla.innerHTML += `
          <tr>
            <td>${u.nombre}</td>
            <td>${u.descripcion}</td>
            <td>$${u.precio}</td>
            <td>${badge}</td>
            <td>${u.stockMinimo ?? 5}</td>
            <td>${u.ultimaVenta ? new Date(u.ultimaVenta).toLocaleDateString('es-AR') : '-'}</td>
            <td>${u.proveedor && u.proveedor.nombre ? u.proveedor.nombre : '-'}</td>
            <td style="text-align:center;">
              <div style="display:flex;flex-direction:row;align-items:center;gap:4px;justify-content:center;">
                ${acciones}
              </div>
            </td>
          </tr>
        `;
      });
      
      // Solo agregar event listeners si hay funcionalidad activa
      if (currentUser && currentUser.rol === 'admin') {
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
                
                // Aplicar la misma lógica de colores
                const stockMinimo = Number(fila.cells[4].textContent); // columna de stock mínimo
                let colorClass = '';
                if (data.stock === 0) {
                  colorClass = 'stock-cero';
                } else if (data.stock < stockMinimo) {
                  colorClass = 'stock-bajo';
                } else {
                  colorClass = 'stock-ok';
                }
                stockSpan.className = `stock-badge ${colorClass}`;
              } else {
                const errorData = await resp.json().catch(() => ({}));
                if (resp.status === 401) {
                  alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
                  window.location.href = '/login';
                } else if (resp.status === 403) {
                  alert('No tiene permisos para realizar esta acción. Solo los administradores pueden modificar el stock.');
                } else {
                  alert(errorData.error || 'Error al sumar stock');
                }
              }
            } catch {
              alert('Error de conexión. Verifique su conexión a internet e intente nuevamente.');
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
                  const errorData = await resp.json();
                  alert(errorData.error || 'Error al eliminar');
                }
              } catch {
                alert('Error de red');
              }
            }
          }
        });
      }
    });
});
