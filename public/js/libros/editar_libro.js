document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-editar-libro');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('libro-id').value;
    const data = {
      nombre: form.nombre.value,
      autor: form.autor.value,
      precio: form.precio.value,
      stock: form.stock.value,
      stockMinimo: form.stockMinimo.value
    };
    try {
      const resp = await fetch(`/api/libros/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        alert('Libro actualizado exitosamente');
        window.location.href = '/libros';
      } else {
        const err = await resp.json();
        alert('Error al actualizar libro: ' + (err.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error de red al actualizar libro');
    }
  });
});