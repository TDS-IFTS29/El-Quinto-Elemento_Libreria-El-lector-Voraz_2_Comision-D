document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('form-nuevo-libro');
  if (!form) return;

  // Cargar proveedores de tipo libreria y llenar el select
  async function cargarProveedores() {
    try {
      const resp = await fetch('/api/proveedores?tipo=libreria');
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
      autor: form.autor.value,
      genero: form.genero.value,
      stock: form.stock.value,
      precio: form.precio.value,
      proveedor: form.proveedor.value
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