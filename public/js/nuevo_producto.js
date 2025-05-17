// public/js/nuevo_producto.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-nuevo-producto');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const autor = form.autor.value.trim();
    const precio = parseFloat(form.precio.value);

    if (!nombre || !autor || isNaN(precio) || precio <= 0) {
      alert('Por favor, completá todos los campos correctamente.');
      return;
    }

    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, autor, precio })
      });

      if (!res.ok) throw new Error('Error al registrar el producto.');

      alert('Producto registrado correctamente.');
      window.location.href = '/catalogo';
    } catch (error) {
      alert('Error: ' + error.message);
      console.error(error);
    }
  });
});
