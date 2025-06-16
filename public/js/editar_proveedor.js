// public/js/editar_proveedor.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-editar-proveedor');
  const inputNombre = document.getElementById('nombre');
  const inputContacto = document.getElementById('contacto');
  const inputId = document.getElementById('proveedor-id');

  // Obtener ID de la URL (último segmento después de la última barra)
  const id = window.location.pathname.split('/').pop();
  console.log("ID detectado:", id);

  // Cargar proveedor existente
  fetch(`/api/proveedores/${id}`)
    .then(res => {
      if (!res.ok) throw new Error('No se encontró el proveedor');
      return res.json();
    })
    .then(proveedor => {
      inputId.value = proveedor._id;
      inputNombre.value = proveedor.nombre;
      inputContacto.value = proveedor.contacto;
    })
    .catch(err => {
      alert('Error al cargar el proveedor');
      console.error(err);
    });

  // Guardar cambios
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/proveedores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: inputNombre.value,
          contacto: inputContacto.value
        })
      });

      if (!res.ok) throw new Error('No se pudo actualizar el proveedor');

      alert('Proveedor actualizado correctamente');
      window.location.href = '/proveedores/catalogo';
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
});
