// JS para poblar la tabla de reportes de ventas de utilería vía API

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.querySelector('tbody');
  const tfoot = document.querySelector('tfoot');
  const filtro = document.getElementById('filtro-fecha');
  if (!tbody) return;

  let ventas = [];
  try {
    const res = await fetch('/api/ventas');
    if (!res.ok) throw new Error('Error al cargar ventas');
    const todasLasVentas = await res.json();
    // Filtrar solo las ventas de utilería
    ventas = todasLasVentas.filter(venta => venta.utileria || venta.nombreUtileria);
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6">Error al cargar reportes de ventas de utilería.</td></tr>';
    if (tfoot) tfoot.innerHTML = '';
    console.error(error);
    return;
  }

  function renderTabla(filtroValor) {
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

    // Crear resumen de ventas de utilería
    const resumen = ventasFiltradas.map(venta => {
      const nombre = (venta.utileria && venta.utileria.nombre) || venta.nombreUtileria || 'Sin nombre';
      const descripcion = (venta.utileria && venta.utileria.descripcion) || 'Sin descripción';
      const precio = parseFloat((venta.utileria && venta.utileria.precio) || venta.precioUtileria || 0);
      const cantidad = parseInt(venta.cantidad || 0);
      const ingresos = precio * cantidad;
      
      return {
        id: venta._id,
        nombre: nombre,
        descripcion: descripcion,
        precio: precio,
        cantidad_vendida: cantidad,
        ingresos: ingresos,
        fecha: new Date(venta.fecha).toLocaleDateString()
      };
    });

    // Renderizar filas
    let totalCantidad = 0;
    let totalIngresos = 0;
    tbody.innerHTML = '';
    
    if (resumen.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;">No hay ventas de utilería en el período seleccionado</td></tr>';
      if (tfoot) tfoot.innerHTML = '';
      return;
    }

    resumen.forEach(item => {
      totalCantidad += item.cantidad_vendida;
      totalIngresos += item.ingresos;
      // Convertir fecha a dd/mm/yyyy
      let fechaParts = item.fecha.split('/');
      let fechaFormateada = fechaParts.length === 3 ? `${fechaParts[1].padStart(2, '0')}/${fechaParts[0].padStart(2, '0')}/${fechaParts[2]}` : item.fecha;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${fechaFormateada}</td>
        <td>${item.nombre}</td>
        <td>${item.descripcion}</td>
        <td>$${item.precio.toFixed(2)}</td>
        <td>${item.cantidad_vendida}</td>
        <td>$${item.ingresos.toFixed(2)}</td>
        <td style="text-align:center;">
          <a href="/utileria/factura/${item.id}" title="Ver Factura">
            <i class="fas fa-file-invoice" style="color:#007bff;font-size:1.2em;"></i>
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    if (tfoot) {
      tfoot.innerHTML = `<tr style="background:#f8f9fa;font-weight:bold;"><td colspan="5" style="font-weight:bold;"><strong>Total</strong></td><td style="font-weight:bold;"><strong>$${totalIngresos.toFixed(2)}</strong></td><td></td></tr>`;
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