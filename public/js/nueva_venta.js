// public/js/nueva_venta.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-nueva-venta');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const producto = form.producto.value.trim();
    const cantidad = parseInt(form.cantidad.value);

    if (!producto || cantidad <= 0) {
      alert('Por favor, completá los campos correctamente.');
      return;
    }

    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producto, cantidad })
      });

      if (!res.ok) throw new Error('Error al registrar la venta.');

      const nuevaVenta = await res.json();
      alert('Venta registrada correctamente.');
      window.location.href = '/ventas/catalogo';
    } catch (error) {
      alert('Error: ' + error.message);
      console.error(error);
    }
  });
});