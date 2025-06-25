// Script para imprimir una fila de venta de utilería
function imprimirVenta(id) {
  const fila = document.querySelector(`button[onclick*="imprimirVenta('${id}')"]`).closest('tr');
  if (!fila) return;
  // Clonar la fila y crear una tabla temporal para imprimir solo esa venta
  const tabla = document.createElement('table');
  tabla.style.width = '100%';
  tabla.style.borderCollapse = 'collapse';
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>${[...fila.parentNode.parentNode.querySelectorAll('th')].map(th => `<th>${th.textContent}</th>`).join('')}</tr>`;
  const tbody = document.createElement('tbody');
  const filaClon = fila.cloneNode(true);
  // Quitar el botón de imprimir de la copia
  const btn = filaClon.querySelector('button');
  if (btn) btn.remove();
  tbody.appendChild(filaClon);
  tabla.appendChild(thead);
  tabla.appendChild(tbody);
  // Crear ventana de impresión
  const win = window.open('', '', 'width=800,height=600');
  win.document.write('<html><head><title>Comprobante de venta de utilería</title>');
  win.document.write('<style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #888;padding:8px;text-align:left;}h2{text-align:center;}</style>');
  win.document.write('</head><body>');
  win.document.write('<h2>Comprobante de venta de utilería</h2>');
  win.document.write(tabla.outerHTML);
  win.document.write('</body></html>');
  win.document.close();
  win.print();
}
