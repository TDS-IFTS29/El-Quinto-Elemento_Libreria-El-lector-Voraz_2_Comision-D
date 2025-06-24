document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('utileriaId');
  const precioInput = document.getElementById('precio-utileria');
  const cantidadInput = document.getElementById('cantidad');
  const totalInput = document.getElementById('total-venta');
  const form = document.getElementById('form-nueva-venta-utileria');

  function actualizarPrecioYTotal() {
    const selected = select.options[select.selectedIndex];
    const precio = selected ? Number(selected.getAttribute('data-precio')) : 0;
    precioInput.value = precio ? `$${precio}` : '';
    const cantidad = Number(cantidadInput.value) || 0;
    totalInput.value = precio && cantidad ? `$${precio * cantidad}` : '';
  }

  select.addEventListener('change', actualizarPrecioYTotal);
  cantidadInput.addEventListener('input', actualizarPrecioYTotal);

  // Si hay un producto preseleccionado, mostrar su precio al cargar
  if (select.value) {
    actualizarPrecioYTotal();
  }

  // Interceptar submit para AJAX
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const utileriaId = form.utileriaId.value.trim();
      const cantidad = parseInt(form.cantidad.value);
      if (!utileriaId || cantidad <= 0) {
        alert('Por favor, completá los campos correctamente.');
        return;
      }
      try {
        const res = await fetch('/utileria/vender', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ utileriaId, cantidad })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error || 'Error al registrar la venta.');
          return;
        }
        alert('Venta registrada correctamente.');
        window.location.href = '/utileria';
      } catch (error) {
        alert('Error: ' + error.message);
        console.error(error);
      }
    });
  }
});
