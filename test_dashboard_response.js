const http = require('http');

// Make a request to the dashboard endpoint to see what data it's returning
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/inicio',
  method: 'GET',
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Look for the ventas recientes section
    const ventasSection = data.match(/Ventas Recientes([\s\S]*?)Total del día/);
    if (ventasSection) {
      console.log('Ventas Recientes section found:');
      console.log(ventasSection[1]);
    } else {
      console.log('Ventas Recientes section not found');
      // Look for any reference to ventas-recientes
      const ventasMatch = data.match(/ventas-recientes[\s\S]{0,500}/);
      if (ventasMatch) {
        console.log('Found ventas-recientes reference:');
        console.log(ventasMatch[0]);
      }
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
