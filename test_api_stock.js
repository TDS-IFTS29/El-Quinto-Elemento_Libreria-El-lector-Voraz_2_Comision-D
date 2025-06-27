const axios = require('axios');

async function testStockAPIs() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('\n=== PRUEBA DE APIs DE SUMAR STOCK ===\n');
    
    // Primero intentar obtener datos para verificar conectividad
    console.log('1. Verificando conectividad del servidor...');
    try {
      const response = await axios.get(`${baseURL}/api/libros`);
      console.log(`   ✓ Servidor respondiendo. Libros encontrados: ${response.data.length}`);
    } catch (error) {
      console.log(`   ✗ Error de conectividad: ${error.message}`);
      return;
    }

    // Test APIs de sumar stock
    console.log('\n2. Probando APIs de sumar stock...\n');
    
    // Test 1: API de libros
    console.log('   a) API de libros (/api/libros/:id/sumar-stock)');
    try {
      const librosResponse = await axios.get(`${baseURL}/api/libros`);
      if (librosResponse.data.length > 0) {
        const libro = librosResponse.data[0];
        console.log(`      Libro: "${libro.nombre}", Stock actual: ${libro.stock}`);
        
        const stockResponse = await axios.patch(`${baseURL}/api/libros/${libro._id}/sumar-stock`);
        console.log(`      ✓ API respondió: Stock actualizado a ${stockResponse.data.stock}`);
      } else {
        console.log('      ✗ No hay libros para probar');
      }
    } catch (error) {
      console.log(`      ✗ Error en API de libros: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    // Test 2: API de cafetería
    console.log('\n   b) API de cafetería (/api/cafeteria/:id/sumar-stock)');
    try {
      const cafeteriaResponse = await axios.get(`${baseURL}/api/cafeteria`);
      if (cafeteriaResponse.data.length > 0) {
        const item = cafeteriaResponse.data[0];
        console.log(`      Item: "${item.nombre}", Stock actual: ${item.stock}`);
        
        const stockResponse = await axios.patch(`${baseURL}/api/cafeteria/${item._id}/sumar-stock`);
        console.log(`      ✓ API respondió: Stock actualizado a ${stockResponse.data.stock}`);
      } else {
        console.log('      ✗ No hay items de cafetería para probar');
      }
    } catch (error) {
      console.log(`      ✗ Error en API de cafetería: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    // Test 3: API de utilería
    console.log('\n   c) API de utilería (/api/utileria/:id/sumar-stock)');
    try {
      const utileriaResponse = await axios.get(`${baseURL}/api/utileria`);
      if (utileriaResponse.data.length > 0) {
        const item = utileriaResponse.data[0];
        console.log(`      Item: "${item.nombre}", Stock actual: ${item.stock}`);
        
        const stockResponse = await axios.patch(`${baseURL}/api/utileria/${item._id}/sumar-stock`);
        console.log(`      ✓ API respondió: Stock actualizado a ${stockResponse.data.stock}`);
      } else {
        console.log('      ✗ No hay items de utilería para probar');
      }
    } catch (error) {
      console.log(`      ✗ Error en API de utilería: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    console.log('\n=== FIN DE PRUEBAS ===\n');

  } catch (error) {
    console.error('Error general:', error.message);
  }
}

testStockAPIs();
