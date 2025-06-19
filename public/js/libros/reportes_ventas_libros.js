// JS para poblar la tabla de reportes de ventas de libros vía API

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.querySelector('tbody');
  const tfoot = document.querySelector('tfoot');
  if (!tbody) return;

  try {
    const res = await fetch('/api/ventas');
    if (!res.ok) throw new Error('Error al cargar ventas');
    const ventas = await res.json();

    // Agrupar ventas por libro
    const resumen = {};
    ventas.forEach(venta => {
      const libroId = venta.libro ? venta.libro._id : venta.libro;
      if (!resumen[libroId]) {
        resumen[libroId] = {
          titulo: venta.libro ? venta.libro.nombre : venta.nombreLibro,
          autor: venta.libro ? venta.libro.autor : venta.autorLibro,
          genero: venta.libro ? venta.libro.genero : '',
          precio: venta.libro ? venta.libro.precio : '',
          cantidad_vendida: 0,
          ingresos: 0
        };
      }
      resumen[libroId].cantidad_vendida += venta.cantidad;
      resumen[libroId].ingresos += (venta.libro ? venta.libro.precio : 0) * venta.cantidad;
    });

    // Renderizar filas
    let totalCantidad = 0;
    let totalIngresos = 0;
    tbody.innerHTML = '';
    Object.values(resumen).forEach(libro => {
      totalCantidad += libro.cantidad_vendida;
      totalIngresos += libro.ingresos;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${libro.titulo}</td>
        <td>${libro.autor}</td>
        <td>${libro.genero}</td>
        <td>${libro.precio}</td>
        <td>${libro.cantidad_vendida}</td>
        <td>${libro.ingresos}</td>
      `;
      tbody.appendChild(tr);
    });
    if (tfoot) {
      tfoot.innerHTML = `<tr><td colspan="4">Total</td><td>${totalCantidad}</td><td>${totalIngresos}</td></tr>`;
    }
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="6">Error al cargar reportes de ventas.</td></tr>';
    if (tfoot) tfoot.innerHTML = '';
    console.error(error);
  }
});