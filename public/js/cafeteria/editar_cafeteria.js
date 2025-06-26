document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const nombreInput = document.getElementById('nombre');
  const descripcionInput = document.getElementById('descripcion');
  const precioInput = document.getElementById('precio');
  const stockInput = document.getElementById('stock');
  const stockMinimoInput = document.getElementById('stockMinimo');
  const categoriaSelect = document.getElementById('categoria');

  // Validación en tiempo real (misma que nuevo_cafeteria.js)
  nombreInput.addEventListener('input', (e) => {
    const valor = e.target.value.trim();
    if (valor.length < 2) {
      e.target.setCustomValidity('El nombre debe tener al menos 2 caracteres');
    } else if (valor.length > 100) {
      e.target.setCustomValidity('El nombre no puede exceder 100 caracteres');
    } else {
      e.target.setCustomValidity('');
    }
  });

  descripcionInput.addEventListener('input', (e) => {
    const valor = e.target.value.trim();
    if (valor.length < 5) {
      e.target.setCustomValidity('La descripción debe tener al menos 5 caracteres');
    } else if (valor.length > 500) {
      e.target.setCustomValidity('La descripción no puede exceder 500 caracteres');
    } else {
      e.target.setCustomValidity('');
    }
  });

  precioInput.addEventListener('input', (e) => {
    const valor = parseFloat(e.target.value);
    if (isNaN(valor) || valor <= 0) {
      e.target.setCustomValidity('El precio debe ser mayor a 0');
    } else if (valor > 999999) {
      e.target.setCustomValidity('El precio no puede exceder $999,999');
    } else {
      e.target.setCustomValidity('');
    }
  });

  stockInput.addEventListener('input', (e) => {
    const valor = parseInt(e.target.value);
    if (isNaN(valor) || valor < 0) {
      e.target.setCustomValidity('El stock no puede ser negativo');
    } else if (valor > 9999) {
      e.target.setCustomValidity('El stock no puede exceder 9,999 unidades');
    } else {
      e.target.setCustomValidity('');
    }
  });

  stockMinimoInput.addEventListener('input', (e) => {
    const valor = parseInt(e.target.value);
    if (isNaN(valor) || valor < 1) {
      e.target.setCustomValidity('El stock mínimo debe ser al menos 1');
    } else if (valor > 999) {
      e.target.setCustomValidity('El stock mínimo no puede exceder 999 unidades');
    } else {
      e.target.setCustomValidity('');
    }
  });

  // Validación del formulario
  form.addEventListener('submit', (e) => {
    // Validar que todos los campos requeridos estén completos
    if (!nombreInput.value.trim() || !descripcionInput.value.trim() || 
        !precioInput.value || !categoriaSelect.value) {
      e.preventDefault();
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    // Validar precio
    const precio = parseFloat(precioInput.value);
    if (isNaN(precio) || precio <= 0) {
      e.preventDefault();
      alert('Por favor, ingresa un precio válido mayor a 0.');
      precioInput.focus();
      return;
    }

    // Validar stock
    const stock = parseInt(stockInput.value || 0);
    if (stock < 0) {
      e.preventDefault();
      alert('El stock no puede ser negativo.');
      stockInput.focus();
      return;
    }

    // Validar stock mínimo
    const stockMinimo = parseInt(stockMinimoInput.value || 5);
    if (stockMinimo < 1) {
      e.preventDefault();
      alert('El stock mínimo debe ser al menos 1.');
      stockMinimoInput.focus();
      return;
    }

    // Si llegamos aquí, el formulario es válido
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Actualizando...';
  });

  // Focus en el primer campo
  nombreInput.focus();
  nombreInput.select();
});
