// public/js/reportes_ventas.js
document.addEventListener('DOMContentLoaded', async () => {
  const listaMasVendidos = document.getElementById('mas-vendidos');
  const listaSemana = document.getElementById('ventas-semana');

  // Cargar productos más vendidos
  try {
    const res = await fetch('/api/ventas/mas-vendidos');
    if (!res.ok) throw new Error('Error al obtener más vendidos');
    const masVendidos = await res.json();

    listaMasVendidos.innerHTML = '';
    masVendidos.forEach(item => {
      const tr = document.createElement('tr');
      const tdProducto = document.createElement('td');
      tdProducto.textContent = item.producto;
      const tdTotal = document.createElement('td');
      tdTotal.textContent = item.total + ' ventas';
      tr.appendChild(tdProducto);
      tr.appendChild(tdTotal);
      listaMasVendidos.appendChild(tr);
    });
  } catch (error) {
    listaMasVendidos.innerHTML = '<tr><td colspan="2">Error al cargar más vendidos.</td></tr>';
    console.error(error);
  }

  // Cargar ventas de la semana
  try {
    const res = await fetch('/api/ventas/ventas-semana');
    if (!res.ok) throw new Error('Error al obtener ventas de la semana');
    const ventasSemana = await res.json();

    listaSemana.innerHTML = '';
    ventasSemana.forEach(v => {
      let productoNombre = v.producto && v.producto.nombre ? v.producto.nombre : '[Sin nombre]';
      if (typeof v.producto === 'object' && v.producto.autor) {
        productoNombre += ' - ' + v.producto.autor;
      }
      const tr = document.createElement('tr');
      const tdFecha = document.createElement('td');
      tdFecha.textContent = new Date(v.fecha).toLocaleString();
      const tdProducto = document.createElement('td');
      tdProducto.textContent = productoNombre;
      const tdCantidad = document.createElement('td');
      tdCantidad.textContent = v.cantidad;
      tr.appendChild(tdFecha);
      tr.appendChild(tdProducto);
      tr.appendChild(tdCantidad);
      listaSemana.appendChild(tr);
    });
  } catch (error) {
    listaSemana.innerHTML = '<tr><td colspan="3">Error al cargar ventas de la semana.</td></tr>';
    console.error(error);
  }
});
