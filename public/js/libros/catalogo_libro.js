document.addEventListener('DOMContentLoaded', async () => {
  const tabla = document.getElementById('tabla-libros');
  
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

  fetch('/api/libros')
    .then(res => res.json())
    .then(libros => {
      tabla.innerHTML = '';
      libros.forEach(l => {
        const fila = document.createElement('tr');
        let alerta = '';
        const stock = Number(l.stock || 0);
        const stockMinimo = Number(l.stockMinimo || 5);
        
        // Alerta de stock 0
        if (stock === 0) {
          alerta = `<span class="libro-alerta"><i class='fas fa-book' style='color:#c62828;margin-right:4px;'></i>"${l.nombre}" - Agotado</span>`;
        } else if (stock <= stockMinimo) {
          alerta = `<span class="libro-alerta"><i class='fas fa-book' style='color:#fbc02d;margin-right:4px;'></i>"${l.nombre}" - Solo ${stock} unidades</span>`;
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
        
        // Determinar qué acciones están disponibles según el rol del usuario
        let acciones = '';
        
        // Lógica de colores para el badge de stock
        let colorStock = '';
        if (stock === 0) {
          colorStock = 'stock-cero';
        } else if (stock < stockMinimo) {
          colorStock = 'stock-bajo';
        } else {
          colorStock = 'stock-ok';
        }
        
        // Todos pueden ver el botón de comprar, pero solo si hay stock
        if (stock > 0) {
          acciones += `<a href="/libros/ventas/nueva?libro=${l._id}" class="icon-btn" title="Comprar" style="color:#64b5f6;"><i class="fas fa-shopping-cart"></i></a>`;
        } else {
          acciones += `<span class="icon-btn" title="Sin stock disponible" style="color:#ccc;cursor:not-allowed;"><i class="fas fa-shopping-cart"></i></span>`;
        }
        
        // Solo admin puede sumar stock, editar y eliminar
        if (currentUser && currentUser.rol === 'admin') {
          acciones += `<button data-id="${l._id}" class="icon-btn sumar-stock" title="Sumar 1 al stock" style="color:#43a047;"><i class="fas fa-plus-circle"></i></button>`;
          acciones += `<a href="/libros/editar/${l._id}" class="icon-btn" title="Modificar"><i class="fas fa-edit"></i></a>`;
          acciones += `<button data-id="${l._id}" class="icon-btn delete" title="Eliminar"><i class="fas fa-trash-alt"></i></button>`;
        } else {
          // Los empleados ven iconos deshabilitados
          acciones += `<span class="icon-btn" title="Solo administradores pueden editar stock" style="color:#ccc;cursor:not-allowed;"><i class="fas fa-plus-circle"></i></span>`;
          acciones += `<span class="icon-btn" title="Solo administradores pueden editar" style="color:#ccc;cursor:not-allowed;"><i class="fas fa-edit"></i></span>`;
          acciones += `<span class="icon-btn" title="Solo administradores pueden eliminar" style="color:#ccc;cursor:not-allowed;"><i class="fas fa-trash-alt"></i></span>`;
        }
        
        fila.innerHTML = `
          <td>${l.nombre}</td>
          <td>${l.autor}</td>
          <td>${l.genero || '-'} </td>
          <td>$${l.precio}</td>
          <td><span class="stock-badge ${colorStock}">${stock} unidades</span></td>
          <td>${stockMinimo}</td>
          <td>${l.ultimaVenta ? new Date(l.ultimaVenta).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</td>
          <td>${l.proveedor && l.proveedor.nombre ? l.proveedor.nombre : '-'}</td>
          <td style="text-align:center;display:flex;flex-direction:row;align-items:center;gap:4px;justify-content:center;">
            ${acciones}
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
              
              // Obtener el stock mínimo de la fila actual
              const stockMinimoTd = fila.querySelectorAll('td')[5]; // Columna de stock mínimo
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
              
              stockSpan.textContent = `${data.stock} unidades`;
              stockSpan.className = `stock-badge ${colorStock}`;
              
              // Actualizar también el ícono del carrito si ahora hay stock
              const carritoElement = fila.querySelector('a[href*="/libros/ventas/nueva"], span[title="Sin stock disponible"]');
              if (carritoElement && data.stock > 0) {
                if (carritoElement.tagName === 'SPAN') {
                  // Convertir span deshabilitado a enlace activo
                  const nuevoCarrito = `<a href="/libros/ventas/nueva?libro=${id}" class="icon-btn" title="Comprar" style="color:#64b5f6;"><i class="fas fa-shopping-cart"></i></a>`;
                  carritoElement.outerHTML = nuevoCarrito;
                }
              }
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