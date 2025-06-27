document.addEventListener('DOMContentLoaded', async () => {
  const tabla = document.getElementById('tabla-cafeteria');
  
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

  fetch('/api/cafeteria')
    .then(res => res.json())
    .then(items => {
      tabla.innerHTML = '';
      items.forEach(c => {
        const fila = document.createElement('tr');
        const stock = Number(c.stock || 0);
        const stockMinimo = Number(c.stockMinimo || 5);
        
        // Lógica de colores según las especificaciones:
        let color = '';
        if (stock === 0) {
          color = 'stock-cero';
        } else if (stock < stockMinimo) {
          color = 'stock-bajo';
        } else {
          color = 'stock-ok';
        }
        
        // Determinar qué acciones están disponibles según el rol del usuario
        let acciones = '';
        
        // Todos pueden vender, pero solo si hay stock - Icono de carrito pequeño
        if (stock > 0) {
          acciones += `<a href="/cafeteria/vender?cafeteria=${c._id}" class="icon-btn" title="Vender" style="color:#64b5f6;"><i class="fas fa-shopping-cart"></i></a>`;
        } else {
          acciones += `<span class="icon-btn" title="Sin stock disponible" style="color:#ccc;cursor:not-allowed;"><i class="fas fa-shopping-cart"></i></span>`;
        }
        
        // Solo admin puede sumar stock, editar y eliminar
        if (currentUser && currentUser.rol === 'admin') {
          acciones += `<button type="button" data-id="${c._id}" class="icon-btn sumar-stock" title="Sumar 1 al stock" style="color:#43a047;">
                        <i class="fas fa-plus-circle"></i>
                      </button>`;
          acciones += `<a href="/cafeteria/editar/${c._id}" class="icon-btn" title="Modificar">
                        <i class="fas fa-edit"></i>
                      </a>`;
          acciones += `<button type="button" data-id="${c._id}" class="icon-btn delete" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                      </button>`;
        } else {
          // Los empleados ven iconos deshabilitados
          acciones += `<span class="icon-btn" title="Solo administradores pueden editar stock" style="color:#ccc;cursor:not-allowed;"><i class="fas fa-plus-circle"></i></span>`;
          acciones += `<span class="icon-btn" title="Solo administradores pueden editar" style="color:#ccc;cursor:not-allowed;"><i class="fas fa-edit"></i></span>`;
          acciones += `<span class="icon-btn" title="Solo administradores pueden eliminar" style="color:#ccc;cursor:not-allowed;"><i class="fas fa-trash-alt"></i></span>`;
        }
        
        fila.innerHTML = `
          <td>${c.nombre}</td>
          <td>${c.descripcion}</td>
          <td style="text-transform:capitalize;">${c.categoria}</td>
          <td>$${c.precio}</td>
          <td>
            <span class="stock-badge ${color}">${stock} unidades</span>
          </td>
          <td>${c.stockMinimo ?? 5}</td>
          <td>${c.proveedor && c.proveedor.nombre ? c.proveedor.nombre : ''}</td>            <td style="text-align:center;">
              <div style="display:flex;flex-direction:row;align-items:center;gap:4px;justify-content:center;">
                ${acciones}
              </div>
            </td>
        `;
        
        tabla.appendChild(fila);
      });

      // Event listeners para las acciones
      tabla.addEventListener('click', async (e) => {
        if (e.target.closest('.sumar-stock')) {
          const btn = e.target.closest('.sumar-stock');
          const id = btn.dataset.id;
          const fila = btn.closest('tr');
          try {
            const resp = await fetch(`/api/cafeteria/${id}/sumar-stock`, { method: 'PATCH' });
            if (resp.ok) {
              const data = await resp.json();
              const stockSpan = fila.querySelector('.stock-badge');
              
              // Obtener el stock mínimo de la fila actual
              const stockMinimoTd = fila.querySelectorAll('td')[5];
              const stockMinimo = Number(stockMinimoTd.textContent || 5);
              
              // Determinar el color del badge
              let colorStock = '';
              if (data.stock === 0) {
                colorStock = 'stock-cero';
              } else if (data.stock < stockMinimo) {
                colorStock = 'stock-bajo';
              } else {
                colorStock = 'stock-ok';
              }
              
              stockSpan.textContent = data.stock + ' unidades';
              stockSpan.className = `stock-badge ${colorStock}`;
              
              // Actualizar ícono de carrito si es necesario
              const carritoElement = fila.querySelector('a[href*="/cafeteria/vender"], span[title="Sin stock disponible"]');
              if (carritoElement && data.stock > 0) {
                if (carritoElement.tagName === 'SPAN') {
                  // Convertir span deshabilitado a enlace activo
                  const nuevoCarrito = `<a href="/cafeteria/vender?cafeteria=${id}" class="icon-btn" title="Vender" style="color:#64b5f6;"><i class="fas fa-shopping-cart"></i></a>`;
                  carritoElement.outerHTML = nuevoCarrito;
                }
              }
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
          } catch (err) {
            alert('Error de conexión. Verifique su conexión a internet e intente nuevamente.');
          }
        }

        if (e.target.closest('.delete')) {
          const btn = e.target.closest('.delete');
          const id = btn.dataset.id;
          const fila = btn.closest('tr');
          const nombreItem = fila.querySelector('td').textContent;
          if (confirm(`¿Seguro que querés eliminar el item "${nombreItem}"? Esta acción no se puede deshacer.`)) {
            const resp = await fetch(`/api/cafeteria/${id}`, { method: 'DELETE' });
            if (resp.ok) {
              fila.style.transition = 'opacity 0.5s';
              fila.style.opacity = '0';
              setTimeout(() => fila.remove(), 500);
              alert('Item eliminado exitosamente');
            } else {
              alert('Error al eliminar el item');
            }
          }
        }
      });
    })
    .catch(error => {
      tabla.innerHTML = '<tr><td colspan="8">Error al cargar items de cafetería</td></tr>';
      console.error(error);
    });

  // Manejo de mensajes de confirmación
  const urlParams = new URLSearchParams(window.location.search);
  const successMessage = urlParams.get('success');
  
  if (successMessage) {
    // Mostrar alert simple
    alert('Producto agregado exitosamente' + successMessage);
    
    // Limpiar URL sin recargar la página
    urlParams.delete('success');
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.history.replaceState({}, document.title, newUrl);
  }
});
