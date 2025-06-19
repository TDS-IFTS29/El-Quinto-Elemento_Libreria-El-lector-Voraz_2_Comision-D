// Cargar ventas desde la API RESTful y renderizar en la tabla

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.querySelector('tbody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/ventas');
    if (!res.ok) throw new Error('Error al cargar ventas');
    const ventas = await res.json();
    tbody.innerHTML = '';
    if (ventas.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="4">No hay ventas registradas.</td>';
      tbody.appendChild(tr);
      return;
    }
    ventas.forEach(venta => {
      const tr = document.createElement('tr');
      const fecha = new Date(venta.fecha).toLocaleDateString();
      const libro = venta.libro ? venta.libro.nombre : venta.nombreLibro;
      const autor = venta.libro ? venta.libro.autor : venta.autorLibro;
      tr.innerHTML = `
        <td>${fecha}</td>
        <td>${libro}</td>
        <td>${autor}</td>
        <td>${venta.cantidad}</td>
        <td>
          <button class="btn-editar" data-id="${venta._id}">Editar</button>
          <button class="btn-eliminar" data-id="${venta._id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Delegación de eventos para editar y eliminar
    tbody.addEventListener('click', async (e) => {
      if (e.target.classList.contains('btn-eliminar')) {
        const id = e.target.getAttribute('data-id');
        if (confirm('¿Seguro que deseas eliminar esta venta?')) {
          try {
            const res = await fetch(`/api/ventas/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar venta');
            e.target.closest('tr').remove();
          } catch (err) {
            alert('Error al eliminar venta');
          }
        }
      } else if (e.target.classList.contains('btn-editar')) {
        const id = e.target.getAttribute('data-id');
        window.location.href = `/libros/ventas/editar/${id}`;
      }
    });
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="4">Error al cargar ventas.</td></tr>';
    console.error(error);
  }
});