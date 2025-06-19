document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-editar-proveedor');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = window.location.pathname.split('/').pop();
    const data = {
      nombre: form.nombre.value,
      mail: form.mail.value,
      tipo_proveedor: form.tipo_proveedor.value,
      telefono: form.telefono.value,
      sitio_web: form.sitio_web.value
    };
    try {
      const resp = await fetch(`/api/proveedores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        alert('Proveedor actualizado exitosamente');
        window.location.href = '/proveedores';
      } else {
        const err = await resp.json();
        alert('Error al actualizar proveedor: ' + (err.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error de red al actualizar proveedor');
    }
  });
});
