// public/js/nuevo_proveedor.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-nuevo-proveedor');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const contacto = form.contacto.value.trim();

    if (!nombre || !contacto) {
      alert('Por favor, completá todos los campos correctamente.');
      return;
    }

    try {
      const res = await fetch('/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, contacto })
      });

      if (!res.ok) throw new Error('Error al registrar el proveedor.');

      alert('Proveedor registrado correctamente.');
      window.location.href = '/proveedores/catalogo';
    } catch (error) {
      alert('Error: ' + error.message);
      console.error(error);
    }
  });
});
