// JS para poblar la tabla de reportes de ventas de cafetería vía API

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.querySelector('tbody');
  const tfoot = document.querySelector('tfoot');
  const filtro = document.getElementById('filtro-fecha');
  if (!tbody) return;

  let ventas = [];
  try {
    console.log('Cargando ventas...'); // Debug
    const res = await fetch('/api/ventas');
    if (!res.ok) throw new Error('Error al cargar ventas');
    const todasLasVentas = await res.json();
    console.log('Todas las ventas cargadas:', todasLasVentas.length); // Debug
    
    // Filtrar solo las ventas de cafetería
    ventas = todasLasVentas.filter(venta => venta.cafeteria || venta.nombreCafeteria || venta.tipo === 'cafeteria');
    console.log('Ventas de cafetería filtradas:', ventas.length); // Debug
    console.log('Ejemplo de venta de cafetería:', ventas[0]); // Debug
  } catch (error) {
    console.error('Error al cargar ventas:', error); // Debug
    tbody.innerHTML = '<tr><td colspan="7">Error al cargar reportes de ventas de cafetería.</td></tr>';
    if (tfoot) tfoot.innerHTML = '';
    return;
  }

  function renderTabla(filtroValor) {
    console.log('Renderizando tabla con filtro:', filtroValor); // Debug
    
    // Filtrar ventas según el filtro seleccionado
    const hoy = new Date();
    let ventasFiltradas = ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha);
      if (filtroValor === 'dia') {
        return fechaVenta.getDate() === hoy.getDate() && fechaVenta.getMonth() === hoy.getMonth() && fechaVenta.getFullYear() === hoy.getFullYear();
      } else if (filtroValor === 'semana') {
        const primerDiaSemana = new Date(hoy);
        primerDiaSemana.setDate(hoy.getDate() - hoy.getDay());
        const ultimoDiaSemana = new Date(primerDiaSemana);
        ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6);
        return fechaVenta >= primerDiaSemana && fechaVenta <= ultimoDiaSemana;
      } else if (filtroValor === 'mes') {
        return fechaVenta.getMonth() === hoy.getMonth() && fechaVenta.getFullYear() === hoy.getFullYear();
      }
      return true; // todo
    });

    console.log('Ventas filtradas para mostrar:', ventasFiltradas.length); // Debug

    // Crear resumen de ventas de cafetería
    const resumen = ventasFiltradas.map(venta => {
      const nombre = (venta.cafeteria && venta.cafeteria.nombre) || venta.nombreCafeteria || 'Sin nombre';
      const categoria = (venta.cafeteria && venta.cafeteria.categoria) || venta.categoriaCafeteria || 'Sin categoría';
      const precio = parseFloat((venta.cafeteria && venta.cafeteria.precio) || venta.precioCafeteria || venta.precioUnitario || 0);
      const cantidad = parseInt(venta.cantidad || 0);
      const total = parseFloat(venta.total || (precio * cantidad));
      
      return {
        id: venta._id,
        nombre: nombre,
        categoria: categoria,
        precio: precio,
        cantidad_vendida: cantidad,
        ingresos: total,
        fecha: new Date(venta.fecha).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit', year: 'numeric'})
      };
    });

    console.log('Resumen procesado:', resumen.length, 'items'); // Debug

    // Renderizar filas
    let totalCantidad = 0;
    let totalIngresos = 0;
    tbody.innerHTML = '';
    
    if (resumen.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:20px;">No hay ventas de cafetería en el período seleccionado</td></tr>';
      if (tfoot) tfoot.innerHTML = '';
      return;
    }

    resumen.forEach(item => {
      totalCantidad += item.cantidad_vendida;
      totalIngresos += item.ingresos;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.fecha}</td>
        <td>${item.nombre}</td>
        <td style="text-transform:capitalize;">${item.categoria}</td>
        <td>$${item.precio.toFixed(2)}</td>
        <td>${item.cantidad_vendida}</td>
        <td>$${item.ingresos.toFixed(2)}</td>
        <td style="text-align:center;">
          <a href="/cafeteria/factura/${item.id}" title="Ver Factura">
            <i class="fas fa-file-invoice" style="color:#007bff;font-size:1.2em;"></i>
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    if (tfoot) {
      tfoot.innerHTML = `
        <tr style="background:#f8f9fa;font-weight:bold;">
          <td colspan="4" style="text-align:right;"><strong>Total:</strong></td>
          <td><strong>${totalCantidad}</strong></td>
          <td><strong>$${totalIngresos.toFixed(2)}</strong></td>
          <td></td>
        </tr>
      `;
    }
  }

  // Render inicial
  renderTabla('todo');

  // Evento de cambio de filtro
  if (filtro) {
    filtro.addEventListener('change', e => {
      renderTabla(e.target.value);
    });
  }
});
