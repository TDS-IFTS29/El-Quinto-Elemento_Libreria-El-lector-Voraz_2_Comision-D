document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('utileriaId');
  const precioInput = document.getElementById('precio-utileria');
  const cantidadInput = document.getElementById('cantidad');
  const totalInput = document.getElementById('total-venta');

  function actualizarPrecioYTotal() {
    const selected = select.options[select.selectedIndex];
    const precio = selected ? Number(selected.getAttribute('data-precio')) : 0;
    precioInput.value = precio ? `$${precio}` : '';
    const cantidad = Number(cantidadInput.value) || 0;
    totalInput.value = precio && cantidad ? `$${precio * cantidad}` : '';
  }

  select.addEventListener('change', actualizarPrecioYTotal);
  cantidadInput.addEventListener('input', actualizarPrecioYTotal);
});
