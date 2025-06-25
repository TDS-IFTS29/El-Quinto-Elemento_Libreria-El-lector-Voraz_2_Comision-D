document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('form-nuevo-usuario');
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const usuario = {
      nombre: formData.get('nombre'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmarPassword: formData.get('confirmarPassword'),
      rol: formData.get('rol'),
      telefono: formData.get('telefono'),
      activo: formData.get('activo') === 'on'
    };
    
    // Validación básica
    if (!usuario.nombre || !usuario.email || !usuario.password || !usuario.confirmarPassword) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuario.email)) {
      alert('Por favor ingresa un email válido');
      return;
    }
    
    // Validación de contraseña
    if (usuario.password.length < 4) {
      alert('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    
    // Validación de confirmación de contraseña
    if (usuario.password !== usuario.confirmarPassword) {
      alert('Las contraseñas no coinciden. Por favor verifica que hayas escrito la misma contraseña en ambos campos.');
      return;
    }
    
    // Remover confirmarPassword del objeto a enviar
    delete usuario.confirmarPassword;
    
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Usuario creado exitosamente');
        window.location.href = '/usuarios';
      } else {
        alert('Error al crear usuario: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de red al crear usuario');
    }
  });
  
  // Validación en tiempo real del email
  const emailInput = document.getElementById('email');
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
  
  // Validación en tiempo real de la contraseña
  const passwordInput = document.getElementById('password');
  const confirmarPasswordInput = document.getElementById('confirmarPassword');
  
  passwordInput.addEventListener('input', function() {
    const password = this.value;
    if (password.length > 0 && password.length < 4) {
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
    
    if (confirmarPassword.length > 0) {
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
});
