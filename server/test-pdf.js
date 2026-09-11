const { generateInvoicePdfStream } = require('./lib/pdfTemplate');

const test = async () => {
  const invoiceObj = {
    invoiceNumber: 'PREVIEW',
    issueDate: new Date(),
    dueDate: null,
    terms: 'Due on Receipt',
    placeOfSupply: 'Tamil Nadu (33)',
    shipAddress: 'Test Addr',
    subtotal: 100,
    cgstAmount: 9,
    sgstAmount: 9,
    total: 118,
    balanceDue: 118,
    client: { name: 'Test' },
    items: [
      {
        description: 'Test Item',
        hsnSac: '1234',
        quantity: 1,
        rate: 100,
        amount: 100,
        cgstRatePct: 9,
        sgstRatePct: 9,
        cgstAmount: 9,
        sgstAmount: 9
      }
    ]
  };

  try {
    const stream = await generateInvoicePdfStream(invoiceObj, {});
    console.log("Stream generated successfully");
  } catch (err) {
    console.error("Failed:", err);
  }
};

test();
