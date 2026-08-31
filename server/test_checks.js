const { Client } = require('pg');
const axios = require('axios');

const client = new Client({ connectionString: 'postgresql://postgres.bwyhjafzuhprvnviemwa:Shapio%402026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' });

async function run() {
  await client.connect();
  try {
    const res = await client.query(`SELECT conname FROM pg_constraint WHERE conrelid = 'invoices'::regclass AND contype = 'u';`);
    console.log('Unique constraints on invoices table:', res.rows);
    if (!res.rows.find(r => r.conname === 'invoices_invoice_number_key')) {
        console.log('Adding UNIQUE constraint to invoice_number...');
        await client.query(`ALTER TABLE invoices ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);`);
        console.log('Added UNIQUE constraint.');
    }
  } catch(e) {
    console.log('Error checking constraints:', e.message);
  }
  
  try {
    console.log('\n--- RLS Standalone Test ---');
    const rls = await axios.get('https://bwyhjafzuhprvnviemwa.supabase.co/rest/v1/invoices', {
      headers: {
        'apikey': 'sb_publishable_89fwf-HAYyT2dGKviMUjYg_8YbyCF6s',
        'Authorization': 'Bearer sb_publishable_89fwf-HAYyT2dGKviMUjYg_8YbyCF6s'
      }
    });
    console.log('RLS test (should be empty array or 401 if RLS is on):', rls.data);
  } catch(e) {
    console.log('RLS test Error:', e.response ? e.response.status : e.message);
  }
  
  try {
    console.log('\n--- JWT Missing Test ---');
    const noJwt = await axios.get('http://localhost:5000/api/invoices', {
        validateStatus: () => true
    });
    console.log('JWT missing test status:', noJwt.status);
    console.log('JWT missing test response:', noJwt.data);
  } catch (e) {
    console.log('JWT missing error:', e.message);
  }

  await client.end();
}
run();
