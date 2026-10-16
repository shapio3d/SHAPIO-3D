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
  page: { padding: 14, paddingBottom: 34, fontFamily: 'Roboto', fontSize: 9, color: '#000' },
  pageBorder: { border: '0.5 solid #000', padding: 0 },
  
  pageBorderFrame: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    border: '0.5 solid #000',
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    height: 16,
    borderTop: '0.5 solid #000',
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  fixedFooterText: {
    fontSize: 7,
    color: '#555',
  },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 6, borderBottom: '0.5 solid #000' },
  headerLeft: { flexDirection: 'row', width: '60%' },
  logoBox: { width: 240, height: 70, marginRight: 15, justifyContent: 'center', alignItems: 'flex-start' },
  logo: { width: '100%', height: '100%', objectFit: 'contain' },
  companyDetails: { justifyContent: 'center' },
  companyName: { fontSize: 13, fontWeight: 'bold' },
  companyText: { fontSize: 7.5, marginTop: 1.5 },
  
  headerRight: { width: '40%', alignItems: 'flex-end', justifyContent: 'flex-end' },
  taxInvoiceTitle: { fontSize: 18, fontWeight: 'bold' },

  metaGrid: { flexDirection: 'row', borderBottom: '0.5 solid #000' },
  metaLeft: { width: '50%', padding: 4, borderRight: '0.5 solid #000' },
  metaRight: { width: '50%', padding: 4 },
  metaRow: { flexDirection: 'row', marginBottom: 2 },
  metaLabel: { width: 70, fontSize: 8 },
  metaColon: { width: 10, fontSize: 8 },
  metaValue: { flex: 1, fontSize: 8, fontWeight: 'bold' },

  addressGrid: { flexDirection: 'row', borderBottom: '0.5 solid #000' },
  addressBoxLeft: { width: '50%', padding: 5 },
  addressBoxRight: { width: '50%', padding: 5 },
  addressTitle: { fontSize: 8, fontWeight: 'bold', backgroundColor: '#334F39', color: '#FFF', padding: 3, marginBottom: 3 },
  addressName: { fontSize: 8, fontWeight: 'bold', marginBottom: 2 },
  addressText: { fontSize: 7.8, marginBottom: 1 },

  tableHeader: { flexDirection: 'row', borderBottom: '0.5 solid #000', backgroundColor: '#334F39', color: '#FFF' },
  thCell: { padding: 3, fontSize: 8, fontWeight: 'bold', borderRight: '0.5 solid #000', textAlign: 'center' },
  
  tableRow: { flexDirection: 'row', borderBottom: '0.5 solid #000', alignItems: 'stretch' },
  tdCell: { padding: 3, fontSize: 8, borderRight: '0.5 solid #000' },
  
  // Taxed Table Columns
  colNo: { width: '4%' },
  colDesc: { width: '28%', textAlign: 'left' },
  colHsn: { width: '10%', textAlign: 'center' },
  colQty: { width: '8%', textAlign: 'center' },
  colRate: { width: '10%', textAlign: 'right' },
  colTax: { width: '14%', textAlign: 'center' },
  colAmount: { width: '12%', textAlign: 'right', borderRight: 'none' },

  // Taxless Table Columns (No HSN, No CGST/SGST columns!)
  colNoTaxless: { width: '5%' },
  colDescTaxless: { width: '55%', textAlign: 'left' },
  colQtyTaxless: { width: '12%', textAlign: 'center' },
  colRateTaxless: { width: '14%', textAlign: 'right' },
  colAmountTaxless: { width: '14%', textAlign: 'right', borderRight: 'none' },

  taxHeaderSplit: { flexDirection: 'row', borderTop: '0.5 solid #000', marginTop: 2, paddingTop: 2 },
  taxSubCol: { width: '50%', fontSize: 7, textAlign: 'center' },
  
  // Stretchable Tax Column Sub-cells
  taxCellContainer: { width: '14%', padding: 0, borderRight: '0.5 solid #000', flexDirection: 'row', alignItems: 'stretch' },
  taxSubCellLeft: { width: '50%', borderRight: '0.5 solid #000', justifyContent: 'center', alignItems: 'center', padding: 2 },
  taxSubCellRight: { width: '50%', justifyContent: 'center', alignItems: 'center', padding: 2 },
  taxSubCellText: { fontSize: 8, textAlign: 'center' },

  bottomSection: { flexDirection: 'row', borderBottom: '0.5 solid #000' },
  bottomLeft: { width: '60%', borderRight: '0.5 solid #000' },
  bottomRight: { width: '40%' },

  wordsBox: { padding: 4, borderBottom: '0.5 solid #000' },
  paymentBox: { padding: 4 },
  paymentTitle: { fontSize: 8, marginBottom: 3 },
  
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 3 },
  totalsLabel: { fontSize: 8 },
  totalsValue: { fontSize: 8, fontWeight: 'bold' },
  finalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 3, borderTop: '0.5 solid #000', borderBottom: '0.5 solid #000' },
  finalTotalLabel: { fontSize: 8.5, fontWeight: 'bold' },
  finalTotalValue: { fontSize: 8.5, fontWeight: 'bold' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 3 },

  // Full-width Notes Section
  notesSection: { width: '100%', padding: '6 8', borderBottom: '0.5 solid #000' },
  notesHeader: { fontSize: 7.5, fontWeight: 'bold', color: '#334F39', textTransform: 'uppercase', marginBottom: 3, letterSpacing: 0.5 },
  notesContentText: { fontSize: 7.5, color: '#111', lineHeight: 1.35 },

  // Two-Column Sign-off Section (50:50 ratio with fixed seal and signature spacing)
  signoffSection: { flexDirection: 'row', borderBottom: '0.5 solid #000', height: 145, alignItems: 'stretch' },
  signoffLeft: { width: '50%', padding: '8 10', borderRight: '0.5 solid #000', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  signoffRight: { width: '50%', padding: '8 10', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' },
  complimentsText: { fontSize: 8.5, fontWeight: 'bold', textAlign: 'center', color: '#000', lineHeight: 1.35 },
  signCompanyText: { fontSize: 8, fontWeight: 'bold', textAlign: 'center' },
  sealArea: { height: 105, width: '100%' }, // Explicit fixed 105 pt blank space
  signLineContainer: { width: '100%', alignItems: 'center' },
  signLine: { width: 140, borderTop: '0.75 solid #000', marginBottom: 3 },
  signLineLabel: { fontSize: 7.5, fontWeight: 'bold', textAlign: 'center', color: '#000' },

  hsnSummary: { marginTop: 0, borderBottom: '0.5 solid #000' },
  hsnSummaryTitle: { fontSize: 8, padding: 3, fontWeight: 'bold', backgroundColor: '#334F39', color: '#FFF' },
  
  footerText: { fontSize: 6, textAlign: 'center', padding: '4 0' },

  statusBadgePaid: { fontSize: 10, fontWeight: 'bold', color: '#166534', backgroundColor: '#dcfce7', padding: '3 8', borderRadius: 3, marginTop: 6, textAlign: 'center' },
  statusBadgeUnpaid: { fontSize: 10, fontWeight: 'bold', color: '#FFF', backgroundColor: '#000000', padding: '3 8', borderRadius: 3, marginTop: 6, textAlign: 'center' },
  statusBadgeOverdue: { fontSize: 10, fontWeight: 'bold', color: '#92400e', backgroundColor: '#fef3c7', padding: '3 8', borderRadius: 3, marginTop: 6, textAlign: 'center' },

  // Quotation multi-page layout
  quotePage: { padding: 14, paddingBottom: 34, fontFamily: 'Roboto', fontSize: 9, color: '#000' },
  bottomSegment: {
    borderTop: '0.5 solid #000',
    marginTop: -0.5,
  },
});

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
};

const formatCurrency = (amount) => Number(amount || 0).toFixed(2);

const titleCase = (str) => {
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const generateTotalInWords = (amount) => {
  try {
    const whole = Math.floor(amount);
    if (whole === 0) return 'Indian Rupee Zero Only';
    const words = titleCase(toWords(whole));
    return `Indian Rupee ${words} Only`;
  } catch (e) {
    return '';
  }
};

const renderTaxedTableHeader = () => e(View, { fixed: true, style: styles.tableHeader },
  e(Text, { style: [styles.thCell, styles.colNo] }, '#'),
  e(Text, { style: [styles.thCell, styles.colDesc] }, 'Item & Description'),
  e(View, { style: [styles.thCell, styles.colHsn] }, e(Text, null, 'HSN'), e(Text, null, '/SAC')),
  e(Text, { style: [styles.thCell, styles.colQty] }, 'Qty'),
  e(Text, { style: [styles.thCell, styles.colRate] }, 'Rate'),
  e(View, { style: [styles.thCell, styles.colTax, { padding: 0 }] },
    e(Text, { style: { padding: 2 } }, 'CGST'),
    e(View, { style: styles.taxHeaderSplit },
      e(Text, { style: [styles.taxSubCol, { borderRight: '0.5 solid #000' }] }, '%'),
      e(Text, { style: styles.taxSubCol }, 'Amt')
    )
  ),
  e(View, { style: [styles.thCell, styles.colTax, { padding: 0 }] },
    e(Text, { style: { padding: 2 } }, 'SGST'),
    e(View, { style: styles.taxHeaderSplit },
      e(Text, { style: [styles.taxSubCol, { borderRight: '0.5 solid #000' }] }, '%'),
      e(Text, { style: styles.taxSubCol }, 'Amt')
    )
  ),
  e(Text, { style: [styles.thCell, styles.colAmount] }, 'Amount')
);

const renderTaxlessTableHeader = () => e(View, { fixed: true, style: styles.tableHeader },
  e(Text, { style: [styles.thCell, styles.colNoTaxless] }, '#'),
  e(Text, { style: [styles.thCell, styles.colDescTaxless] }, 'Item & Description'),
  e(Text, { style: [styles.thCell, styles.colQtyTaxless] }, 'Qty'),
  e(Text, { style: [styles.thCell, styles.colRateTaxless] }, 'Rate'),
  e(Text, { style: [styles.thCell, styles.colAmountTaxless] }, 'Amount')
);

const deduplicateNotes = (rawNotes) => {
  if (!rawNotes || typeof rawNotes !== 'string') return '';
  let trimmed = rawNotes.trim();
  if (!trimmed) return '';

  // Check for concatenated duplicate blocks of quotation/invoice terms
  const marker = '1. Validity of the Quotation';
  if (trimmed.indexOf(marker) !== -1) {
    const parts = trimmed.split(marker).filter(Boolean);
    if (parts.length > 1) {
      trimmed = (marker + parts[0]).trim();
    }
  }

  // Check for exact identical repeating halves or thirds
  const len = trimmed.length;
  for (let div = 2; div <= 4; div++) {
    if (len % div === 0) {
      const partLen = len / div;
      const part = trimmed.substring(0, partLen);
      if (part.repeat(div) === trimmed) {
        trimmed = part.trim();
        break;
      }
    }
  }

  // General paragraph deduplication if duplicate paragraphs exist
  const paragraphs = trimmed.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length > 1) {
    const unique = [];
    for (const p of paragraphs) {
      if (!unique.includes(p)) {
        unique.push(p);
      }
    }
    if (unique.length < paragraphs.length) {
      trimmed = unique.join('\n\n');
    }
  }

  return trimmed;
};

const getComplimentText = (doc) => {
  if (doc.thankYouNote !== undefined) {
    if (doc.thankYouNote === null) return '';
    return String(doc.thankYouNote).trim();
  }
  if (doc.compliments !== undefined) {
    if (doc.compliments === null) return '';
    return String(doc.compliments).trim();
  }
  return 'Thank you for your business!';
};

const renderNotesSection = (doc) => {
  const notesText = deduplicateNotes(doc.notes);
  if (!notesText) return null;

  return e(View, { wrap: false, style: styles.notesSection },
    e(Text, { style: styles.notesHeader }, 'NOTES'),
    e(Text, { style: styles.notesContentText }, notesText)
  );
};

const renderSignoffSection = (doc, businessConfig) => {
  const complimentMsg = getComplimentText(doc);

  return e(View, { wrap: false, style: styles.signoffSection },
    // Left column: Thank you note (50%, centered horizontally and vertically, bold)
    e(View, { style: styles.signoffLeft },
      complimentMsg ? e(Text, { style: styles.complimentsText }, complimentMsg) : null
    ),
    // Right column: Authorized signature and seal (50%)
    e(View, { style: styles.signoffRight },
      e(Text, { style: styles.signCompanyText }, `For ${businessConfig.companyName}`),
      e(View, { style: styles.sealArea }),
      e(View, { style: styles.signLineContainer },
        e(View, { style: styles.signLine }),
        e(Text, { style: styles.signLineLabel }, 'Authorized Sign')
      )
    )
  );
};

// ─────────────────────────────────────────────────────────────
// 1. REGULAR TAXED INVOICE TEMPLATE
// ─────────────────────────────────────────────────────────────
const TaxInvoiceTemplate = ({ invoice, settings }) => {
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
      hsnSummary[hsn] = { taxable: 0, cgst: 0, sgst: 0, cgstRate: item.cgstRatePct, sgstRate: item.sgstRatePct };
    }
    hsnSummary[hsn].taxable += Number(item.amount || 0);
    hsnSummary[hsn].cgst += Number(item.cgstAmount || 0);
    hsnSummary[hsn].sgst += Number(item.sgstAmount || 0);
  });

  return e(Document, null,
    e(Page, { size: 'A4', style: styles.page },
      // Repeating border and footer on every page
      e(View, { fixed: true, style: styles.pageBorderFrame }),
      e(View, { fixed: true, style: styles.fixedFooter },
        e(Text, { style: styles.fixedFooterText }, 'This is a Computer Generated Document'),
        e(Text, { 
          style: styles.fixedFooterText, 
          render: ({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}` 
        })
      ),
        
      // Header
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
          e(Text, { style: styles.taxInvoiceTitle }, 'Tax Invoice'),
          invoice.status === 'PAID'
            ? e(Text, { style: styles.statusBadgePaid }, 'PAID')
            : invoice.status === 'OVERDUE'
              ? e(Text, { style: styles.statusBadgeOverdue }, 'OVERDUE')
              : e(Text, { style: styles.statusBadgeUnpaid }, 'UNPAID')
        )
      ),
      
      // Meta
      e(View, { style: styles.metaGrid },
        e(View, { style: styles.metaLeft },
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Invoice No.'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, invoice.invoiceNumber)),
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Invoice Date'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, formatDate(invoice.issueDate))),
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Terms'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, invoice.terms || 'Due on Receipt')),
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Due Date'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, formatDate(invoice.dueDate)))
        ),
        e(View, { style: styles.metaRight },
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Place Of Supply'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, invoice.placeOfSupply || 'Tamil Nadu (33)')),
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'PAN No'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, client.panNumber || BUSINESS_CONFIG.pan))
        )
      ),
      
      // Address
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
      
      // Taxed Table (Header + Rows wrapped in a table container so the header only repeats for table continuation)
      e(View, null,
        renderTaxedTableHeader(),
        items.map((item, i) => e(View, { wrap: false, style: styles.tableRow, key: i },
          e(Text, { style: [styles.tdCell, styles.colNo, { textAlign: 'center' }] }, i + 1),
          e(Text, { style: [styles.tdCell, styles.colDesc] }, item.description),
          e(Text, { style: [styles.tdCell, styles.colHsn] }, item.hsnSac || '-'),
          e(Text, { style: [styles.tdCell, styles.colQty] }, Number(item.quantity).toString()),
          e(Text, { style: [styles.tdCell, styles.colRate] }, formatCurrency(item.rate)),
          e(View, { style: styles.taxCellContainer },
            e(View, { style: styles.taxSubCellLeft },
              e(Text, { style: styles.taxSubCellText }, `${item.cgstRatePct}%`)
            ),
            e(View, { style: styles.taxSubCellRight },
              e(Text, { style: styles.taxSubCellText }, formatCurrency(item.cgstAmount))
            )
          ),
          e(View, { style: styles.taxCellContainer },
            e(View, { style: styles.taxSubCellLeft },
              e(Text, { style: styles.taxSubCellText }, `${item.sgstRatePct}%`)
            ),
            e(View, { style: styles.taxSubCellRight },
              e(Text, { style: styles.taxSubCellText }, formatCurrency(item.sgstAmount))
            )
          ),
          e(Text, { style: [styles.tdCell, styles.colAmount] }, formatCurrency(item.amount))
        ))
      ),
      
      // Bottom Totals Section
      e(View, { wrap: false, style: styles.bottomSection },
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
          e(View, { style: styles.finalTotalRow }, e(Text, { style: styles.finalTotalLabel }, 'Total'), e(Text, { style: styles.finalTotalValue }, `Rs. ${formatCurrency(invoice.total)}`)),
          invoice.status !== 'PAID' ? e(View, { style: styles.balanceRow }, e(Text, { style: styles.totalsLabel }, 'Balance Due'), e(Text, { style: styles.totalsValue }, `Rs. ${formatCurrency(invoice.balanceDue)}`)) : null
        )
      ),
      
      // HSN/SAC Summary (Natural wrap, independent)
      Object.keys(hsnSummary).length > 0 ? e(View, { wrap: false, style: styles.hsnSummary },
        e(Text, { style: styles.hsnSummaryTitle }, 'HSN/SAC Summary:'),
        e(View, { style: [styles.tableHeader, { backgroundColor: '#fff', color: '#000', borderTop: '0.5 solid #000' }] },
          e(Text, { style: [styles.thCell, { width: '20%', textAlign: 'left' }] }, 'HSN/SAC'),
          e(Text, { style: [styles.thCell, { width: '20%', textAlign: 'right' }] }, 'Taxable Amount'),
          e(View, { style: [styles.thCell, { width: '25%', padding: 0 }] },
            e(Text, { style: { padding: 2, borderBottom: '0.5 solid #000' } }, 'CGST'),
            e(View, { style: styles.taxHeaderSplit },
              e(Text, { style: [styles.taxSubCol, { borderRight: '0.5 solid #000' }] }, 'Rate'),
              e(Text, { style: styles.taxSubCol }, 'Amount')
            )
          ),
          e(View, { style: [styles.thCell, { width: '25%', padding: 0 }] },
            e(Text, { style: { padding: 2, borderBottom: '0.5 solid #000' } }, 'SGST'),
            e(View, { style: styles.taxHeaderSplit },
              e(Text, { style: [styles.taxSubCol, { borderRight: '0.5 solid #000' }] }, 'Rate'),
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
          return e(View, { wrap: false, style: styles.tableRow, key: i },
            e(Text, { style: [styles.tdCell, { width: '20%' }] }, hsn),
            e(Text, { style: [styles.tdCell, { width: '20%', textAlign: 'right' }] }, formatCurrency(vals.taxable)),
            e(View, { style: [styles.taxCellContainer, { width: '25%' }] },
              e(View, { style: styles.taxSubCellLeft },
                e(Text, { style: styles.taxSubCellText }, `${vals.cgstRate || 9}%`)
              ),
              e(View, { style: styles.taxSubCellRight },
                e(Text, { style: styles.taxSubCellText }, formatCurrency(vals.cgst))
              )
            ),
            e(View, { style: [styles.taxCellContainer, { width: '25%' }] },
              e(View, { style: styles.taxSubCellLeft },
                e(Text, { style: styles.taxSubCellText }, `${vals.sgstRate || 9}%`)
              ),
              e(View, { style: styles.taxSubCellRight },
                e(Text, { style: styles.taxSubCellText }, formatCurrency(vals.sgst))
              )
            ),
            e(Text, { style: [styles.tdCell, { width: '10%', textAlign: 'right', borderRight: 'none' }] }, formatCurrency(totalTax))
          );
        }),
        e(View, { wrap: false, style: styles.tableRow },
          e(Text, { style: [styles.tdCell, { width: '20%', fontWeight: 'bold' }] }, 'Total'),
          e(Text, { style: [styles.tdCell, { width: '20%', textAlign: 'right', fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.taxable, 0))),
          e(View, { style: [styles.taxCellContainer, { width: '25%' }] },
            e(View, { style: styles.taxSubCellLeft }),
            e(View, { style: styles.taxSubCellRight },
              e(Text, { style: [styles.taxSubCellText, { fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.cgst, 0)))
            )
          ),
          e(View, { style: [styles.taxCellContainer, { width: '25%' }] },
            e(View, { style: styles.taxSubCellLeft }),
            e(View, { style: styles.taxSubCellRight },
              e(Text, { style: [styles.taxSubCellText, { fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.sgst, 0)))
            )
          ),
          e(Text, { style: [styles.tdCell, { width: '10%', textAlign: 'right', borderRight: 'none', fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.cgst + b.sgst, 0)))
        )
      ) : null,

      // Full-width Notes Section (spans 100% width, immediately above sign-off)
      renderNotesSection(invoice),

      // Two-Column Sign-off Section (Left: Compliments | Right: Fixed Seal Area & Authorized Sign)
      renderSignoffSection(invoice, BUSINESS_CONFIG)
    )
  );
};

// ─────────────────────────────────────────────────────────────
// 2. DEDICATED TAXLESS (STUDENT) INVOICE TEMPLATE
// ─────────────────────────────────────────────────────────────
const TaxlessInvoiceTemplate = ({ invoice, settings }) => {
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

  return e(Document, null,
    e(Page, { size: 'A4', style: styles.page },
      // Absolute border frame repeating on every page
      e(View, { style: styles.pageBorderFrame, fixed: true }),

      // Fixed footer repeating on every page
      e(View, { style: styles.fixedFooter, fixed: true },
        e(Text, { style: styles.fixedFooterText }, 'This is a Computer Generated Document'),
        e(Text, { 
          style: styles.fixedFooterText, 
          render: ({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}` 
        })
      ),
        
      // Header: says "Invoice", NOT "Tax Invoice"
      e(View, { style: styles.headerRow },
        e(View, { style: styles.headerLeft },
          e(View, { style: styles.logoBox },
            hasLogo ? e(Image, { src: logoDataUri, style: styles.logo }) : null
          ),
          e(View, { style: styles.companyDetails },
            e(Text, { style: styles.companyName }, BUSINESS_CONFIG.companyName),
            e(Text, { style: styles.companyText }, BUSINESS_CONFIG.companyAddress),
            e(Text, { style: styles.companyText }, BUSINESS_CONFIG.email),
            e(Text, { style: styles.companyText }, `PAN No: ${BUSINESS_CONFIG.pan}`)
          )
        ),
        e(View, { style: styles.headerRight },
          e(Text, { style: styles.taxInvoiceTitle }, 'Invoice'),
          invoice.status === 'PAID'
            ? e(Text, { style: styles.statusBadgePaid }, 'PAID')
            : invoice.status === 'OVERDUE'
              ? e(Text, { style: styles.statusBadgeOverdue }, 'OVERDUE')
              : e(Text, { style: styles.statusBadgeUnpaid }, 'UNPAID')
        )
      ),
      
      // Meta
      e(View, { style: styles.metaGrid },
        e(View, { style: styles.metaLeft },
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Invoice No.'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, invoice.invoiceNumber)),
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Invoice Date'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, formatDate(invoice.issueDate))),
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Terms'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, invoice.terms || 'Due on Receipt')),
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Due Date'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, formatDate(invoice.dueDate)))
        ),
        e(View, { style: styles.metaRight },
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Place Of Supply'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, invoice.placeOfSupply || 'Tamil Nadu (33)')),
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'PAN No'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, client.panNumber || BUSINESS_CONFIG.pan))
        )
      ),
      
      // Address
      e(View, { style: styles.addressGrid },
        e(View, { style: styles.addressBoxLeft },
          e(Text, { style: styles.addressTitle }, 'Bill To'),
          e(Text, { style: styles.addressName }, client.name),
          e(Text, { style: styles.addressText }, client.billAddress),
          client.phone ? e(Text, { style: [styles.addressText, { marginTop: 4 }] }, `Ph No: ${client.phone}`) : null
        ),
        e(View, { style: styles.addressBoxRight },
          e(Text, { style: styles.addressTitle }, 'Ship To'),
          e(Text, { style: styles.addressName }, client.name),
          e(Text, { style: styles.addressText }, invoice.shipAddress || client.billAddress),
          client.phone ? e(Text, { style: [styles.addressText, { marginTop: 4 }] }, `Ph No: ${client.phone}`) : null
        )
      ),
      
      // Taxless Table (Header + Rows wrapped in a table container so the header only repeats for table continuation)
      e(View, null,
        renderTaxlessTableHeader(),
        items.map((item, i) => e(View, { wrap: false, style: styles.tableRow, key: i },
          e(Text, { style: [styles.tdCell, styles.colNoTaxless, { textAlign: 'center' }] }, i + 1),
          e(Text, { style: [styles.tdCell, styles.colDescTaxless] }, item.description),
          e(Text, { style: [styles.tdCell, styles.colQtyTaxless] }, Number(item.quantity).toString()),
          e(Text, { style: [styles.tdCell, styles.colRateTaxless] }, formatCurrency(item.rate)),
          e(Text, { style: [styles.tdCell, styles.colAmountTaxless] }, formatCurrency(item.amount))
        ))
      ),
      
      // Bottom Totals (Clean Subtotal + Total, NO CGST/SGST lines)
      e(View, { wrap: false, style: styles.bottomSection },
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
          e(View, { style: styles.finalTotalRow }, e(Text, { style: styles.finalTotalLabel }, 'Total'), e(Text, { style: styles.finalTotalValue }, `Rs. ${formatCurrency(invoice.total)}`)),
          invoice.status !== 'PAID' ? e(View, { style: styles.balanceRow }, e(Text, { style: styles.totalsLabel }, 'Balance Due'), e(Text, { style: styles.totalsValue }, `Rs. ${formatCurrency(invoice.balanceDue)}`)) : null
        )
      ),
      
      // Full-width Notes Section (spans 100% width, immediately above sign-off)
      renderNotesSection(invoice),

      // Two-Column Sign-off Section (Left: Compliments | Right: Fixed Seal Area & Authorized Sign)
      renderSignoffSection(invoice, BUSINESS_CONFIG)
    )
  );
};

// Dispatcher for Invoice
const InvoiceTemplate = ({ invoice, settings }) => {
  const totalTax = Number(invoice.cgstAmount || 0) + Number(invoice.sgstAmount || 0);
  const isTaxless = totalTax === 0;
  if (isTaxless) {
    return e(TaxlessInvoiceTemplate, { invoice, settings });
  }
  return e(TaxInvoiceTemplate, { invoice, settings });
};

const generateInvoicePdfStream = async (invoice, settings = {}) => {
  return await renderToStream(e(InvoiceTemplate, { invoice, settings }));
};

// ─────────────────────────────────────────────────────────────
// 3. REGULAR TAXED QUOTATION TEMPLATE
// ─────────────────────────────────────────────────────────────
const TaxQuotationTemplate = ({ quotation, settings }) => {
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
      hsnSummary[hsn] = { taxable: 0, cgst: 0, sgst: 0, cgstRate: item.cgstRatePct, sgstRate: item.sgstRatePct };
    }
    hsnSummary[hsn].taxable += Number(item.amount || 0);
    hsnSummary[hsn].cgst += Number(item.cgstAmount || 0);
    hsnSummary[hsn].sgst += Number(item.sgstAmount || 0);
  });

  return e(Document, null,
    e(Page, { size: 'A4', style: styles.quotePage },
      // Repeating border and footer on every page
      e(View, { fixed: true, style: styles.pageBorderFrame }),
      e(View, { fixed: true, style: styles.fixedFooter },
        e(Text, { style: styles.fixedFooterText }, 'This is a Computer Generated Document'),
        e(Text, { 
          style: styles.fixedFooterText, 
          render: ({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}` 
        })
      ),

      // Header
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
      
      // Meta
      e(View, { style: styles.metaGrid },
        e(View, { style: styles.metaLeft },
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Quote No.'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, quotation.quoteNo)),
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Date'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, formatDate(quotation.createdAt))),
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Valid Until'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, quotation.validUntil ? formatDate(quotation.validUntil) : '-'))
        ),
        e(View, { style: styles.metaRight },
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'PAN No'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, client.panNumber || BUSINESS_CONFIG.pan))
        )
      ),
      
      // Address Row
      e(View, { style: styles.addressGrid },
        e(View, { style: [styles.addressBoxLeft, { width: '100%', borderRight: 'none' }] },
          e(Text, { style: styles.addressTitle }, 'Quotation For'),
          e(Text, { style: styles.addressName }, client.name),
          e(Text, { style: styles.addressText }, client.billAddress),
          client.phone ? e(Text, { style: [styles.addressText, { marginTop: 4 }] }, `Ph No: ${client.phone}`) : null,
          client.gstNumber ? e(Text, { style: styles.addressText }, `GSTIN: ${client.gstNumber}`) : null
        )
      ),
      
      // Taxed Table (Header + Rows wrapped in a table container so the header only repeats for table continuation)
      e(View, null,
        renderTaxedTableHeader(),
        items.map((item, i) => e(View, { wrap: false, style: styles.tableRow, key: i },
          e(Text, { style: [styles.tdCell, styles.colNo, { textAlign: 'center' }] }, i + 1),
          e(Text, { style: [styles.tdCell, styles.colDesc] }, item.description),
          e(Text, { style: [styles.tdCell, styles.colHsn] }, item.hsnSac || '-'),
          e(Text, { style: [styles.tdCell, styles.colQty] }, Number(item.quantity).toString()),
          e(Text, { style: [styles.tdCell, styles.colRate] }, formatCurrency(item.rate)),
          e(View, { style: styles.taxCellContainer },
            e(View, { style: styles.taxSubCellLeft },
              e(Text, { style: styles.taxSubCellText }, `${item.cgstRatePct}%`)
            ),
            e(View, { style: styles.taxSubCellRight },
              e(Text, { style: styles.taxSubCellText }, formatCurrency(item.cgstAmount))
            )
          ),
          e(View, { style: styles.taxCellContainer },
            e(View, { style: styles.taxSubCellLeft },
              e(Text, { style: styles.taxSubCellText }, `${item.sgstRatePct}%`)
            ),
            e(View, { style: styles.taxSubCellRight },
              e(Text, { style: styles.taxSubCellText }, formatCurrency(item.sgstAmount))
            )
          ),
          e(Text, { style: [styles.tdCell, styles.colAmount] }, formatCurrency(item.amount))
        ))
      ),
      
      // Bottom Totals Section
      e(View, { wrap: false, style: styles.bottomSection },
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
          e(View, { style: styles.finalTotalRow }, e(Text, { style: styles.finalTotalLabel }, 'Total Quoted'), e(Text, { style: styles.finalTotalValue }, `Rs. ${formatCurrency(quotation.totalAmount)}`))
        )
      ),

      // HSN/SAC Summary (Natural wrap, independent)
      Object.keys(hsnSummary).length > 0 ? e(View, { wrap: false, style: styles.hsnSummary },
        e(Text, { style: styles.hsnSummaryTitle }, 'HSN/SAC Summary:'),
        e(View, { style: [styles.tableHeader, { backgroundColor: '#fff', color: '#000', borderTop: '0.5 solid #000' }] },
          e(Text, { style: [styles.thCell, { width: '20%', textAlign: 'left' }] }, 'HSN/SAC'),
          e(Text, { style: [styles.thCell, { width: '20%', textAlign: 'right' }] }, 'Taxable Amount'),
          e(View, { style: [styles.thCell, { width: '25%', padding: 0 }] },
            e(Text, { style: { padding: 2, borderBottom: '0.5 solid #000' } }, 'CGST'),
            e(View, { style: styles.taxHeaderSplit },
              e(Text, { style: [styles.taxSubCol, { borderRight: '0.5 solid #000' }] }, 'Rate'),
              e(Text, { style: styles.taxSubCol }, 'Amount')
            )
          ),
          e(View, { style: [styles.thCell, { width: '25%', padding: 0 }] },
            e(Text, { style: { padding: 2, borderBottom: '0.5 solid #000' } }, 'SGST'),
            e(View, { style: styles.taxHeaderSplit },
              e(Text, { style: [styles.taxSubCol, { borderRight: '0.5 solid #000' }] }, 'Rate'),
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
          return e(View, { wrap: false, style: styles.tableRow, key: i },
            e(Text, { style: [styles.tdCell, { width: '20%' }] }, hsn),
            e(Text, { style: [styles.tdCell, { width: '20%', textAlign: 'right' }] }, formatCurrency(vals.taxable)),
            e(View, { style: [styles.taxCellContainer, { width: '25%' }] },
              e(View, { style: styles.taxSubCellLeft },
                e(Text, { style: styles.taxSubCellText }, `${vals.cgstRate || 9}%`)
              ),
              e(View, { style: styles.taxSubCellRight },
                e(Text, { style: styles.taxSubCellText }, formatCurrency(vals.cgst))
              )
            ),
            e(View, { style: [styles.taxCellContainer, { width: '25%' }] },
              e(View, { style: styles.taxSubCellLeft },
                e(Text, { style: styles.taxSubCellText }, `${vals.sgstRate || 9}%`)
              ),
              e(View, { style: styles.taxSubCellRight },
                e(Text, { style: styles.taxSubCellText }, formatCurrency(vals.sgst))
              )
            ),
            e(Text, { style: [styles.tdCell, { width: '10%', textAlign: 'right', borderRight: 'none' }] }, formatCurrency(totalTax))
          );
        }),
        e(View, { wrap: false, style: styles.tableRow },
          e(Text, { style: [styles.tdCell, { width: '20%', fontWeight: 'bold' }] }, 'Total'),
          e(Text, { style: [styles.tdCell, { width: '20%', textAlign: 'right', fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.taxable, 0))),
          e(View, { style: [styles.taxCellContainer, { width: '25%' }] },
            e(View, { style: styles.taxSubCellLeft }),
            e(View, { style: styles.taxSubCellRight },
              e(Text, { style: [styles.taxSubCellText, { fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.cgst, 0)))
            )
          ),
          e(View, { style: [styles.taxCellContainer, { width: '25%' }] },
            e(View, { style: styles.taxSubCellLeft }),
            e(View, { style: styles.taxSubCellRight },
              e(Text, { style: [styles.taxSubCellText, { fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.sgst, 0)))
            )
          ),
          e(Text, { style: [styles.tdCell, { width: '10%', textAlign: 'right', borderRight: 'none', fontWeight: 'bold' }] }, formatCurrency(Object.values(hsnSummary).reduce((a, b) => a + b.cgst + b.sgst, 0)))
        )
      ) : null,

      // Full-width Notes Section (spans 100% width, immediately above sign-off)
      renderNotesSection(quotation),

      // Two-Column Sign-off Section (Left: Compliments | Right: Fixed Seal Area & Authorized Sign)
      renderSignoffSection(quotation, BUSINESS_CONFIG)
    )
  );
};

// ─────────────────────────────────────────────────────────────
// 4. DEDICATED TAXLESS (STUDENT) QUOTATION TEMPLATE
// ─────────────────────────────────────────────────────────────
const TaxlessQuotationTemplate = ({ quotation, settings }) => {
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

  return e(Document, null,
    e(Page, { size: 'A4', style: styles.quotePage },
      // Repeating border and footer on every page
      e(View, { fixed: true, style: styles.pageBorderFrame }),
      e(View, { fixed: true, style: styles.fixedFooter },
        e(Text, { style: styles.fixedFooterText }, 'This is a Computer Generated Document'),
        e(Text, { 
          style: styles.fixedFooterText, 
          render: ({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}` 
        })
      ),

      // Header
      e(View, { style: styles.headerRow },
        e(View, { style: styles.headerLeft },
          e(View, { style: styles.logoBox },
            hasLogo ? e(Image, { src: logoDataUri, style: styles.logo }) : null
          ),
          e(View, { style: styles.companyDetails },
            e(Text, { style: styles.companyName }, BUSINESS_CONFIG.companyName),
            e(Text, { style: styles.companyText }, BUSINESS_CONFIG.companyAddress),
            e(Text, { style: styles.companyText }, BUSINESS_CONFIG.email),
            e(Text, { style: styles.companyText }, `PAN No: ${BUSINESS_CONFIG.pan}`)
          )
        ),
        e(View, { style: styles.headerRight },
          e(Text, { style: styles.taxInvoiceTitle }, 'Quotation')
        )
      ),
      
      // Meta
      e(View, { style: styles.metaGrid },
        e(View, { style: styles.metaLeft },
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Quote No.'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, quotation.quoteNo)),
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Date'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, formatDate(quotation.createdAt))),
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'Valid Until'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, quotation.validUntil ? formatDate(quotation.validUntil) : '-'))
        ),
        e(View, { style: styles.metaRight },
          e(View, { style: styles.metaRow }, e(Text, { style: styles.metaLabel }, 'PAN No'), e(Text, { style: styles.metaColon }, ':'), e(Text, { style: styles.metaValue }, client.panNumber || BUSINESS_CONFIG.pan))
        )
      ),
      
      // Address Row
      e(View, { style: styles.addressGrid },
        e(View, { style: [styles.addressBoxLeft, { width: '100%', borderRight: 'none' }] },
          e(Text, { style: styles.addressTitle }, 'Quotation For'),
          e(Text, { style: styles.addressName }, client.name),
          e(Text, { style: styles.addressText }, client.billAddress),
          client.phone ? e(Text, { style: [styles.addressText, { marginTop: 4 }] }, `Ph No: ${client.phone}`) : null
        )
      ),
      
      // Taxless Table (Header + Rows wrapped in a table container so the header only repeats for table continuation)
      e(View, null,
        renderTaxlessTableHeader(),
        items.map((item, i) => e(View, { wrap: false, style: styles.tableRow, key: i },
          e(Text, { style: [styles.tdCell, styles.colNoTaxless, { textAlign: 'center' }] }, i + 1),
          e(Text, { style: [styles.tdCell, styles.colDescTaxless] }, item.description),
          e(Text, { style: [styles.tdCell, styles.colQtyTaxless] }, Number(item.quantity).toString()),
          e(Text, { style: [styles.tdCell, styles.colRateTaxless] }, formatCurrency(item.rate)),
          e(Text, { style: [styles.tdCell, styles.colAmountTaxless] }, formatCurrency(item.amount))
        ))
      ),
      
      // Bottom Totals Section (Clean Subtotal + Total, NO CGST/SGST lines)
      e(View, { wrap: false, style: styles.bottomSection },
        e(View, { style: styles.bottomLeft },
          e(View, { style: styles.wordsBox },
            e(Text, { style: { fontSize: 8 } }, 'Total In Words'),
            e(Text, { style: { fontSize: 8, fontStyle: 'italic', fontWeight: 'bold', marginTop: 2 } }, generateTotalInWords(quotation.totalAmount))
          )
        ),
        e(View, { style: styles.bottomRight },
          e(View, { style: styles.totalsRow }, e(Text, { style: styles.totalsLabel }, 'Sub Total'), e(Text, { style: styles.totalsValue }, formatCurrency(quotation.subtotal))),
          e(View, { style: styles.finalTotalRow }, e(Text, { style: styles.finalTotalLabel }, 'Total Quoted'), e(Text, { style: styles.finalTotalValue }, `Rs. ${formatCurrency(quotation.totalAmount)}`))
        )
      ),

      // Full-width Notes Section (spans 100% width, immediately above sign-off)
      renderNotesSection(quotation),

      // Two-Column Sign-off Section (Left: Compliments | Right: Fixed Seal Area & Authorized Sign)
      renderSignoffSection(quotation, BUSINESS_CONFIG)
    )
  );
};

// Dispatcher for Quotation
const QuotationTemplate = ({ quotation, settings }) => {
  const quoteNo = String(quotation.quoteNo || '');
  const hasTLPrefix = quoteNo.includes('-TL-') || quoteNo.startsWith('QT-TL') || quoteNo.includes('/TL/');
  const totalTax = Number(quotation.cgstAmount || 0) + Number(quotation.sgstAmount || 0);
  const isTaxless = hasTLPrefix || totalTax === 0;
  if (isTaxless) {
    return e(TaxlessQuotationTemplate, { quotation, settings });
  }
  return e(TaxQuotationTemplate, { quotation, settings });
};

const generateQuotationPdfStream = async (quotation, settings = {}) => {
  return await renderToStream(e(QuotationTemplate, { quotation, settings }));
};

module.exports = { generateInvoicePdfStream, generateQuotationPdfStream };
