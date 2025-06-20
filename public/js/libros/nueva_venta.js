// public/js/nueva_venta.js
// Actualizado para mostrar el precio y el total en tiempo real y cargar libros vía fetch

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('form-nueva-venta');
  const selectLibro = document.getElementById('libro');
  const precioInput = document.getElementById('precio-libro');
  const cantidadInput = document.getElementById('cantidad');
  const totalInput = document.getElementById('total-venta');

  // Detectar parámetro 'libro' en la URL
  const params = new URLSearchParams(window.location.search);
  const libroIdParam = params.get('libro');

  // Cargar libros vía API
  try {
    const resLibros = await fetch('/api/libros');
    if (!resLibros.ok) throw new Error('No se pudieron cargar los libros');
    const libros = await resLibros.json();
    libros.forEach(libro => {
      const option = document.createElement('option');
      option.value = libro._id;
      option.textContent = `${libro.nombre} - ${libro.autor}`;
      option.setAttribute('data-precio', libro.precio);
      if (libroIdParam && libro._id === libroIdParam) {
        option.selected = true;
      }
      selectLibro.appendChild(option);
    });
    // Si hay libro en la URL, actualizar precio y total
    if (libroIdParam) {
      actualizarPrecioYTotal();
    }
  } catch (err) {
    alert('Error al cargar libros: ' + err.message);
  }

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
      const res = await fetch('/api/ventas', {
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
      window.location.href = '/libros';
    } catch (error) {
      alert('Error: ' + error.message);
      console.error(error);
    }
  });
});
