// JS para poblar la tabla de reportes de ventas de libros vía API

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.querySelector('tbody');
  const tfoot = document.querySelector('tfoot');
  const filtro = document.getElementById('filtro-fecha');
  if (!tbody) return;

  let ventas = [];
  try {
    const res = await fetch('/api/ventas?tipo=libro');
    if (!res.ok) throw new Error('Error al cargar ventas');
    ventas = await res.json();
    // Filtrar solo ventas de libros válidas
    ventas = ventas.filter(venta => venta.tipo === 'libro' && venta.nombreLibro && venta.autorLibro && venta.precioLibro > 0);
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="7">Error al cargar reportes de ventas.</td></tr>';
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

    // Agrupar ventas por registro individual (por fecha y libro)
    const resumen = ventasFiltradas.map(venta => ({
      id: venta._id,
      titulo: venta.libro ? venta.libro.nombre : venta.nombreLibro,
      autor: venta.libro ? venta.libro.autor : venta.autorLibro,
      genero: venta.libro ? venta.libro.genero : venta.generoLibro,
      precio: venta.libro ? venta.libro.precio : venta.precioLibro,
      cantidad_vendida: venta.cantidad,
      ingresos: (venta.libro ? venta.libro.precio : venta.precioLibro) * venta.cantidad,
      fecha: new Date(venta.fecha).toLocaleDateString()
    }));

    // Renderizar filas
    let totalCantidad = 0;
    let totalIngresos = 0;
    tbody.innerHTML = '';
    resumen.forEach(libro => {
      totalCantidad += libro.cantidad_vendida;
      totalIngresos += libro.ingresos;
      // Convertir fecha a dd/mm/yyyy
      let fechaParts = libro.fecha.split('/');
      let fechaFormateada = fechaParts.length === 3 ? `${fechaParts[1].padStart(2, '0')}/${fechaParts[0].padStart(2, '0')}/${fechaParts[2]}` : libro.fecha;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${fechaFormateada}</td>
        <td>${libro.titulo}</td>
        <td>${libro.autor}</td>
        <td>${libro.genero}</td>
        <td>$${libro.precio}</td>
        <td>${libro.cantidad_vendida}</td>
        <td>$${libro.ingresos}</td>
        <td style="text-align:center;">
          <a href="/libros/ventas/factura/${libro.id}" title="Ver Factura">
            <i class="fas fa-file-invoice" style="color:#007bff;font-size:1.2em;"></i>
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });
    if (tfoot) {
      tfoot.innerHTML = `<tr style="font-weight:bold;background:#f8f9fa;"><td colspan="6" style="font-weight:bold;">Total</td><td style="font-weight:bold;">$${totalIngresos}</td></tr>`;
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