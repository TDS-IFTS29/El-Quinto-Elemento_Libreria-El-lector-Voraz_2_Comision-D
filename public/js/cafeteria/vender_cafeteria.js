document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-nueva-venta-cafeteria');
  const cafeteriaSelect = document.getElementById('cafeteria');
  const cantidadInput = document.getElementById('cantidad');
  const stockDisponibleInput = document.getElementById('stock-disponible');
  const precioCafeteriaInput = document.getElementById('precio-cafeteria');
  const totalVentaInput = document.getElementById('total-venta');

  // Actualizar información cuando cambia el item seleccionado
  cafeteriaSelect.addEventListener('change', actualizarInformacion);
  cantidadInput.addEventListener('input', actualizarTotal);

  function actualizarInformacion() {
    const selectedOption = cafeteriaSelect.selectedOptions[0];
    
    if (selectedOption && selectedOption.value) {
      const precio = parseFloat(selectedOption.dataset.precio);
      const stock = parseInt(selectedOption.dataset.stock);
      
      stockDisponibleInput.value = `${stock} unidades`;
      precioCafeteriaInput.value = `$${precio.toFixed(2)}`;
      
      // Actualizar límite de cantidad
      cantidadInput.max = stock;
      cantidadInput.value = Math.min(parseInt(cantidadInput.value) || 1, stock);
      
      actualizarTotal();
    } else {
      stockDisponibleInput.value = '';
      precioCafeteriaInput.value = '';
      totalVentaInput.value = '';
      cantidadInput.max = '';
    }
  }

  function actualizarTotal() {
    const selectedOption = cafeteriaSelect.selectedOptions[0];
    const cantidad = parseInt(cantidadInput.value) || 0;
    
    if (selectedOption && selectedOption.value && cantidad > 0) {
      const precio = parseFloat(selectedOption.dataset.precio);
      const stock = parseInt(selectedOption.dataset.stock);
      const total = precio * cantidad;
      
      totalVentaInput.value = `$${total.toFixed(2)}`;
      
      // Validar que no exceda el stock
      if (cantidad > stock) {
        cantidadInput.value = stock;
        actualizarTotal();
        return;
      }
    } else {
      totalVentaInput.value = '';
    }
  }

  // Manejar envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validaciones
    if (!data.cafeteria) {
      alert('Por favor, selecciona un producto.');
      return;
    }
    
    const cantidad = parseInt(data.cantidad);
    if (!cantidad || cantidad <= 0) {
      alert('Por favor, ingresa una cantidad válida.');
      return;
    }
    
    const selectedOption = cafeteriaSelect.selectedOptions[0];
    const stock = parseInt(selectedOption.dataset.stock);
    
    if (cantidad > stock) {
      alert(`No hay suficiente stock. Disponible: ${stock} unidades.`);
      return;
    }
    
    try {
      const response = await fetch('/api/cafeteria/vender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cafeteriaId: data.cafeteria,
          cantidad: cantidad
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        const total = parseFloat(selectedOption.dataset.precio) * cantidad;
        alert(`Venta registrada exitosamente. Total: $${total.toFixed(2)}`);
        
        // Limpiar formulario
        form.reset();
        actualizarInformacion();
        
        // Redirigir al catálogo
        window.location.href = '/cafeteria';
        
      } else {
        alert('Error: ' + (result.message || 'No se pudo procesar la venta'));
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la venta. Inténtalo de nuevo.');
    }
  });

  // Inicializar información si hay un item preseleccionado
  if (cafeteriaSelect.value) {
    actualizarInformacion();
  }
});
