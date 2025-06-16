// public/js/editar_producto_api.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-editar-producto');
  const inputNombre = document.getElementById('nombre');
  const inputAutor = document.getElementById('autor');
  const inputPrecio = document.getElementById('precio');
  const inputId = document.getElementById('producto-id');

  // Obtener ID de la URL (último segmento después de la última barra)
  const id = window.location.pathname.split('/').pop();
  console.log("ID detectado:", id);

  // Cargar producto existente
  fetch(`/api/productos/${id}`)
    .then(res => {
      if (!res.ok) throw new Error('No se encontró el producto');
      return res.json();
    })
    .then(producto => {
      inputId.value = producto._id;
      inputNombre.value = producto.nombre;
      inputAutor.value = producto.autor;
      inputPrecio.value = producto.precio;
    })
    .catch(err => {
      alert('Error al cargar el producto');
      console.error(err);
    });

  // Guardar cambios
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: inputNombre.value,
          autor: inputAutor.value,
          precio: parseFloat(inputPrecio.value)
        })
      });

      if (!res.ok) throw new Error('No se pudo actualizar el producto');

      alert('Producto actualizado correctamente');
      window.location.href = '/catalogo';
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
});