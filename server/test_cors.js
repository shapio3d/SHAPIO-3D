const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/invoices/f3a3eb56-6eea-41cd-89ea-265add40f804/pdf',
  method: 'GET',
  headers: {
    'Origin': 'http://localhost:5174',
    // We don't have a valid token, so we'll get a 401, BUT we should still see the CORS headers.
    // Wait, to get a 200, we need to bypass auth or get a token.
    // Let's just bypass auth for a moment in the server to test this, or we can just look at the 401 CORS headers.
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', res.headers);
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});
req.end();
