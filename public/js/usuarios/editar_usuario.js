document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('form-editar-usuario');
  const usuarioId = window.location.pathname.split('/').pop();
  const passwordInput = document.getElementById('password');
  const confirmarPasswordInput = document.getElementById('confirmarPassword');
  const emailInput = document.getElementById('email');
  
  // Validación en tiempo real de la contraseña
  passwordInput.addEventListener('input', function() {
    const password = this.value;
    if (password.length > 0 && password.length < 6) {
      this.style.borderColor = '#dc3545';
      this.style.backgroundColor = '#ffe6e6';
    } else {
      this.style.borderColor = '#ccc';
      this.style.backgroundColor = '#fff';
    }
    
    // Verificar coincidencia con confirmación si ya tiene valor
    verificarCoincidenciaPasswords();
  });
  
  // Validación en tiempo real de la confirmación de contraseña
  confirmarPasswordInput.addEventListener('input', verificarCoincidenciaPasswords);
  
  function verificarCoincidenciaPasswords() {
    const password = passwordInput.value;
    const confirmarPassword = confirmarPasswordInput.value;
    
    if (password || confirmarPassword) {
      if (password === confirmarPassword) {
        confirmarPasswordInput.style.borderColor = '#28a745';
        confirmarPasswordInput.style.backgroundColor = '#e8f5e8';
      } else {
        confirmarPasswordInput.style.borderColor = '#dc3545';
        confirmarPasswordInput.style.backgroundColor = '#ffe6e6';
      }
    } else {
      confirmarPasswordInput.style.borderColor = '#ccc';
      confirmarPasswordInput.style.backgroundColor = '#fff';
    }
  }
  
  // Validación en tiempo real del email
  emailInput.addEventListener('blur', function() {
    const email = this.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.style.borderColor = '#dc3545';
      this.style.backgroundColor = '#ffe6e6';
    } else {
      this.style.borderColor = '#ccc';
      this.style.backgroundColor = '#fff';
    }
  });
  
  // Manejo del formulario
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const usuario = {
      nombre: formData.get('nombre'),
      email: formData.get('email'),
      rol: formData.get('rol'),
      telefono: formData.get('telefono'),
      activo: formData.get('activo') === 'on'
    };
    
    // Solo incluir password si se ha proporcionado
    const password = formData.get('password');
    const confirmarPassword = formData.get('confirmarPassword');
    
    if (password && password.trim() !== '') {
      // Validar que las contraseñas coincidan
      if (password !== confirmarPassword) {
        alert('Las contraseñas no coinciden. Por favor verifica que ambas sean iguales.');
        document.getElementById('confirmarPassword').focus();
        return;
      }
      usuario.password = password.trim();
    }
    
    // Validación básica
    if (!usuario.nombre || !usuario.email) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuario.email)) {
      alert('Por favor ingresa un email válido');
      return;
    }
    
    // Validación de contraseña si se ha proporcionado
    if (usuario.password && usuario.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      const response = await fetch(`/api/usuarios/${usuarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Usuario actualizado exitosamente');
        window.location.href = '/usuarios';
      } else {
        alert('Error al actualizar usuario: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de red al actualizar usuario');
    }
  });
});
