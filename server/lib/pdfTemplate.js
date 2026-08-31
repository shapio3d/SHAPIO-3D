const React = require('react');
const { Document, Page, Text, View, StyleSheet, Image, renderToStream, Font } = require('@react-pdf/renderer');
const path = require('path');
const fs = require('fs');
const { toWords } = require('number-to-words');

const getBusinessConfig = () => {
  const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
  if (fs.existsSync(settingsPath)) {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  }
  return {
    companyName: "Shapio 3D Technologies",
    companyAddress: "No. 216, Indira Nagar, Ammanapakkam,\nChengalpattu – 603003, Tamil Nadu, India",
    gstin: "33QLBPS8301A1ZC",
    pan: "QLBPS8301A",
    email: "shapio3dtech@gmail.com",
    accountName: "SHAPIO 3D TECHNOLOGIES",
    accountNumber: "0457073000000458",
    ifsc: "SIBL0000457",
    branch: "SOUTH INDIAN BANK, CHENGALPATTU BRANCH - KANCHIPURAM"
  };
};

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf', fontWeight: 700, fontStyle: 'italic' },
  ]
});

const e = React.createElement;

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Roboto', fontSize: 9, color: '#000' },
  pageBorder: { border: '1 solid #000', flex: 1, padding: 0 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottom: '1 solid #000' },
  headerLeft: { flexDirection: 'row', width: '60%' },
  logoBox: { width: 280, height: 110, marginRight: 15, justifyContent: 'center', alignItems: 'flex-start' },
  logo: { width: '100%', height: '100%', objectFit: 'contain' },
  companyDetails: { justifyContent: 'center' },
  companyName: { fontSize: 14, fontWeight: 'bold' },
  companyText: { fontSize: 8, marginTop: 2 },
  
  headerRight: { width: '40%', alignItems: 'flex-end', justifyContent: 'flex-end' },
  taxInvoiceTitle: { fontSize: 18, fontWeight: 'bold' },

  metaGrid: { flexDirection: 'row', borderBottom: '1 solid #000' },
  metaLeft: { width: '50%', padding: 5, borderRight: '1 solid #000' },
  metaRight: { width: '50%', padding: 5 },
  metaRow: { flexDirection: 'row', marginBottom: 2 },
  metaLabel: { width: 70, fontSize: 8 },
  metaColon: { width: 10, fontSize: 8 },
  metaValue: { flex: 1, fontSize: 8, fontWeight: 'bold' },

  addressGrid: { flexDirection: 'row', borderBottom: '1 solid #000' },
  addressBoxLeft: { width: '50%', padding: 5, borderRight: '1 solid #000' },
  addressBoxRight: { width: '50%', padding: 5 },
  addressTitle: { fontSize: 8, fontWeight: 'bold', backgroundColor: '#334F39', color: '#FFF', padding: 4, marginBottom: 4 },
  addressName: { fontSize: 8, fontWeight: 'bold', marginBottom: 2 },
  addressText: { fontSize: 8, marginBottom: 1 },

  tableHeader: { flexDirection: 'row', borderBottom: '1 solid #000', backgroundColor: '#334F39', color: '#FFF' },
  thCell: { padding: 4, fontSize: 8, fontWeight: 'bold', borderRight: '1 solid #000', textAlign: 'center' },
  
  tableRow: { flexDirection: 'row', borderBottom: '1 solid #000' },
  tdCell: { padding: 4, fontSize: 8, borderRight: '1 solid #000' },
  
  colNo: { width: '4%' },
  colDesc: { width: '28%', textAlign: 'left' },
  colHsn: { width: '10%', textAlign: 'center' },
  colQty: { width: '8%', textAlign: 'center' },
  colRate: { width: '10%', textAlign: 'right' },
  colTax: { width: '14%', textAlign: 'center' },
  colAmount: { width: '12%', textAlign: 'right', borderRight: 'none' },

  taxHeaderSplit: { flexDirection: 'row', borderTop: '1 solid #000', marginTop: 2, paddingTop: 2 },
  taxSubCol: { width: '50%', fontSize: 7, textAlign: 'center' },
  
  taxDataSplit: { flexDirection: 'row' },
  taxDataSubCol: { width: '50%', fontSize: 8, textAlign: 'center' },

  bottomSection: { flexDirection: 'row' },
  bottomLeft: { width: '60%', borderRight: '1 solid #000' },
  bottomRight: { width: '40%' },

  wordsBox: { padding: 5, borderBottom: '1 solid #000' },
  paymentBox: { padding: 5 },
  paymentTitle: { fontSize: 8, marginBottom: 4 },
  
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 4 },
  totalsLabel: { fontSize: 8 },
  totalsValue: { fontSize: 8, fontWeight: 'bold' },
  finalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 4, borderTop: '1 solid #000', borderBottom: '1 solid #000' },
  finalTotalLabel: { fontSize: 9, fontWeight: 'bold' },
  finalTotalValue: { fontSize: 9, fontWeight: 'bold' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 4, borderBottom: '1 solid #000' },

  hsnSummary: { marginTop: 10, borderTop: '1 solid #000' },
  hsnSummaryTitle: { fontSize: 8, padding: 4, fontWeight: 'bold', backgroundColor: '#334F39', color: '#FFF' },
  
  footerText: { fontSize: 6, textAlign: 'center', marginTop: 20, marginBottom: 5 }
});

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
};

const formatCurrency = (amount) => Number(amount).toFixed(2);

const titleCase = (str) => {
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const generateTotalInWords = (amount) => {
  try {
    const whole = Math.floor(amount);
    const words = titleCase(toWords(whole));
    return `Indian Rupee ${words} Only`;
  } catch (e) {
    return '';
  }
};

const InvoiceTemplate = ({ invoice, settings }) => {
  const defaults = getBusinessConfig();
  const rawConfig = { ...defaults, ...settings };
  
  const BUSINESS_CONFIG = {
    companyName: rawConfig.companyName || defaults.companyName,
    companyAddress: rawConfig.companyAddress || rawConfig.address || defaults.companyAddress,
    gstin: rawConfig.gstin || rawConfig.gst || defaults.gstin,
    pan: rawConfig.pan || defaults.pan,
    email: rawConfig.email || defaults.email,
    accountName: rawConfig.accountName || rawConfig.bankHolder || defaults.accountName,
    accountNumber: rawConfig.accountNumber || rawConfig.accountNo || defaults.accountNumber,
    ifsc: rawConfig.ifsc || defaults.ifsc,
    branch: rawConfig.branch || defaults.branch
  };

  const logoPath = path.join(__dirname, '..', 'assets', 'shapio-logo.png');
  const hasLogo = fs.existsSync(logoPath);
  let logoDataUri = null;
  if (hasLogo) {
    const base64 = fs.readFileSync(logoPath).toString('base64');
    logoDataUri = `data:image/png;base64,${base64}`;
  }
  
  const client = invoice.client || {};
  const items = invoice.items || [];

  const hsnSummary = {};
  items.forEach(item => {
    const hsn = item.hsnSac || 'N/A';
    if (!hsnSummary[hsn]) {
      hsnSummary[hsn] = { taxable: 0, cgst: 0, sgst: 0 };
    }
    hsnSummary[hsn].taxable += Number(item.amount);
    hsnSummary[hsn].cgst += Number(item.cgstAmount);
    hsnSummary[hsn].sgst += Number(item.sgstAmount);
  });

  return e(Document, null,
    e(Page, { size: 'A4', style: styles.page },
      e(View, { style: styles.pageBorder },
        
        e(View, { style: styles.headerRow },
          e(View, { style: styles.headerLeft },
            e(View, { style: styles.logoBox },
              hasLogo ? e(Image, { src: logoDataUri, style: styles.logo }) : null
            ),
            e(View, { style: styles.companyDetails },
              e(Text, { style: styles.companyName }, BUSINESS_CONFIG.companyName),
              e(Text, { style: styles.companyText }, BUSINESS_CONFIG.companyAddress),
              e(Text, { style: styles.companyText }, `GSTIN: ${BUSINESS_CONFIG.gstin}`),
              e(Text, { style: styles.companyText }, BUSINESS_CONFIG.email),
              e(Text, { style: styles.companyText }, `PAN No: ${BUSINESS_CONFIG.pan}`)
            )
          ),
          e(View, { style: styles.headerRight },
            e(Text, { style: styles.taxInvoiceTitle }, 'Tax Invoice')
          )
        ),
        
        e(View, { style: styles.metaGrid },
          e(View, { style: styles.metaLeft },
            e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, '#'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, invoice.invoiceNumber)),
            e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Invoice Date'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, formatDate(invoice.issueDate))),
            e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Terms'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, invoice.terms || 'Due on Receipt')),
            e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Due Date'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, formatDate(invoice.dueDate)))
          ),
          e(View, { style: styles.metaRight },
            e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Place Of Supply'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, invoice.placeOfSupply || 'Tamil Nadu (33)')),
            e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'PAN No'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, client.panNumber || BUSINESS_CONFIG.pan))
          )
        ),
        
        e(View, { style: styles.addressGrid },
          e(View, { style: styles.addressBoxLeft },
            e(Text, { style: styles.addressTitle }, 'Bill To'),
            e(Text, { style: styles.addressName }, client.name),
            e(Text, { style: styles.addressText }, client.billAddress),
            client.phone ? e(Text, { style: [styles.addressText, { marginTop: 4 }] }, `Ph No: ${client.phone}`) : null,
            client.gstNumber ? e(Text, { style: styles.addressText }, `GSTIN: ${client.gstNumber}`) : null
          ),
          e(View, { style: styles.addressBoxRight },
            e(Text, { style: styles.addressTitle }, 'Ship To'),
            e(Text, { style: styles.addressName }, client.name),
            e(Text, { style: styles.addressText }, invoice.shipAddress || client.billAddress),
            client.phone ? e(Text, { style: [styles.addressText, { marginTop: 4 }] }, `Ph No: ${client.phone}`) : null
          )
        ),
        
        e(View, { style: styles.tableHeader },
          e(Text, { style: [styles.thCell, styles.colNo] }, '#'),
          e(Text, { style: [styles.thCell, styles.colDesc] }, 'Item & Description'),
          e(View, { style: [styles.thCell, styles.colHsn] }, e(Text, null, 'HSN'), e(Text, null, '/SAC')),
          e(Text, { style: [styles.thCell, styles.colQty] }, 'Qty'),
          e(Text, { style: [styles.thCell, styles.colRate] }, 'Rate'),
          e(View, { style: [styles.thCell, styles.colTax, { padding: 0 }] },
            e(Text, { style: { padding: 2 } }, 'CGST'),
            e(View, { style: styles.taxHeaderSplit },
              e(Text, { style: [styles.taxSubCol, { borderRight: '1 solid #000' }] }, '%'),
              e(Text, { style: styles.taxSubCol }, 'Amt')
            )
          ),
          e(View, { style: [styles.thCell, styles.colTax, { padding: 0 }] },
            e(Text, { style: { padding: 2 } }, 'SGST'),
            e(View, { style: styles.taxHeaderSplit },
              e(Text, { style: [styles.taxSubCol, { borderRight: '1 solid #000' }] }, '%'),
              e(Text, { style: styles.taxSubCol }, 'Amt')
            )
          ),
          e(Text, { style: [styles.thCell, styles.colAmount] }, 'Amount')
        ),
        
        items.map((item, i) => 
          e(View, { style: styles.tableRow, key: i },
            e(Text, { style: [styles.tdCell, styles.colNo, { textAlign: 'center' }] }, i + 1),
            e(Text, { style: [styles.tdCell, styles.colDesc] }, item.description),
            e(Text, { style: [styles.tdCell, styles.colHsn] }, item.hsnSac || '-'),
            e(Text, { style: [styles.tdCell, styles.colQty] }, formatCurrency(item.quantity)),
            e(Text, { style: [styles.tdCell, styles.colRate] }, formatCurrency(item.rate)),
            e(View, { style: [styles.tdCell, styles.colTax, { padding: 0 }] },
              e(View, { style: [styles.taxDataSplit, { flex: 1, alignItems: 'center' }] },
                e(Text, { style: [styles.taxDataSubCol, { borderRight: '1 solid #000', height: '100%', padding: 4 }] }, `${item.cgstRatePct}%`),
                e(Text, { style: [styles.taxDataSubCol, { padding: 4 }] }, formatCurrency(item.cgstAmount))
              )
            ),
            e(View, { style: [styles.tdCell, styles.colTax, { padding: 0 }] },
              e(View, { style: [styles.taxDataSplit, { flex: 1, alignItems: 'center' }] },
                e(Text, { style: [styles.taxDataSubCol, { borderRight: '1 solid #000', height: '100%', padding: 4 }] }, `${item.sgstRatePct}%`),
                e(Text, { style: [styles.taxDataSubCol, { padding: 4 }] }, formatCurrency(item.sgstAmount))
              )
            ),
            e(Text, { style: [styles.tdCell, styles.colAmount] }, formatCurrency(item.amount))
          )
        ),
        
        e(View, { style: styles.bottomSection },
          e(View, { style: styles.bottomLeft },
            e(View, { style: styles.wordsBox },
              e(Text, { style: { fontSize: 8 } }, 'Total In Words'),
              e(Text, { style: { fontSize: 8, fontStyle: 'italic', fontWeight: 'bold', marginTop: 2 } }, generateTotalInWords(invoice.total))
            ),
            e(View, { style: styles.paymentBox },
              e(Text, { style: styles.paymentTitle }, 'Payment Options'),
              e(Text, { style: { fontSize: 8, marginBottom: 2 } }, `Account Holder Name : ${BUSINESS_CONFIG.accountName}`),
              e(Text, { style: { fontSize: 8, marginBottom: 2 } }, `Account number : ${BUSINESS_CONFIG.accountNumber}`),
              e(Text, { style: { fontSize: 8, marginBottom: 2 } }, `IFSC Code : ${BUSINESS_CONFIG.ifsc}`),
              e(Text, { style: { fontSize: 8 } }, `Branch : ${BUSINESS_CONFIG.branch}`)
            )
          ),
          e(View, { style: styles.bottomRight },
            e(View, { style: styles.totalsRow }, e(Text, { style: styles.totalsLabel }, 'Sub Total'), e(Text, { style: styles.totalsValue }, formatCurrency(invoice.subtotal))),
            e(View, { style: styles.totalsRow }, e(Text, { style: styles.totalsLabel }, 'CGST'), e(Text, { style: styles.totalsValue }, formatCurrency(invoice.cgstAmount))),
            e(View, { style: styles.totalsRow }, e(Text, { style: styles.totalsLabel }, 'SGST'), e(Text, { style: styles.totalsValue }, formatCurrency(invoice.sgstAmount))),
            e(View, { style: styles.finalTotalRow }, e(Text, { style: styles.finalTotalLabel }, 'Total'), e(Text, { style: styles.finalTotalValue }, `₹${formatCurrency(invoice.total)}`)),
            e(View, { style: styles.balanceRow }, e(Text, { style: styles.totalsLabel }, 'Balance Due'), e(Text, { style: styles.totalsValue }, `₹${formatCurrency(invoice.balanceDue)}`))
          )
        ),

        e(View, { style: styles.hsnSummary },
          e(Text, { style: styles.hsnSummaryTitle }, 'HSN/SAC Summary:'),
          e(View, { style: [styles.tableHeader, { backgroundColor: '#fff', color: '#000', borderTop: '1 solid #000' }] },
            e(Text, { style: [styles.thCell, { width: '20%', textAlign: 'left' }] }, 'HSN/SAC'),
            e(Text, { style: [styles.thCell, { width: '20%', textAlign: 'right' }] }, 'Taxable Amount'),
            e(View, { style: [styles.thCell, { width: '25%', padding: 0 }] },
              e(Text, { style: { padding: 2, borderBottom: '1 solid #000' } }, 'CGST'),
              e(View, { style: styles.taxHeaderSplit },
                e(Text, { style: [styles.taxSubCol, { borderRight: '1 solid #000' }] }, 'Rate'),
                e(Text, { style: styles.taxSubCol }, 'Amount')
              )
            ),
            e(View, { style: [styles.thCell, { width: '25%', padding: 0 }] },
              e(Text, { style: { padding: 2, borderBottom: '1 solid #000' } }, 'SGST'),
              e(View, { style: styles.taxHeaderSplit },
                e(Text, { style: [styles.taxSubCol, { borderRight: '1 solid #000' }] }, 'Rate'),
                e(Text, { style: styles.taxSubCol }, 'Amount')
              )
            ),
            e(View, { style: [styles.thCell, { width: '10%', padding: 0, borderRight: 'none' }] },
              e(Text, { style: { padding: 2 } }, 'Total Tax'),
              e(View, { style: styles.taxHeaderSplit },
                e(Text, { style: [styles.taxSubCol, { width: '100%' }] }, 'Amount')
              )
            )
          ),
          Object.entries(hsnSummary).map(([hsn, vals], i) => {
            const totalTax = vals.cgst + vals.sgst;
            return e(View, { style: styles.tableRow, key: i },
              e(Text, { style: [styles.tdCell, { width: '20%' }] }, hsn),
              e(Text, { style: [styles.tdCell, { width: '20%', textAlign: 'right' }] }, formatCurrency(vals.taxable)),
              e(View, { style: [styles.tdCell, { width: '25%', padding: 0 }] },
                e(View, { style: [styles.taxDataSplit, { flex: 1, alignItems: 'center' }] },
                  e(Text, { style: [styles.taxDataSubCol, { borderRight: '1 solid #000', height: '100%', padding: 4 }] }, '9%'),
                  e(Text, { style: [styles.taxDataSubCol, { padding: 4 }] }, formatCurrency(vals.cgst))
                )
              ),
              e(View, { style: [styles.tdCell, { width: '25%', padding: 0 }] },
                e(View, { style: [styles.taxDataSplit, { flex: 1, alignItems: 'center' }] },
                  e(Text, { style: [styles.taxDataSubCol, { borderRight: '1 solid #000', height: '100%', padding: 4 }] }, '9%'),
                  e(Text, { style: [styles.taxDataSubCol, { padding: 4 }] }, formatCurrency(vals.sgst))
                )
              ),
              e(Text, { style: [styles.tdCell, { width: '10%', textAlign: 'right', borderRight: 'none' }] }, formatCurrency(totalTax))
            );
          }),
          e(View, { style: styles.tableRow },
            e(Text, { style: [styles.tdCell, { width: '20%', fontWeight: 'bold' }] }, 'Total'),
            e(Text, { style: [styles.tdCell, { width: '20%', textAlign: 'right', fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.taxable, 0))),
            e(View, { style: [styles.tdCell, { width: '25%', padding: 0 }] },
              e(View, { style: [styles.taxDataSplit, { flex: 1, alignItems: 'center' }] },
                e(Text, { style: [styles.taxDataSubCol, { borderRight: '1 solid #000', height: '100%', padding: 4 }] }, ''),
                e(Text, { style: [styles.taxDataSubCol, { padding: 4, fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.cgst, 0)))
              )
            ),
            e(View, { style: [styles.tdCell, { width: '25%', padding: 0 }] },
              e(View, { style: [styles.taxDataSplit, { flex: 1, alignItems: 'center' }] },
                e(Text, { style: [styles.taxDataSubCol, { borderRight: '1 solid #000', height: '100%', padding: 4 }] }, ''),
                e(Text, { style: [styles.taxDataSubCol, { padding: 4, fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.sgst, 0)))
              )
            ),
            e(Text, { style: [styles.tdCell, { width: '10%', textAlign: 'right', borderRight: 'none', fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.cgst + b.sgst, 0)))
          )
        ),
        
        e(Text, { style: styles.footerText }, 'This is a Computer Generated Document')
      )
    )
  );
};

const generateInvoicePdfStream = async (invoice, settings = {}) => {
  return await renderToStream(e(InvoiceTemplate, { invoice, settings }));
};

const QuotationTemplate = ({ quotation, settings }) => {
  const defaults = getBusinessConfig();
  const rawConfig = { ...defaults, ...settings };
  
  const BUSINESS_CONFIG = {
    companyName: rawConfig.companyName || defaults.companyName,
    companyAddress: rawConfig.companyAddress || rawConfig.address || defaults.companyAddress,
    gstin: rawConfig.gstin || rawConfig.gst || defaults.gstin,
    pan: rawConfig.pan || defaults.pan,
    email: rawConfig.email || defaults.email,
    accountName: rawConfig.accountName || rawConfig.bankHolder || defaults.accountName,
    accountNumber: rawConfig.accountNumber || rawConfig.accountNo || defaults.accountNumber,
    ifsc: rawConfig.ifsc || defaults.ifsc,
    branch: rawConfig.branch || defaults.branch
  };

  const logoPath = path.join(__dirname, '..', 'assets', 'shapio-logo.png');
  const hasLogo = fs.existsSync(logoPath);
  let logoDataUri = null;
  if (hasLogo) {
    const base64 = fs.readFileSync(logoPath).toString('base64');
    logoDataUri = `data:image/png;base64,${base64}`;
  }
  
  const client = quotation.customer || {};
  const items = quotation.items || [];

  const hsnSummary = {};
  items.forEach(item => {
    const hsn = item.hsnSac || 'N/A';
    if (!hsnSummary[hsn]) {
      hsnSummary[hsn] = { taxable: 0, cgst: 0, sgst: 0 };
    }
    hsnSummary[hsn].taxable += Number(item.amount);
    hsnSummary[hsn].cgst += Number(item.cgstAmount);
    hsnSummary[hsn].sgst += Number(item.sgstAmount);
  });

  return e(Document, null,
    e(Page, { size: 'A4', style: styles.page },
      e(View, { style: styles.pageBorder },
        
        e(View, { style: styles.headerRow },
          e(View, { style: styles.headerLeft },
            e(View, { style: styles.logoBox },
              hasLogo ? e(Image, { src: logoDataUri, style: styles.logo }) : null
            ),
            e(View, { style: styles.companyDetails },
              e(Text, { style: styles.companyName }, BUSINESS_CONFIG.companyName),
              e(Text, { style: styles.companyText }, BUSINESS_CONFIG.companyAddress),
              e(Text, { style: styles.companyText }, `GSTIN: ${BUSINESS_CONFIG.gstin}`),
              e(Text, { style: styles.companyText }, BUSINESS_CONFIG.email),
              e(Text, { style: styles.companyText }, `PAN No: ${BUSINESS_CONFIG.pan}`)
            )
          ),
          e(View, { style: styles.headerRight },
            e(Text, { style: styles.taxInvoiceTitle }, 'Quotation')
          )
        ),
        
        e(View, { style: styles.metaGrid },
          e(View, { style: styles.metaLeft },
            e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Quote #'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, quotation.quoteNo)),
            e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Date'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, formatDate(quotation.createdAt))),
            e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Valid Until'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, quotation.validUntil ? formatDate(quotation.validUntil) : '-'))
          ),
          e(View, { style: styles.metaRight },
            e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'PAN No'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, client.panNumber || BUSINESS_CONFIG.pan))
          )
        ),
        
        e(View, { style: styles.addressGrid },
          e(View, { style: styles.addressBoxLeft },
            e(Text, { style: styles.addressTitle }, 'Quotation For'),
            e(Text, { style: styles.addressName }, client.name),
            e(Text, { style: styles.addressText }, client.billAddress),
            client.phone ? e(Text, { style: [styles.addressText, { marginTop: 4 }] }, `Ph No: ${client.phone}`) : null,
            client.gstNumber ? e(Text, { style: styles.addressText }, `GSTIN: ${client.gstNumber}`) : null
          ),
          e(View, { style: styles.addressBoxRight },
            e(Text, { style: styles.addressTitle }, 'Notes'),
            e(Text, { style: styles.addressText }, quotation.notes || '')
          )
        ),
        
        e(View, { style: styles.tableHeader },
          e(Text, { style: [styles.thCell, styles.colNo] }, '#'),
          e(Text, { style: [styles.thCell, styles.colDesc] }, 'Item & Description'),
          e(View, { style: [styles.thCell, styles.colHsn] }, e(Text, null, 'HSN'), e(Text, null, '/SAC')),
          e(Text, { style: [styles.thCell, styles.colQty] }, 'Qty'),
          e(Text, { style: [styles.thCell, styles.colRate] }, 'Rate'),
          e(View, { style: [styles.thCell, styles.colTax, { padding: 0 }] },
            e(Text, { style: { padding: 2 } }, 'CGST'),
            e(View, { style: styles.taxHeaderSplit },
              e(Text, { style: [styles.taxSubCol, { borderRight: '1 solid #000' }] }, '%'),
              e(Text, { style: styles.taxSubCol }, 'Amt')
            )
          ),
          e(View, { style: [styles.thCell, styles.colTax, { padding: 0 }] },
            e(Text, { style: { padding: 2 } }, 'SGST'),
            e(View, { style: styles.taxHeaderSplit },
              e(Text, { style: [styles.taxSubCol, { borderRight: '1 solid #000' }] }, '%'),
              e(Text, { style: styles.taxSubCol }, 'Amt')
            )
          ),
          e(Text, { style: [styles.thCell, styles.colAmount] }, 'Amount')
        ),
        
        items.map((item, i) => 
          e(View, { style: styles.tableRow, key: i },
            e(Text, { style: [styles.tdCell, styles.colNo, { textAlign: 'center' }] }, i + 1),
            e(Text, { style: [styles.tdCell, styles.colDesc] }, item.description),
            e(Text, { style: [styles.tdCell, styles.colHsn] }, item.hsnSac || '-'),
            e(Text, { style: [styles.tdCell, styles.colQty] }, formatCurrency(item.quantity)),
            e(Text, { style: [styles.tdCell, styles.colRate] }, formatCurrency(item.rate)),
            e(View, { style: [styles.tdCell, styles.colTax, { padding: 0 }] },
              e(View, { style: [styles.taxDataSplit, { flex: 1, alignItems: 'center' }] },
                e(Text, { style: [styles.taxDataSubCol, { borderRight: '1 solid #000', height: '100%', padding: 4 }] }, `${item.cgstRatePct}%`),
                e(Text, { style: [styles.taxDataSubCol, { padding: 4 }] }, formatCurrency(item.cgstAmount))
              )
            ),
            e(View, { style: [styles.tdCell, styles.colTax, { padding: 0 }] },
              e(View, { style: [styles.taxDataSplit, { flex: 1, alignItems: 'center' }] },
                e(Text, { style: [styles.taxDataSubCol, { borderRight: '1 solid #000', height: '100%', padding: 4 }] }, `${item.sgstRatePct}%`),
                e(Text, { style: [styles.taxDataSubCol, { padding: 4 }] }, formatCurrency(item.sgstAmount))
              )
            ),
            e(Text, { style: [styles.tdCell, styles.colAmount] }, formatCurrency(item.amount))
          )
        ),
        
        e(View, { style: styles.bottomSection },
          e(View, { style: styles.bottomLeft },
            e(View, { style: styles.wordsBox },
              e(Text, { style: { fontSize: 8 } }, 'Total In Words'),
              e(Text, { style: { fontSize: 8, fontStyle: 'italic', fontWeight: 'bold', marginTop: 2 } }, generateTotalInWords(quotation.totalAmount))
            )
          ),
          e(View, { style: styles.bottomRight },
            e(View, { style: styles.totalsRow }, e(Text, { style: styles.totalsLabel }, 'Sub Total'), e(Text, { style: styles.totalsValue }, formatCurrency(quotation.subtotal))),
            e(View, { style: styles.totalsRow }, e(Text, { style: styles.totalsLabel }, 'CGST'), e(Text, { style: styles.totalsValue }, formatCurrency(quotation.cgstAmount))),
            e(View, { style: styles.totalsRow }, e(Text, { style: styles.totalsLabel }, 'SGST'), e(Text, { style: styles.totalsValue }, formatCurrency(quotation.sgstAmount))),
            e(View, { style: styles.finalTotalRow }, e(Text, { style: styles.finalTotalLabel }, 'Total Quoted'), e(Text, { style: styles.finalTotalValue }, `₹${formatCurrency(quotation.totalAmount)}`))
          )
        ),

        e(View, { style: styles.hsnSummary },
          e(Text, { style: styles.hsnSummaryTitle }, 'HSN/SAC Summary:'),
          e(View, { style: [styles.tableHeader, { backgroundColor: '#fff', color: '#000', borderTop: '1 solid #000' }] },
            e(Text, { style: [styles.thCell, { width: '20%', textAlign: 'left' }] }, 'HSN/SAC'),
            e(Text, { style: [styles.thCell, { width: '20%', textAlign: 'right' }] }, 'Taxable Amount'),
            e(View, { style: [styles.thCell, { width: '25%', padding: 0 }] },
              e(Text, { style: { padding: 2, borderBottom: '1 solid #000' } }, 'CGST'),
              e(View, { style: styles.taxHeaderSplit },
                e(Text, { style: [styles.taxSubCol, { borderRight: '1 solid #000' }] }, 'Rate'),
                e(Text, { style: styles.taxSubCol }, 'Amount')
              )
            ),
            e(View, { style: [styles.thCell, { width: '25%', padding: 0 }] },
              e(Text, { style: { padding: 2, borderBottom: '1 solid #000' } }, 'SGST'),
              e(View, { style: styles.taxHeaderSplit },
                e(Text, { style: [styles.taxSubCol, { borderRight: '1 solid #000' }] }, 'Rate'),
                e(Text, { style: styles.taxSubCol }, 'Amount')
              )
            ),
            e(View, { style: [styles.thCell, { width: '10%', padding: 0, borderRight: 'none' }] },
              e(Text, { style: { padding: 2 } }, 'Total Tax'),
              e(View, { style: styles.taxHeaderSplit },
                e(Text, { style: [styles.taxSubCol, { width: '100%' }] }, 'Amount')
              )
            )
          ),
          Object.entries(hsnSummary).map(([hsn, vals], i) => {
            const totalTax = vals.cgst + vals.sgst;
            return e(View, { style: styles.tableRow, key: i },
              e(Text, { style: [styles.tdCell, { width: '20%' }] }, hsn),
              e(Text, { style: [styles.tdCell, { width: '20%', textAlign: 'right' }] }, formatCurrency(vals.taxable)),
              e(View, { style: [styles.tdCell, { width: '25%', padding: 0 }] },
                e(View, { style: [styles.taxDataSplit, { flex: 1, alignItems: 'center' }] },
                  e(Text, { style: [styles.taxDataSubCol, { borderRight: '1 solid #000', height: '100%', padding: 4 }] }, '9%'),
                  e(Text, { style: [styles.taxDataSubCol, { padding: 4 }] }, formatCurrency(vals.cgst))
                )
              ),
              e(View, { style: [styles.tdCell, { width: '25%', padding: 0 }] },
                e(View, { style: [styles.taxDataSplit, { flex: 1, alignItems: 'center' }] },
                  e(Text, { style: [styles.taxDataSubCol, { borderRight: '1 solid #000', height: '100%', padding: 4 }] }, '9%'),
                  e(Text, { style: [styles.taxDataSubCol, { padding: 4 }] }, formatCurrency(vals.sgst))
                )
              ),
              e(Text, { style: [styles.tdCell, { width: '10%', textAlign: 'right', borderRight: 'none' }] }, formatCurrency(totalTax))
            );
          }),
          e(View, { style: styles.tableRow },
            e(Text, { style: [styles.tdCell, { width: '20%', fontWeight: 'bold' }] }, 'Total'),
            e(Text, { style: [styles.tdCell, { width: '20%', textAlign: 'right', fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.taxable, 0))),
            e(View, { style: [styles.tdCell, { width: '25%', padding: 0 }] },
              e(View, { style: [styles.taxDataSplit, { flex: 1, alignItems: 'center' }] },
                e(Text, { style: [styles.taxDataSubCol, { borderRight: '1 solid #000', height: '100%', padding: 4 }] }, ''),
                e(Text, { style: [styles.taxDataSubCol, { padding: 4, fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.cgst, 0)))
              )
            ),
            e(View, { style: [styles.tdCell, { width: '25%', padding: 0 }] },
              e(View, { style: [styles.taxDataSplit, { flex: 1, alignItems: 'center' }] },
                e(Text, { style: [styles.taxDataSubCol, { borderRight: '1 solid #000', height: '100%', padding: 4 }] }, ''),
                e(Text, { style: [styles.taxDataSubCol, { padding: 4, fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.sgst, 0)))
              )
            ),
            e(Text, { style: [styles.tdCell, { width: '10%', textAlign: 'right', borderRight: 'none', fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.cgst + b.sgst, 0)))
          )
        ),
        
        e(Text, { style: styles.footerText }, 'This is a Computer Generated Document')
      )
    )
  );
};

const generateQuotationPdfStream = async (quotation, settings = {}) => {
  return await renderToStream(e(QuotationTemplate, { quotation, settings }));
};

module.exports = { generateInvoicePdfStream, generateQuotationPdfStream };
