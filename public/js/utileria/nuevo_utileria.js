document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('form-nueva-utileria');
  if (!form) return;

  // Cargar proveedores de tipo utileria y llenar el select
  async function cargarProveedores() {
    try {
      const resp = await fetch('/api/proveedores?tipo=utileria');
      if (resp.ok) {
        const proveedores = await resp.json();
        const select = document.getElementById('proveedor');
        select.innerHTML = '<option value="">Selecciona un proveedor</option>';
        proveedores.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p._id;
          opt.textContent = p.nombre;
          select.appendChild(opt);
        });
      }
    } catch (e) {
      alert('Error al cargar proveedores');
    }
  }
  await cargarProveedores();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      nombre: form.nombre.value,
      descripcion: form.descripcion.value,
      stock: form.stock.value,
      stockMinimo: form.stockMinimo.value,
      precio: form.precio.value,
      proveedor: form.proveedor.value
    };
    try {
      const resp = await fetch('/api/utileria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        alert('Artículo de utilería creado exitosamente');
        window.location.href = '/utileria';
      } else {
        const err = await resp.json();
        alert('Error al crear utilería: ' + (err.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error de red al crear utilería');
    }
  });
});
