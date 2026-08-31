const axios = require('axios');
const { Client } = require('pg');

const client = new Client({ connectionString: 'postgresql://postgres.bwyhjafzuhprvnviemwa:Shapio%402026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' });

async function run() {
  await client.connect();
  const res = await client.query('SELECT id FROM "Customer" LIMIT 1;');
  const customerId = res.rows[0].id;
  await client.end();

  console.log('Found valid customerId:', customerId);
  
  const payload = {
    clientId: customerId,
    invoiceNumber: "SHP3D/26-27/010",
    issueDate: "2026-08-25",
    items: [
      { description: "Test Math Override", quantity: 2, rate: 500, cgstRatePct: 9, sgstRatePct: 9 }
    ],
    subtotal: 99999,      // Malicious or incorrect subtotal
    totalAmount: 999999   // Malicious or incorrect total
  };

  try {
    const response = await axios.post('http://localhost:5000/api/invoices', payload);
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch(e) {
    console.log('Error:', e.response ? e.response.data : e.message);
  }
}
run();
