document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('form-editar-utileria');
  if (!form) return;

  // Cargar proveedores de tipo utileria y llenar el select
  async function cargarProveedores(selectedId) {
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
          if (selectedId && p._id === selectedId) opt.selected = true;
          select.appendChild(opt);
        });
      }
    } catch (e) {
      alert('Error al cargar proveedores');
    }
  }

  // Cargar datos de la utileria y proveedores
  const id = document.getElementById('utileria-id').value || window.location.pathname.split('/').pop();
  try {
    const resp = await fetch(`/api/utileria/${id}`);
    if (resp.ok) {
      const util = await resp.json();
      document.getElementById('nombre').value = util.nombre || '';
      document.getElementById('descripcion').value = util.descripcion || '';
      document.getElementById('precio').value = util.precio || '';
      document.getElementById('stock').value = util.stock || 0;
      document.getElementById('stockMinimo').value = util.stockMinimo || 5;
      await cargarProveedores(util.proveedor && util.proveedor._id ? util.proveedor._id : '');
    } else {
      alert('No se pudo cargar la utilería');
    }
  } catch (e) {
    alert('Error de red al cargar utilería');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('utileria-id').value;
    const data = {
      nombre: form.nombre.value,
      descripcion: form.descripcion.value,
      precio: form.precio.value,
      stock: form.stock.value,
      stockMinimo: form.stockMinimo.value,
      proveedor: form.proveedor.value
    };
    try {
      const resp = await fetch(`/api/utileria/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        alert('Utilería actualizada correctamente.');
        window.location.href = '/utileria';
      } else {
        alert('Error al actualizar utilería');
      }
    } catch (e) {
      alert('Error de red al actualizar utilería');
    }
  });
});
