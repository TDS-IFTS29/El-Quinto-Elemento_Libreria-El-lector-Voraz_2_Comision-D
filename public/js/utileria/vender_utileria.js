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
      
      console.log('Enviando venta:', { utileriaId, cantidad }); // Debug
      
      if (!utileriaId || cantidad <= 0) {
        alert('Por favor, completá los campos correctamente.');
        return;
      }
      
      try {
        const res = await fetch('/utileria/vender', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ utileriaId, cantidad })
        });
        
        console.log('Respuesta del servidor:', res.status); // Debug
        
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Error desconocido' }));
          console.error('Error del servidor:', data); // Debug
          alert(data.error || 'Error al registrar la venta.');
          return;
        }
        
        const data = await res.json();
        console.log('Venta exitosa:', data); // Debug
        alert('Venta registrada correctamente.');
        window.location.href = '/utileria';
      } catch (error) {
        console.error('Error en la petición:', error); // Debug
        alert('Error: ' + error.message);
      }
    });
  }
});
