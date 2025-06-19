document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-nuevo-proveedor');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      nombre: form.nombre.value,
      mail: form.mail.value,
      tipo_proveedor: form.tipo_proveedor.value,
      telefono: form.telefono.value,
      sitio_web: form.sitio_web.value
    };
    try {
      const resp = await fetch('/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        alert('Proveedor creado exitosamente');
        window.location.href = '/proveedores';
      } else {
        const err = await resp.json();
        alert('Error al crear proveedor: ' + (err.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error de red al crear proveedor');
    }
  });
});
