// public/js/nueva_venta.js
// Actualizado para mostrar el precio y el total en tiempo real

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-nueva-venta');
  const selectLibro = document.getElementById('libro');
  const precioInput = document.getElementById('precio-libro');
  const cantidadInput = document.getElementById('cantidad');
  const totalInput = document.getElementById('total-venta');

  function actualizarPrecioYTotal() {
    const selected = selectLibro.options[selectLibro.selectedIndex];
    const precio = parseFloat(selected.getAttribute('data-precio')) || 0;
    const cantidad = parseInt(cantidadInput.value) || 0;
    precioInput.value = precio ? `$${precio}` : '';
    totalInput.value = (precio && cantidad) ? `$${precio * cantidad}` : '';
  }

  if (selectLibro && precioInput && cantidadInput && totalInput) {
    selectLibro.addEventListener('change', actualizarPrecioYTotal);
    cantidadInput.addEventListener('input', actualizarPrecioYTotal);
    // Mostrar precio al cargar si hay libro seleccionado
    actualizarPrecioYTotal();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const libro = form.libro.value.trim();
    const cantidad = parseInt(form.cantidad.value);

    if (!libro || cantidad <= 0) {
      alert('Por favor, completá los campos correctamente.');
      return;
    }

    try {
      const res = await fetch('/api/libros/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libro, cantidad })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Error al registrar la venta.');
        return;
      }

      alert('Venta registrada correctamente.');
      window.location.href = '/libros/ventas';
    } catch (error) {
      alert('Error: ' + error.message);
      console.error(error);
    }
  });
});
