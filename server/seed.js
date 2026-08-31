const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  const { data, error } = await supabaseAdmin.from('Client').upsert({
    id: 'cuid-123',
    name: 'Shapio Client',
    billAddress: '123 Test St',
    defaultShipAddress: '123 Test St',
    email: 'client@shapio.com'
  });
  
  if (error) {
    console.error('Failed to insert mock client:', error);
  } else {
    console.log('Mock client cuid-123 inserted successfully!');
  }
}

seed();
