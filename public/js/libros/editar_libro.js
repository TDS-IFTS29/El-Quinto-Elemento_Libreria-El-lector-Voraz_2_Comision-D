document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('form-editar-libro');
  if (!form) return;

  // Cargar proveedores de tipo libreria y llenar el select
  async function cargarProveedores(selectedId) {
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
          if (selectedId && p._id === selectedId) opt.selected = true;
          select.appendChild(opt);
        });
      }
    } catch (e) {
      alert('Error al cargar proveedores');
    }
  }

  // Cargar datos del libro y proveedores
  const id = document.getElementById('libro-id').value || window.location.pathname.split('/').pop();
  try {
    const resp = await fetch(`/api/libros/${id}`);
    if (resp.ok) {
      const libro = await resp.json();
      document.getElementById('nombre').value = libro.nombre || '';
      document.getElementById('autor').value = libro.autor || '';
      document.getElementById('precio').value = libro.precio || '';
      document.getElementById('stock').value = libro.stock || 0;
      document.getElementById('stockMinimo').value = libro.stockMinimo || 5;
      await cargarProveedores(libro.proveedor && libro.proveedor._id ? libro.proveedor._id : '');
    } else {
      alert('No se pudo cargar el libro');
    }
  } catch (e) {
    alert('Error de red al cargar libro');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('libro-id').value;
    const data = {
      nombre: form.nombre.value,
      autor: form.autor.value,
      precio: form.precio.value,
      stock: form.stock.value,
      stockMinimo: form.stockMinimo.value,
      proveedor: form.proveedor.value
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