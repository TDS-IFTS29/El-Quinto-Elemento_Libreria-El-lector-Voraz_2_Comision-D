document.addEventListener('DOMContentLoaded', async function() {
  let currentUser = null;
  
  try {
    // First get current user info to check permissions
    const userResponse = await fetch('/api/usuarios/me');
    if (userResponse.ok) {
      currentUser = await userResponse.json();
    }
    
    const response = await fetch('/api/usuarios');
    if (!response.ok) throw new Error('Error al cargar usuarios');
    
    const usuarios = await response.json();
    const tbody = document.getElementById('tabla-usuarios');
    
    if (usuarios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No hay usuarios registrados</td></tr>';
      return;
    }
    
    tbody.innerHTML = usuarios.map(usuario => {
      // Formatear fecha como dd/mm/yyyy
      const fecha = new Date(usuario.fechaCreacion);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const año = fecha.getFullYear();
      const fechaFormateada = `${dia}/${mes}/${año}`;
      
      const estadoTexto = usuario.activo ? 'Activo' : 'Inactivo';
      const estadoClase = usuario.activo ? 'estado-activo' : 'estado-inactivo';
      
      // Determine what actions are available based on permissions
      let acciones = '';
      
      if (currentUser) {
        const isAdmin = currentUser.rol === 'admin';
        const isOwnUser = currentUser._id === usuario._id;
        
        if (isAdmin || isOwnUser) {
          // Edit button - admin can edit anyone, employee can edit themselves
          acciones += `<button class="button-edit" onclick="editarUsuario('${usuario._id}')" title="Editar usuario">
              <i class="fas fa-edit"></i>
            </button>`;
        }
        
        if (isAdmin && !isOwnUser) {
          // Delete button - only admin can delete, and not themselves
          acciones += `<button class="button-delete" onclick="eliminarUsuario('${usuario._id}', '${usuario.nombre}')" title="Eliminar usuario">
              <i class="fas fa-trash"></i>
            </button>`;
        }
      }
      
      if (!acciones) {
        acciones = '<span style="color: #666;">Sin acciones</span>';
      }
      
      return `
        <tr>
          <td>${usuario.nombre}</td>
          <td>${usuario.email}</td>
          <td>${usuario.rol === 'admin' ? 'Administrador' : 'Empleado'}</td>
          <td>${usuario.telefono || '-'}</td>
          <td><span class="${estadoClase}">${estadoTexto}</span></td>
          <td>${fechaFormateada}</td>
          <td class="acciones-col">
            ${acciones}
          </td>
        </tr>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('tabla-usuarios').innerHTML = 
      '<tr><td colspan="7">Error al cargar usuarios</td></tr>';
  }
});

function editarUsuario(id) {
  window.location.href = `/usuarios/editar/${id}`;
}

async function eliminarUsuario(id, nombre) {
  if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${nombre}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/usuarios/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      alert('Usuario eliminado exitosamente');
      location.reload();
    } else {
      const error = await response.json();
      alert('Error al eliminar usuario: ' + error.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de red al eliminar usuario');
  }
}

// Agregar estilos CSS para los estados
const style = document.createElement('style');
style.textContent = `
  .estado-activo {
    background-color: #d4edda;
    color: #155724;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  
  .estado-inactivo {
    background-color: #f8d7da;
    color: #721c24;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  
  .acciones-col {
    text-align: center;
    white-space: nowrap;
  }
  
  .button-edit {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 8px 10px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 6px;
    font-size: 0.9em;
    transition: background-color 0.2s;
  }
  
  .button-edit:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
  }
  
  .button-delete {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 8px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.2s;
  }
  
  .button-delete:hover {
    background-color: #c82333;
    transform: translateY(-1px);
  }
  
  .button-edit i, .button-delete i {
    font-size: 0.9em;
  }
`;
document.head.appendChild(style);
