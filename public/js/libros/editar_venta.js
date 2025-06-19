// JS para editar una venta de libro vía API RESTful

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('form-editar-venta');
  const selectLibro = document.getElementById('libro');
  const precioInput = document.getElementById('precio-libro');
  const cantidadInput = document.getElementById('cantidad');
  const totalInput = document.getElementById('total-venta');

  // Obtener el ID de la venta desde la URL
  const ventaId = window.location.pathname.split('/').pop();

  // Cargar libros y datos de la venta
  try {
    // Cargar libros
    const resLibros = await fetch('/api/libros');
    const libros = await resLibros.json();
    libros.forEach(libro => {
      const option = document.createElement('option');
      option.value = libro._id;
      option.textContent = `${libro.nombre} - ${libro.autor}`;
      option.setAttribute('data-precio', libro.precio);
      selectLibro.appendChild(option);
    });

    // Cargar datos de la venta
    const resVenta = await fetch(`/api/ventas/${ventaId}`);
    if (!resVenta.ok) throw new Error('No se pudo cargar la venta');
    const venta = await resVenta.json();
    selectLibro.value = venta.libro ? venta.libro._id : '';
    cantidadInput.value = venta.cantidad;
    precioInput.value = venta.libro ? `$${venta.libro.precio}` : '';
    totalInput.value = venta.libro ? `$${venta.libro.precio * venta.cantidad}` : '';
  } catch (err) {
    alert('Error al cargar datos: ' + err.message);
  }

  function actualizarPrecioYTotal() {
    const selected = selectLibro.options[selectLibro.selectedIndex];
    const precio = parseFloat(selected.getAttribute('data-precio')) || 0;
    const cantidad = parseInt(cantidadInput.value) || 0;
    precioInput.value = precio ? `$${precio}` : '';
    totalInput.value = (precio && cantidad) ? `$${precio * cantidad}` : '';
  }

  selectLibro.addEventListener('change', actualizarPrecioYTotal);
  cantidadInput.addEventListener('input', actualizarPrecioYTotal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const libro = selectLibro.value;
    const cantidad = parseInt(cantidadInput.value);
    if (!libro || cantidad <= 0) {
      alert('Por favor, completá los campos correctamente.');
      return;
    }
    try {
      const res = await fetch(`/api/ventas/${ventaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libro, cantidad })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Error al actualizar la venta.');
        return;
      }
      alert('Venta actualizada correctamente.');
      window.location.href = '/libros/ventas';
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
});
