document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-nuevo-libro');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      nombre: form.nombre.value,
      autor: form.autor.value,
      genero: form.genero.value,
      stock: form.stock.value,
      precio: form.precio.value
    };
    try {
      const resp = await fetch('/api/libros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        alert('Libro creado exitosamente');
        window.location.href = '/libros';
      } else {
        const err = await resp.json();
        alert('Error al crear libro: ' + (err.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error de red al crear libro');
    }
  });
});