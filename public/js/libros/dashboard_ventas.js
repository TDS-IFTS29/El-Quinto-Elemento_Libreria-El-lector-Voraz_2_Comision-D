// public/js/libros/dashboard_ventas.js
// Carga las ventas recientes y el total del día en el dashboard

document.addEventListener('DOMContentLoaded', async () => {
  const ulVentas = document.getElementById('ventas-recientes');
  const totalSpan = document.getElementById('total-ventas');
  if (!ulVentas || !totalSpan) return;

  try {
    const res = await fetch('/api/libros/ventas');
    const ventas = await res.json();
    // Ordenar por fecha descendente y tomar las 2 últimas ventas
    ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const ultimas = ventas.slice(0, 2);
    ulVentas.innerHTML = '';
    let total = 0;
    ultimas.forEach(v => {
      const nombre = v.libro && v.libro.nombre ? v.libro.nombre : v.nombreLibro;
      const autor = v.libro && v.libro.autor ? v.libro.autor : v.autorLibro;
      const precio = v.libro && v.libro.precio ? v.libro.precio : 0;
      const monto = precio * v.cantidad;
      total += monto;
      const li = document.createElement('li');
      li.className = 'venta';
      li.textContent = `${nombre} - ${autor} x${v.cantidad} ($${monto})`;
      ulVentas.appendChild(li);
    });
    totalSpan.textContent = `$${total}`;
  } catch (error) {
    ulVentas.innerHTML = '<li>Error al cargar ventas</li>';
    totalSpan.textContent = '$0';
  }
});
