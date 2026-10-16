const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { generateInvoicePdfStream, generateQuotationPdfStream } = require('../lib/pdfTemplate');

const OUTPUT_DIR = path.join(__dirname, '..', 'test_output');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Stream to Buffer helper
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

function makeItems(count, options = {}) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    let desc = `3D Printed Prototype Part #${i}`;
    if (options.longDesc) {
      desc = `High-precision custom SLS 3D printed mechanical bracket component #${i} manufactured using industrial grade PA12 Nylon with glass bead surface blasting, UV resistance treatment, and strict ±0.1mm dimensional tolerance verification. Model: SHP-MK4-REV-${i}.`;
    } else if (options.mixedDesc) {
      if (i % 3 === 1) {
        desc = `Component #${i}: Standard FDM PLA Bracket (20x20x10mm)`;
      } else if (i % 3 === 2) {
        desc = `Component #${i}: Multi-line industrial engineering housing part with integrated M3 brass threaded heat-set inserts, fine surface finish, and ISO-certified structural stress compliance.`;
      } else {
        desc = `Part #${i}: Short spacer ring`;
      }
    } else if (options.twoLineDesc) {
      desc = `Component #${i}: Industrial additive SLA resin prototype housing with smooth matte finish`;
    } else if (options.threePlusLineDesc) {
      desc = `Component #${i}: Advanced additive manufacturing aerospace baffle assembly constructed from carbon-fiber reinforced PETG composite material, tested for high continuous thermal resistance up to 110°C, and supplied with full CMM dimensional measurement validation documentation report.`;
    } else if (options.techSpecsDesc) {
      desc = `Part #${i}: Titanium-Ti6Al4V DMLS Bracket (Ref: AER-2026-X${i}-REV_C) - Heat-treated @ 840°C, HIP processed, Ra < 3.2µm, Mass: 42.5g`;
    }

    const rate = options.rates ? options.rates[i - 1] || 1000 : 1000;
    const qty = options.quantities ? options.quantities[i - 1] || 1 : (i % 5 === 0 ? 4 : 1);
    const amount = rate * qty;
    const isTaxless = !!options.isTaxless;

    items.push({
      description: desc,
      hsnSac: isTaxless ? undefined : '9988',
      quantity: qty,
      rate: rate,
      amount: amount,
      cgstRatePct: isTaxless ? 0 : 9,
      cgstAmount: isTaxless ? 0 : amount * 0.09,
      sgstRatePct: isTaxless ? 0 : 9,
      sgstAmount: isTaxless ? 0 : amount * 0.09
    });
  }
  return items;
}

function makeMockInvoice(itemCount, options = {}) {
  const isTaxless = !!options.isTaxless;
  const items = makeItems(itemCount, { ...options, isTaxless });
  const subtotal = items.reduce((acc, it) => acc + it.amount, 0);
  const cgstAmount = isTaxless ? 0 : items.reduce((acc, it) => acc + it.cgstAmount, 0);
  const sgstAmount = isTaxless ? 0 : items.reduce((acc, it) => acc + it.sgstAmount, 0);
  const total = subtotal + cgstAmount + sgstAmount;

  let notesVal = undefined;
  if (options.notes !== undefined) {
    notesVal = options.notes;
  } else if (options.longNotes) {
    notesVal = 'Note 1: Goods once sold will not be taken back without prior authorization.\nNote 2: 100% advance payment required for customized SLA/SLS rapid prototyping orders.\nNote 3: Warranty covers internal structural integrity for 12 months under standard thermal conditions.\nNote 4: All disputes subject to Chennai jurisdiction only.';
  } else if (options.tenToFifteenLineNotes) {
    notesVal = [
      '1. Acceptance of terms: By paying the advance, client accepts all dimensional tolerance criteria.',
      '2. CAD data confidentiality is guaranteed under standard NDA non-disclosure terms.',
      '3. Standard manufacturing lead time: 5-7 business working days from date of CAD sign-off.',
      '4. Surface post-processing: Vapor smoothing & bead blasting applied per spec sheet.',
      '5. Dimensional inspection: Verified using coordinate measuring machine (CMM) with ±0.1mm accuracy.',
      '6. Material certificate: Chemical composition & RoHS compliance report included with shipment.',
      '7. Packing: Anti-static ESD vacuum sealed packaging with moisture absorbent desiccant packs.',
      '8. Dispatch: Shipped via priority insured courier with door-to-door tracking information.',
      '9. Defects: Any discrepancies must be reported in writing within 48 hours of parcel delivery.',
      '10. Warranty: Void if items are subjected to mechanical alteration or thermal overload.',
      '11. Payment: Balance due on receipt before dispatch release unless credit terms agreed.',
      '12. Jurisdiction: Any legal claims shall be subject to exclusive Chennai court jurisdiction.'
    ].join('\n');
  } else {
    notesVal = 'Standard payment terms apply.';
  }

  return {
    invoiceNumber: isTaxless ? `INV-TL-2026-${String(itemCount).padStart(3, '0')}` : `INV-2026-${String(itemCount).padStart(3, '0')}`,
    issueDate: new Date('2026-10-16').toISOString(),
    dueDate: new Date('2026-11-15').toISOString(),
    terms: options.longTerms ? 'Full payment due within 45 days of delivery invoice date via RTGS / NEFT transfer' : 'Due on Receipt',
    placeOfSupply: options.placeOfSupply || 'Tamil Nadu (33)',
    shipAddress: options.longAddress 
      ? 'Plot 42A, Advanced Additive Manufacturing Corridor, SIDCO Industrial Estate Phase 2, Near Ambattur Industrial Substation, Chennai, Tamil Nadu, 600058, India'
      : (options.noShipAddress ? undefined : 'No. 12, Tech Park, Chennai, Tamil Nadu 600096'),
    subtotal,
    cgstAmount,
    sgstAmount,
    total,
    balanceDue: total,
    status: options.status || 'UNPAID',
    notes: notesVal,
    thankYouNote: options.thankYouNote || 'Thank you for your business with Shapio 3D Technologies!',
    client: {
      name: options.longCompanyName 
        ? 'AeroSpace Dynamic Engineering & Defense Composite Technologies Global Solutions Private Limited' 
        : (options.clientName || 'Apex Aerospace Technologies Pvt Ltd'),
      billAddress: options.longAddress
        ? 'Plot 42A, Advanced Additive Manufacturing Corridor, SIDCO Industrial Estate Phase 2, Near Ambattur Industrial Substation, Chennai, Tamil Nadu, 600058, India'
        : 'No. 12, Tech Park, Chennai, Tamil Nadu 600096',
      panNumber: options.noPan ? undefined : 'ABCDE1234F',
      gstNumber: isTaxless ? '' : (options.noGst ? undefined : '33ABCDE1234F1Z5'),
      phone: options.noPhone ? undefined : '+91 98765 43210'
    },
    items
  };
}

function makeMockQuotation(itemCount, options = {}) {
  const isTaxless = !!options.isTaxless;
  const items = makeItems(itemCount, { ...options, isTaxless });
  const subtotal = items.reduce((acc, it) => acc + it.amount, 0);
  const cgstAmount = isTaxless ? 0 : items.reduce((acc, it) => acc + it.cgstAmount, 0);
  const sgstAmount = isTaxless ? 0 : items.reduce((acc, it) => acc + it.sgstAmount, 0);
  const totalAmount = subtotal + cgstAmount + sgstAmount;

  let notesVal = undefined;
  if (options.notes !== undefined) {
    notesVal = options.notes;
  } else if (options.longNotes) {
    notesVal = 'Terms & Conditions:\n1. Quotation valid for 30 calendar days from issue date.\n2. Standard lead time is 4 to 6 business days after CAD file validation and surface tolerance approval.\n3. Prototype dimensional inspection report included with delivery dispatch.';
  } else if (options.tenToFifteenLineNotes) {
    notesVal = [
      '1. Quote validity: 30 days from date of issue. Prices subject to change thereafter.',
      '2. Lead time: 5-7 business working days after confirmed purchase order & 3D CAD upload.',
      '3. Tolerances: Built to ISO 2768-m standards unless otherwise agreed in writing.',
      '4. Surface quality: Standard as-printed layered finish unless secondary polishing requested.',
      '5. Testing: Visual inspection & caliper critical dimension check included.',
      '6. Material compliance: RoHS and REACH compliant raw polymer filaments and resins.',
      '7. Delivery: Ex-works Chennai facility. Shipping charges quoted separately if applicable.',
      '8. Cancellation: Custom additive production orders cannot be cancelled once build commences.',
      '9. IP Rights: All design CAD rights remain 100% property of the customer.',
      '10. Force Majeure: Delivery schedules adjusted for unexpected machine breakdowns.',
      '11. Payment: 50% advance with purchase order, balance prior to dispatch.',
      '12. Arbitration: Subject to exclusive Chennai territorial jurisdiction.'
    ].join('\n');
  } else {
    notesVal = 'Quotation valid for 30 days.';
  }

  return {
    quoteNo: isTaxless ? `QT-TL-2026-${String(itemCount).padStart(3, '0')}` : `QT-2026-${String(itemCount).padStart(3, '0')}`,
    createdAt: new Date('2026-10-16').toISOString(),
    validUntil: new Date('2026-11-15').toISOString(),
    subtotal,
    cgstAmount,
    sgstAmount,
    totalAmount,
    status: 'SENT',
    notes: notesVal,
    thankYouNote: options.thankYouNote || 'Thank you for your inquiry with Shapio 3D Technologies!',
    customer: {
      name: options.longCompanyName 
        ? 'National Institute of Additive Engineering & Space Technology Innovation Centre' 
        : (options.clientName || 'Vel Tech Engineering Research Group'),
      billAddress: options.longAddress
        ? 'Department of Aerospace Engineering, Block C, 400 Feet Outer Ring Road, Avadi, Chennai, Tamil Nadu 600062'
        : 'Guindy Industrial Estate, Chennai 600032',
      panNumber: options.noPan ? undefined : 'FGHIJ5678K',
      gstNumber: isTaxless ? '' : (options.noGst ? undefined : '33FGHIJ5678K1Z2'),
      phone: options.noPhone ? undefined : '+91 91234 56789'
    },
    items
  };
}

async function runSinglePdfTest(scenarioGroup, testId, description, tplConfig, docObj) {
  const stream = tplConfig.isQuotation 
    ? await generateQuotationPdfStream(docObj) 
    : await generateInvoicePdfStream(docObj);
  const buffer = await streamToBuffer(stream);

  const filename = `${testId}_${tplConfig.type}.pdf`;
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, buffer);

  // Extract text and page count via PDFParse
  const parser = new PDFParse({ data: buffer });
  await parser.load();
  const info = await parser.getInfo();
  const textObj = await parser.getText();
  const pageCount = info.total;
  const fullText = textObj.text;
  const pages = textObj.pages || [];

  const failures = [];

  // Assertion 1: Expected pages if specified
  if (tplConfig.expectedPages && pageCount !== tplConfig.expectedPages) {
    failures.push(`Expected exactly ${tplConfig.expectedPages} page(s), got ${pageCount}`);
  }
  if (tplConfig.minPages && pageCount < tplConfig.minPages) {
    failures.push(`Expected at least ${tplConfig.minPages} page(s), got ${pageCount}`);
  }

  // Assertion 2: All items must be present in extracted text
  const itemCount = (docObj.items || []).length;
  for (let i = 0; i < itemCount; i++) {
    const it = docObj.items[i];
    const snippet = it.description ? it.description.trim().substring(0, 20) : `#${i + 1}`;
    if (!fullText.includes(snippet)) {
      failures.push(`Missing item "${snippet}" in extracted text`);
      break;
    }
  }

  // Assertion 3: Orphan page check (no page should have only footer and blank content)
  if (pages && pages.length > 1) {
    for (const p of pages) {
      const pageText = (p.text || '').trim();
      const cleanPageText = pageText
        .replace(/This is a Computer Generated Document/g, '')
        .replace(/Page \d+ of \d+/g, '')
        .replace(/-- \d+ of \d+ --/g, '')
        .trim();
      if (cleanPageText.length < 20) {
        failures.push(`Page ${p.num} is an empty/orphan page with insufficient content: "${cleanPageText}"`);
      }
    }
  }

  // Assertion 4: Repeated table headers on subsequent pages for multi-page documents
  if (pages && pages.length > 1) {
    for (let pIdx = 1; pIdx < pages.length; pIdx++) {
      const pText = pages[pIdx].text || '';
      // Check if this page contains any item description snippets
      const hasItems = docObj.items.some(it => {
        const descSnippet = (it.description || '').trim().substring(0, 20);
        return descSnippet && pText.includes(descSnippet);
      });
      if (hasItems) {
        const expectedHeader = tplConfig.isTaxless ? 'Description' : 'Item & Description';
        if (!pText.includes(expectedHeader)) {
          failures.push(`Page ${pIdx + 1} has items but missing repeated header "${expectedHeader}"`);
        }
      } else {
        // If the page contains NO item rows, table header must NOT appear!
        if (pText.includes('Item & Description')) {
          failures.push(`Page ${pIdx + 1} has NO item rows but unexpectedly repeats table header "Item & Description"`);
        }
      }
    }
  }

  // Assertion 5: Taxless vs Taxed check
  if (tplConfig.isTaxless) {
    if (fullText.includes('CGST Amount') || fullText.includes('SGST Amount')) {
      failures.push('Taxless document contains CGST/SGST table headers');
    }
    if (fullText.includes('HSN/SAC Summary:')) {
      failures.push('Taxless document contains HSN/SAC summary');
    }
  } else {
    if (!fullText.includes('HSN/SAC Summary:')) {
      failures.push('Taxed document missing HSN/SAC summary section');
    }
    if (!fullText.includes('CGST') || !fullText.includes('SGST')) {
      failures.push('Taxed document missing CGST / SGST headers');
    }
  }

  // Assertion 6: Compliments message check (heading removed, message present)
  if (fullText.includes('COMPLIMENTS') || fullText.includes('Compliments')) {
    failures.push('"COMPLIMENTS" heading was not removed as required');
  }
  const expectedThankYou = docObj.thankYouNote !== undefined ? docObj.thankYouNote : 'Thank you for your business!';
  if (expectedThankYou && !fullText.includes(expectedThankYou) && !fullText.includes('Thank you for your business')) {
    failures.push(`Missing thank-you message "${expectedThankYou}"`);
  }

  // Assertion 7: Notes section check
  const hasNotes = docObj.notes && docObj.notes.trim().length > 0;
  if (hasNotes) {
    if (!fullText.includes('NOTES') && !fullText.includes('Notes')) {
      failures.push('Missing "Notes" heading when notes are present');
    }
    // Verify first line of notes is present
    const firstNoteLine = docObj.notes.trim().split('\n')[0].trim();
    if (firstNoteLine && !fullText.includes(firstNoteLine.substring(0, 30))) {
      failures.push(`Missing note content snippet: "${firstNoteLine.substring(0, 30)}"`);
    }
  } else {
    // If no notes, ensure "NOTES" header is NOT rendered
    // Note: check for NOTES standalone or in footer context
    const lines = fullText.split('\n').map(l => l.trim());
    const hasNotesHeader = lines.some(l => l === 'NOTES' || l === 'Notes');
    if (hasNotesHeader) {
      failures.push('Notes heading is unexpectedly rendered when notes are empty');
    }
  }

  // Assertion 8: Seal and Signature area check
  if (!fullText.includes('For Shapio 3D Technologies')) {
    failures.push('Missing company sign-off header "For Shapio 3D Technologies"');
  }
  if (!fullText.includes('Authorized Sign')) {
    failures.push('Missing "Authorized Sign" label');
  }

  // Assertion 9: Page numbering format
  for (let pIdx = 0; pIdx < pageCount; pIdx++) {
    const expectedPageStr = `Page ${pIdx + 1} of ${pageCount}`;
    if (!fullText.includes(expectedPageStr)) {
      failures.push(`Missing or incorrect page numbering "${expectedPageStr}"`);
      break;
    }
  }

  return {
    scenarioGroup,
    testId,
    description,
    templateType: tplConfig.type,
    filename,
    filePath,
    pageCount,
    itemCount,
    notesLength: hasNotes ? docObj.notes.length : 0,
    passed: failures.length === 0,
    failures
  };
}

async function runRegressionSuite() {
  console.log('='.repeat(90));
  console.log('SHAPIO 3D TECHNOLOGIES — COMPREHENSIVE PDF REGRESSION TEST SUITE');
  console.log('Testing all 4 templates across Scenarios A through F');
  console.log('='.repeat(90));

  const allResults = [];

  const TEMPLATES = [
    { type: 'tax_invoice', isTaxless: false, isQuotation: false },
    { type: 'taxless_invoice', isTaxless: true, isQuotation: false },
    { type: 'tax_quotation', isTaxless: false, isQuotation: true },
    { type: 'taxless_quotation', isTaxless: true, isQuotation: true }
  ];

  // ─────────────────────────────────────────────────────────────
  // SCENARIO A: Single-page documents (1, 3, 5, 7 items)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--> Executing Scenario A: Single-Page Documents...');
  const scenarioATests = [
    { id: 'A1_1item', desc: '1 item with short description', items: 1, opts: { expectedPages: 1 } },
    { id: 'A2_3items', desc: '3 items with normal descriptions', items: 3, opts: { expectedPages: 1 } },
    { id: 'A3_5items', desc: '5 items with mixed description lengths', items: 5, opts: { mixedDesc: true, expectedPages: null } },
    { id: 'A4_7items', desc: '7 items with realistic product descriptions', items: 7, opts: { expectedPages: null } }
  ];

  for (const t of scenarioATests) {
    for (const tpl of TEMPLATES) {
      const docObj = tpl.isQuotation 
        ? makeMockQuotation(t.items, { ...t.opts, isTaxless: tpl.isTaxless }) 
        : makeMockInvoice(t.items, { ...t.opts, isTaxless: tpl.isTaxless });
      const res = await runSinglePdfTest('Scenario A (Single-Page)', t.id, t.desc, { ...tpl, expectedPages: t.opts.expectedPages }, docObj);
      allResults.push(res);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SCENARIO B: Multipage documents (10, 15, 25, 40 items)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--> Executing Scenario B: Multipage Documents...');
  const scenarioBTests = [
    { id: 'B1_10items', desc: '10 items with realistic descriptions', items: 10, opts: {} },
    { id: 'B2_15items', desc: '15 items with varying row heights', items: 15, opts: { mixedDesc: true } },
    { id: 'B3_25items', desc: '25 items across multiple pages', items: 25, opts: { mixedDesc: true, minPages: 2 } },
    { id: 'B4_40items', desc: '40 items across multiple pages', items: 40, opts: { minPages: 2 } }
  ];

  for (const t of scenarioBTests) {
    for (const tpl of TEMPLATES) {
      const docObj = tpl.isQuotation 
        ? makeMockQuotation(t.items, { ...t.opts, isTaxless: tpl.isTaxless }) 
        : makeMockInvoice(t.items, { ...t.opts, isTaxless: tpl.isTaxless });
      const res = await runSinglePdfTest('Scenario B (Multipage)', t.id, t.desc, { ...tpl, minPages: t.opts.minPages }, docObj);
      allResults.push(res);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SCENARIO C: Notes-length variations (10 distinct tests)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--> Executing Scenario C: Notes-Length Variations...');
  const scenarioCTests = [
    { id: 'C1_emptyNotes', desc: 'Empty notes (clean empty state)', items: 3, opts: { notes: '' } },
    { id: 'C2_shortNotes', desc: 'Very short note: FDM - PETG & TPU', items: 3, opts: { notes: 'FDM - PETG & TPU' } },
    { id: 'C3_oneLineNotes', desc: 'One-line note with full sentence', items: 3, opts: { notes: 'All 3D components inspected according to ISO-2768 standard tolerance specifications.' } },
    { id: 'C4_3to5LineNotes', desc: 'Notes spanning 3-5 lines', items: 3, opts: { longNotes: true } },
    { id: 'C5_10to15LineNotes', desc: 'Notes spanning 10-15 lines', items: 3, opts: { tenToFifteenLineNotes: true } },
    { id: 'C6_numberedNotes', desc: 'Multiple numbered notes', items: 3, opts: { notes: '1. 100% advance required for rapid prototyping.\n2. Standard delivery is 4-5 business days.\n3. Defect reports within 48 hours of dispatch.\n4. Chennai court jurisdiction.' } },
    { id: 'C7_specialCharsNotes', desc: 'Notes with punctuation, parens, hyphens & symbols', items: 3, opts: { notes: 'Tolerance: ±0.1mm (ISO 2768-m) - Material: PETG/TPU @ 100% infill; ESD-safe & RoHS compliant! [Batch #SHP-2026/Q3] - Contact: support@shapio.in.' } },
    { id: 'C8_wrappingNotes', desc: 'Notes containing long text wrapping across lines', items: 3, opts: { notes: 'This is an exceptionally long single-paragraph terms and conditions clause specifically designed to thoroughly test horizontal word-wrapping capabilities within the newly redesigned left footer compliments and notes column to ensure text gracefully wraps onto consecutive lines without crossing borders or colliding with the seal.' } },
    { id: 'C9_notesWithLongDesc', desc: 'Notes combined with long item description', items: 2, opts: { longDesc: true, notes: 'Special order: Requires dual-color nozzle calibration and 100-micron layer height.' } },
    { id: 'C10_notesMultipageTable', desc: 'Long notes combined with multipage item table', items: 25, opts: { mixedDesc: true, longNotes: true, minPages: 2 } }
  ];

  for (const t of scenarioCTests) {
    for (const tpl of TEMPLATES) {
      const docObj = tpl.isQuotation 
        ? makeMockQuotation(t.items, { ...t.opts, isTaxless: tpl.isTaxless }) 
        : makeMockInvoice(t.items, { ...t.opts, isTaxless: tpl.isTaxless });
      const res = await runSinglePdfTest('Scenario C (Notes Variations)', t.id, t.desc, { ...tpl, minPages: t.opts.minPages }, docObj);
      allResults.push(res);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SCENARIO D: Compliments & Dedicated Seal Area Tests
  // ─────────────────────────────────────────────────────────────
  console.log('\n--> Executing Scenario D: Compliments & Dedicated Seal Area Tests...');
  const scenarioDTests = [
    { id: 'D1_sealShortNotes', desc: 'Dedicated Seal Space with Short Notes', items: 2, opts: { notes: 'FDM - PETG & TPU' } },
    { id: 'D2_sealLongNotes', desc: 'Dedicated Seal Space with Long Notes', items: 2, opts: { longNotes: true } },
    { id: 'D3_sealEmptyNotes', desc: 'Dedicated Seal Space with Empty Notes', items: 2, opts: { notes: '' } },
    { id: 'D4_sealPage2Break', desc: 'Dedicated Seal Space on Page 2 overflow', items: 11, opts: { notes: 'Standard terms apply.' } }
  ];

  for (const t of scenarioDTests) {
    for (const tpl of TEMPLATES) {
      const docObj = tpl.isQuotation 
        ? makeMockQuotation(t.items, { ...t.opts, isTaxless: tpl.isTaxless }) 
        : makeMockInvoice(t.items, { ...t.opts, isTaxless: tpl.isTaxless });
      const res = await runSinglePdfTest('Scenario D (Seal Space)', t.id, t.desc, tpl, docObj);
      allResults.push(res);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SCENARIO E: Long-Description and Row-Height Tests
  // ─────────────────────────────────────────────────────────────
  console.log('\n--> Executing Scenario E: Long Description & Row-Height Tests...');
  const scenarioETests = [
    { id: 'E1_shortDesc', desc: 'Short 1-line item descriptions', items: 4, opts: {} },
    { id: 'E2_twoLineDesc', desc: 'Descriptions spanning 2 lines', items: 4, opts: { twoLineDesc: true } },
    { id: 'E3_threePlusLineDesc', desc: 'Descriptions spanning 3+ lines', items: 4, opts: { threePlusLineDesc: true } },
    { id: 'E4_mixedDesc', desc: 'Mixed short and long descriptions', items: 6, opts: { mixedDesc: true } },
    { id: 'E5_techSpecsDesc', desc: 'Descriptions with hyphens, model numbers & specs', items: 5, opts: { techSpecsDesc: true } }
  ];

  for (const t of scenarioETests) {
    for (const tpl of TEMPLATES) {
      const docObj = tpl.isQuotation 
        ? makeMockQuotation(t.items, { ...t.opts, isTaxless: tpl.isTaxless }) 
        : makeMockInvoice(t.items, { ...t.opts, isTaxless: tpl.isTaxless });
      const res = await runSinglePdfTest('Scenario E (Row Heights)', t.id, t.desc, tpl, docObj);
      allResults.push(res);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SCENARIO F: Customer & Document Detail Variations
  // ─────────────────────────────────────────────────────────────
  console.log('\n--> Executing Scenario F: Customer & Document Detail Variations...');
  const scenarioFTests = [
    { id: 'F1_shortCustomer', desc: 'Short customer name & address', items: 3, opts: { clientName: 'ABC Corp', longAddress: false } },
    { id: 'F2_longCustomer', desc: 'Long company name & multiline address', items: 3, opts: { longCompanyName: true, longAddress: true } },
    { id: 'F3_longTerms', desc: 'Long terms & conditions description', items: 3, opts: { longTerms: true } },
    { id: 'F4_missingOptional', desc: 'Missing optional phone and shipping address', items: 3, opts: { noPhone: true, noShipAddress: true } },
    { id: 'F5_varyingQuantities', desc: 'Varying item quantities and rates', items: 5, opts: { quantities: [1, 25, 100, 2, 10], rates: [500, 150, 45, 12000, 350] } },
    { id: 'F6_overflowSignoff', desc: 'Content height triggers clean signoff page break', items: 8, opts: { mixedDesc: true, longNotes: true } }
  ];

  for (const t of scenarioFTests) {
    for (const tpl of TEMPLATES) {
      const docObj = tpl.isQuotation 
        ? makeMockQuotation(t.items, { ...t.opts, isTaxless: tpl.isTaxless }) 
        : makeMockInvoice(t.items, { ...t.opts, isTaxless: tpl.isTaxless });
      const res = await runSinglePdfTest('Scenario F (Customer Variations)', t.id, t.desc, tpl, docObj);
      allResults.push(res);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SCENARIO M: SECTION 8 MANDATORY REGRESSION TESTS
  // ─────────────────────────────────────────────────────────────
  console.log('\n--> Executing Scenario M: Section 8 Mandatory Regression Tests...');
  const scenarioMTests = [
    { id: 'M1_1item_emptyNotes', desc: '1 item with empty notes', items: 1, opts: { notes: '' } },
    { id: 'M2_3items_oneLineNote', desc: '3 items with a one-line note', items: 3, opts: { notes: 'All 3D components inspected according to ISO-2768 standard tolerance specifications.' } },
    { id: 'M3_5items_shortNotes', desc: '5 items with short notes', items: 5, opts: { notes: 'FDM - PETG & TPU' } },
    { id: 'M4_7items_multilineDesc', desc: '7 items with multiline descriptions', items: 7, opts: { threePlusLineDesc: true, notes: 'Standard manufacturing tolerances apply.' } },
    { id: 'M5_10items_fiveLineNote', desc: '10 items with a five-line note', items: 10, opts: { notes: '1. Standard delivery lead time is 4-5 business days.\n2. Dimensional inspection report included with delivery dispatch.\n3. Defect reports must be submitted within 48 hours of dispatch.\n4. 100% advance payment required for custom rapid prototyping.\n5. Jurisdiction: Subject to Chennai court jurisdiction only.' } },
    { id: 'M6_15items_longNotes', desc: '15 items with long notes', items: 15, opts: { longNotes: true } },
    { id: 'M7_25items_multipage', desc: '25 items across multiple pages', items: 25, opts: { mixedDesc: true, minPages: 2 } },
    { id: 'M8_40items_longDesc_multilineNotes', desc: '40 items with long descriptions and multiline notes', items: 40, opts: { longDesc: true, tenToFifteenLineNotes: true, minPages: 2 } }
  ];

  for (const t of scenarioMTests) {
    for (const tpl of TEMPLATES) {
      const docObj = tpl.isQuotation 
        ? makeMockQuotation(t.items, { ...t.opts, isTaxless: tpl.isTaxless }) 
        : makeMockInvoice(t.items, { ...t.opts, isTaxless: tpl.isTaxless });
      const res = await runSinglePdfTest('Scenario M (Mandatory Sec 8)', t.id, t.desc, { ...tpl, minPages: t.opts.minPages }, docObj);
      allResults.push(res);
    }
  }

  // REPRODUCTION TEST: Invoice-SHP3D-TL-26-27-004
  console.log('\n--> Executing Reproduction Test: Invoice-SHP3D-TL-26-27-004...');
  const tl004Invoice = {
    invoiceNumber: 'SHP3D/TL/26-27/004',
    issueDate: '2026-04-10',
    dueDate: '2026-04-10',
    terms: 'Due on Receipt',
    placeOfSupply: 'Tamil Nadu (33)',
    shipAddress: 'Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology, Avadi, Chennai',
    notes: `1. Validity of the Quotation: This quotation is valid for a period of 15 days from the date of issue.
2. Payment Terms: 100% payment to be made along with the purchase order.
3. Delivery Terms: Standard delivery will be within 3-4 working days after payment receipt.
4. Jurisdiction: In case of any disputes, it will be subject to Chennai jurisdiction.
1. Validity of the Quotation: This quotation is valid for a period of 15 days from the date of issue.
2. Payment Terms: 100% payment to be made along with the purchase order.
3. Delivery Terms: Standard delivery will be within 3-4 working days after payment receipt.
4. Jurisdiction: In case of any disputes, it will be subject to Chennai jurisdiction.`,
    thankYouNote: 'Thank you for your business!',
    subtotal: 5310,
    cgstAmount: 0,
    sgstAmount: 0,
    total: 5310,
    balanceDue: 5310,
    client: {
      name: 'Dr. A. Saravanan (Vel Tech)',
      billAddress: 'Department of Mechanical Engineering, Vel Tech University, Avadi, Chennai - 600062',
      panNo: 'ABCDE1234F'
    },
    items: [
      { description: 'FDM 3D Printing - ABS Black Component Part A', quantity: 2, rate: 1200, amount: 2400, cgstRatePct: 0, sgstRatePct: 0, cgstAmount: 0, sgstAmount: 0 },
      { description: 'SLA High-Precision Resin Housing Model B', quantity: 1, rate: 2100, amount: 2100, cgstRatePct: 0, sgstRatePct: 0, cgstAmount: 0, sgstAmount: 0 },
      { description: 'Surface Post-Processing & Bead Blasting Finish', quantity: 1, rate: 810, amount: 810, cgstRatePct: 0, sgstRatePct: 0, cgstAmount: 0, sgstAmount: 0 }
    ]
  };

  const tl004Res = await runSinglePdfTest(
    'Reproduction (TL-004)',
    'TL004_reproduction',
    'Actual Invoice-SHP3D-TL-26-27-004 with duplicated quotation terms',
    { type: 'taxless_invoice', isTaxless: true, isQuotation: false, expectedPages: 1 },
    tl004Invoice
  );
  allResults.push(tl004Res);

  // ─────────────────────────────────────────────────────────────
  // SUMMARY REPORT GENERATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(90));
  console.log('REGRESSION TEST RESULTS SUMMARY');
  console.log('='.repeat(90));

  const totalTests = allResults.length;
  const passedTests = allResults.filter(r => r.passed).length;
  const failedTests = allResults.filter(r => !r.passed);

  console.log(`\nTotal Test Runs: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests.length}`);

  if (failedTests.length > 0) {
    console.log('\nFAILURES DETECTED:');
    failedTests.forEach(f => {
      console.log(`[FAIL] ${f.testId} (${f.templateType}): ${f.failures.join('; ')}`);
    });
  } else {
    console.log(`\n>>> ALL ${totalTests} AUTOMATED TESTS PASSED CLEANLY! <<<`);
  }

  // Grouped Summary Table
  const groups = [...new Set(allResults.map(r => r.scenarioGroup))];
  const summaryByGroup = groups.map(g => {
    const inGroup = allResults.filter(r => r.scenarioGroup === g);
    const groupPassed = inGroup.filter(r => r.passed).length;
    return {
      ScenarioGroup: g,
      TotalTests: inGroup.length,
      Passed: groupPassed,
      Failed: inGroup.length - groupPassed,
      Status: groupPassed === inGroup.length ? 'PASS' : 'FAIL'
    };
  });
  console.table(summaryByGroup);

  // Write comprehensive JSON report for traceability
  const reportPath = path.join(OUTPUT_DIR, 'regression_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalTests,
    passedTests,
    failedTestsCount: failedTests.length,
    groups: summaryByGroup,
    results: allResults.map(r => ({
      scenarioGroup: r.scenarioGroup,
      testId: r.testId,
      description: r.description,
      templateType: r.templateType,
      filename: r.filename,
      pageCount: r.pageCount,
      passed: r.passed,
      failures: r.failures
    }))
  }, null, 2));

  console.log(`\nDetailed JSON report saved to: ${reportPath}`);

  if (failedTests.length > 0) {
    process.exit(1);
  }
}

// Execute suite
runRegressionSuite().catch(err => {
  console.error('Fatal regression suite error:', err);
  process.exit(1);
});
