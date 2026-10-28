const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const BASE_URL = 'http://localhost:5000/api';

async function runRegressionSuite() {
  console.log('============================================');
  console.log('🧪 RUNNING COMPREHENSIVE REGRESSION TEST SUITE');
  console.log('============================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate and obtain valid access token
    console.log('🔑 Step 1: Authenticating admin session...');
    const linkRes = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: 'info.shapio3d@gmail.com'
    });
    const otpRes = await s.auth.verifyOtp({
      token_hash: linkRes.data.properties.hashed_token,
      type: 'magiclink'
    });
    const token = otpRes.data.session.access_token;
    assert(!!token, 'Obtained Supabase Admin access token');

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Test GET /api/dashboard
    console.log('\n📊 Step 2: Testing GET /api/dashboard regression...');
    const dashRes = await fetch(`${BASE_URL}/dashboard`, { headers: authHeaders });
    assert(dashRes.status === 200, `Dashboard status is 200 (received ${dashRes.status})`);
    const dashData = await dashRes.json();
    assert(dashData.stats !== undefined, 'Dashboard has stats object');
    assert(typeof dashData.stats.totalPaidAmount === 'number', 'stats.totalPaidAmount is a valid number');
    assert(typeof dashData.stats.totalPendingAmount === 'number', 'stats.totalPendingAmount is a valid number');
    assert(typeof dashData.stats.totalRevenue === 'number', 'stats.totalRevenue is preserved');
    assert(Array.isArray(dashData.stats.monthlyRevenue), 'monthlyRevenue is an array for charts');
    assert(Array.isArray(dashData.stats.invoicesByStatus), 'invoicesByStatus is an array for pie chart');
    assert(Array.isArray(dashData.recentInvoices), 'recentInvoices is an array');
    assert(Array.isArray(dashData.recentCustomers), 'recentCustomers is an array');
    assert(Array.isArray(dashData.customerFinancials), 'customerFinancials is an array');

    // 3. Test GET /api/customers backward compatibility
    console.log('\n👥 Step 3: Testing GET /api/customers compatibility & financials...');
    const custRes = await fetch(`${BASE_URL}/customers`, { headers: authHeaders });
    assert(custRes.status === 200, `Customers status is 200 (received ${custRes.status})`);
    const customers = await custRes.json();
    assert(Array.isArray(customers) && customers.length > 0, `Customers list returned (${customers.length} items)`);
    const sampleCust = customers[0];
    assert('billAddress' in sampleCust, 'Preserved legacy compatibility field "billAddress"');
    assert('panNo' in sampleCust, 'Preserved legacy compatibility field "panNo"');
    assert('totalAmount' in sampleCust, 'Customer has "totalAmount"');
    assert('paidAmount' in sampleCust, 'Customer has "paidAmount"');
    assert('pendingAmount' in sampleCust, 'Customer has "pendingAmount"');
    assert('invoices' in sampleCust && Array.isArray(sampleCust.invoices), 'Customer has invoices array');

    // 4. Test Customer CRUD lifecycle (Create, Update, Delete)
    console.log('\n👥 Step 4: Testing Customer CRUD lifecycle...');
    const newCustPayload = {
      name: 'Regression Test Corp',
      email: 'test_regression@example.com',
      phone: '9876543210',
      company: 'Regression Enterprises',
      billAddress: '42 Testing Blvd, Tech City',
      panNumber: 'ABCDE1234F',
      gstNumber: '33ABCDE1234F1Z5',
      notes: 'Automated regression test'
    };
    const createCustRes = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newCustPayload)
    });
    assert(createCustRes.status === 201, `Customer created with 201 status (received ${createCustRes.status})`);
    const createdCust = await createCustRes.json();
    const testCustId = createdCust.id;
    assert(createdCust.name === 'Regression Test Corp', 'Created customer name matches');
    assert(createdCust.billAddress === '42 Testing Blvd, Tech City', 'billAddress mapped correctly on creation');

    // Test PUT customer
    const updateCustRes = await fetch(`${BASE_URL}/customers/${testCustId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        ...newCustPayload,
        company: 'Updated Regression Corp'
      })
    });
    assert(updateCustRes.status === 200, `Customer updated with 200 status (received ${updateCustRes.status})`);
    const updatedCust = await updateCustRes.json();
    assert(updatedCust.company === 'Updated Regression Corp', 'Updated company name matches');

    // 5. Test Invoice Lifecycle & Financial Impact on Customer
    console.log('\n📄 Step 5: Testing Invoice Lifecycle & Automatic Balance Recalculation...');
    const testInvoicePayload = {
      clientId: testCustId,
      invoiceNumber: `REG-TEST-${Date.now()}`,
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 15).toISOString(),
      terms: 'Net 15',
      status: 'UNPAID',
      items: [
        {
          description: 'Custom 3D Prototyping Service',
          quantity: 2,
          rate: 5000,
          cgstRatePct: 9,
          sgstRatePct: 9,
          hsnSac: '9983'
        }
      ]
    };
    // Expected math: 2 * 5000 = 10000 subtotal, 9% cgst = 900, 9% sgst = 900, total = 11800
    const createInvRes = await fetch(`${BASE_URL}/invoices`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testInvoicePayload)
    });
    assert(createInvRes.status === 201, `Invoice created with 201 status (received ${createInvRes.status})`);
    const createdInvData = await createInvRes.json();
    const testInvId = createdInvData.invoice.id;
    assert(Number(createdInvData.invoice.totalAmount) === 11800, `Invoice calculated total is exactly 11800 (received ${createdInvData.invoice.totalAmount})`);

    // Verify GET /api/customers recalculates for this customer
    const verifyCustRes = await fetch(`${BASE_URL}/customers`, { headers: authHeaders });
    const verifyCusts = await verifyCustRes.json();
    const foundCust = verifyCusts.find(c => c.id === testCustId);
    assert(foundCust !== undefined, 'Customer found in customers list');
    assert(foundCust.pendingAmount === 11800, `Customer pendingAmount is exactly 11800 (received ${foundCust.pendingAmount})`);
    assert(foundCust.paidAmount === 0, `Customer paidAmount is 0 (received ${foundCust.paidAmount})`);
    assert(foundCust.totalAmount === 11800, `Customer totalAmount is 11800 (received ${foundCust.totalAmount})`);
    assert(foundCust.invoicesCount === 1, 'Customer has invoicesCount 1');

    // 6. Test PATCH /api/invoices/:id/status (Mark invoice as PAID)
    console.log('\n💳 Step 6: Testing Invoice Status change to PAID & customer balance shift...');
    const patchStatusRes = await fetch(`${BASE_URL}/invoices/${testInvId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'PAID' })
    });
    assert(patchStatusRes.status === 200, `Invoice status updated to PAID (status ${patchStatusRes.status})`);

    // Re-verify customer balance shifted from pending to paid
    const reVerifyCustRes = await fetch(`${BASE_URL}/customers`, { headers: authHeaders });
    const reVerifyCusts = await reVerifyCustRes.json();
    const updatedFoundCust = reVerifyCusts.find(c => c.id === testCustId);
    assert(updatedFoundCust.pendingAmount === 0, `Customer pendingAmount dropped to 0 after payment (received ${updatedFoundCust.pendingAmount})`);
    assert(updatedFoundCust.paidAmount === 11800, `Customer paidAmount increased to 11800 (received ${updatedFoundCust.paidAmount})`);
    assert(updatedFoundCust.totalAmount === 11800, `Customer totalAmount remains consistent at 11800 (received ${updatedFoundCust.totalAmount})`);

    // 7. Test GET /api/invoices list
    console.log('\n📑 Step 7: Testing GET /api/invoices list...');
    const invListRes = await fetch(`${BASE_URL}/invoices`, { headers: authHeaders });
    assert(invListRes.status === 200, 'Invoices list returned 200');
    const invoices = await invListRes.json();
    assert(Array.isArray(invoices) && invoices.length > 0, `Found ${invoices.length} invoices`);
    const sampleInv = invoices.find(i => i.id === testInvId);
    assert(sampleInv !== undefined, 'Created invoice exists in invoice list');
    assert(sampleInv.client && sampleInv.client.name === 'Regression Test Corp', 'Invoice has client nested object with customer name');

    // 8. Clean up test invoice & test customer
    console.log('\n🧹 Step 8: Cleaning up test invoice and customer...');
    const delInvRes = await fetch(`${BASE_URL}/invoices/${testInvId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert(delInvRes.status === 200, 'Test invoice deleted successfully');

    const delCustRes = await fetch(`${BASE_URL}/customers/${testCustId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert(delCustRes.status === 200, 'Test customer deleted successfully');

    // 9. Test other endpoints: Quotations, Products, Contact
    console.log('\n🔍 Step 9: Testing other core modules (Quotations, Products, Contact)...');
    const quoteRes = await fetch(`${BASE_URL}/quotations`, { headers: authHeaders });
    assert(quoteRes.status === 200, `Quotations endpoint status 200 (received ${quoteRes.status})`);

    const prodRes = await fetch(`${BASE_URL}/products`, { headers: authHeaders });
    assert(prodRes.status === 200, `Products endpoint status 200 (received ${prodRes.status})`);

    const contactRes = await fetch(`${BASE_URL}/contact/admin`, { headers: authHeaders });
    assert(contactRes.status === 200, `Contact submissions endpoint status 200 (received ${contactRes.status})`);

    // 10. Summary
    console.log('\n============================================');
    console.log(`🎉 REGRESSION TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('============================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('💥 Regression test runner error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runRegressionSuite();
