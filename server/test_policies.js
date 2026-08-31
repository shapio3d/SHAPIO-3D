const { Client } = require('pg');

const client = new Client({ connectionString: 'postgresql://postgres.bwyhjafzuhprvnviemwa:Shapio%402026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' });

async function run() {
  await client.connect();
  try {
    // Check columns
    const cols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Product';`);
    console.log('Columns in Product:', cols.rows.map(r => r.column_name));

    // Apply Grants & RLS
    console.log('Applying RLS for anon on Product...');
    await client.query(`GRANT USAGE ON SCHEMA public TO anon;`);
    await client.query(`GRANT SELECT ON "Product" TO anon;`);
    await client.query(`ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;`);
    await client.query(`DROP POLICY IF EXISTS "Public can view products" ON "Product";`);
    await client.query(`CREATE POLICY "Public can view products" ON "Product" FOR SELECT TO anon USING (true);`);
    console.log('RLS applied successfully.');
  } catch(e) {
    console.log('Error:', e.message);
  }
  await client.end();
}
run();
