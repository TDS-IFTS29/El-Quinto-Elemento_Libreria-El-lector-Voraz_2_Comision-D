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
      const li = document.createElement('li');
      li.textContent = `${item.producto} – ${item.total} ventas`;
      listaMasVendidos.appendChild(li);
    });
  } catch (error) {
    listaMasVendidos.innerHTML = '<li>Error al cargar más vendidos.</li>';
    console.error(error);
  }

  // Cargar ventas de la semana
  try {
    const res = await fetch('/api/ventas/ventas-semana');
    if (!res.ok) throw new Error('Error al obtener ventas de la semana');
    const ventasSemana = await res.json();

    listaSemana.innerHTML = '';
    ventasSemana.forEach(v => {
      const li = document.createElement('li');
      li.textContent = `${v.producto} – Cantidad: ${v.cantidad} – Fecha: ${new Date(v.fecha).toLocaleString()}`;
      listaSemana.appendChild(li);
    });
  } catch (error) {
    listaSemana.innerHTML = '<li>Error al cargar ventas de la semana.</li>';
    console.error(error);
  }
});
