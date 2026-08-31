const fs = require('fs');
const ReactPDF = require('@react-pdf/renderer');
const { generateInvoicePdfStream } = require('./lib/pdfTemplate');

const mockInvoice = {
  invoiceNumber: 'TEST-123',
  issueDate: new Date().toISOString(),
  dueDate: new Date().toISOString(),
  terms: 'Net 30',
  placeOfSupply: 'State',
  shipAddress: 'Address',
  subtotal: 100,
  cgstAmount: 9,
  sgstAmount: 9,
  totalAmount: 118,
  client: { name: 'Test Client' },
  items: []
};

async function generate() {
  try {
    console.log("Generating PDF...");
    const stream = await generateInvoicePdfStream(mockInvoice);
    stream.pipe(fs.createWriteStream('out.pdf'));
    stream.on('finish', () => console.log('Done!'));
    stream.on('error', (err) => console.error('Stream error:', err));
  } catch (err) {
    console.error('Render error:', err);
  }
}

generate();
