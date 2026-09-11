const http = require('http');

const data = JSON.stringify({
  invoiceNumber: 'PREVIEW-123',
  clientId: 'MANUAL',
  manualClient: { name: 'Test Client' },
  items: [
    { description: '3D Print', quantity: 1, rate: 100, cgstRatePct: 9, sgstRatePct: 9 }
  ]
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/invoices/preview',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk.toString().substring(0, 50)}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
