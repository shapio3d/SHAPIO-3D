# Separate Taxless & Taxed Invoices + Taxless Quotations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Decouple taxless invoice numbering into an independent sequence (`SHP3D-TL/26-27/001`) that preserves manual sequence increments (e.g., if manually set to 003, next suggests 004), automatically update invoice numbers based on selected invoice type, and remove all HSN/SAC references from both taxless invoices and taxless quotations (in Admin UI forms and PDF generation) so they display only Item Name, Price, and Quantity.

**Architecture:** 
1. Separate invoice numbering sequence calculation in `shapio/admin/src/pages/Invoices.jsx` by inspecting existing invoice records, categorizing them into `taxed` vs `taxless`, and independently tracking the maximum sequence (`maxSeq + 1`) for each series (`SHP3D/26-27/051` for Taxed, and `SHP3D-TL/26-27/001` for Taxless). Any manual number entry in either series (e.g., manually jumping to `003`) naturally elevates `maxSeq` so the next auto-suggested number continues from `004`.
2. Wire up the invoice type switcher (`Standard (18% GST)` vs `Taxless (0% GST)`) in `Invoices.jsx` to dynamically re-populate the suggested invoice number when toggling types.
3. Remove HSN/SAC column header and input field from both desktop grid and mobile card views in `Invoices.jsx` whenever `invoiceType === 'taxless'`. Rebalance grid columns to show Name (Description), Qty, Rate (Price), and Amount.
4. Remove HSN/SAC column header and input field from `Quotations.jsx` whenever `quoteType === 'taxless'`. Rebalance grid columns to show Name, Qty, Rate, and Amount.
5. Update `shapio/server/lib/pdfTemplate.js` in both `TaxlessInvoiceTemplate` and `TaxlessQuotationTemplate` to completely eliminate the HSN/SAC column, re-distributing column widths so the PDF table cleanly presents `#`, `Item & Description`, `Qty`, `Rate`, and `Amount`.

**Tech Stack:**
- Frontend: React 19, Tailwind CSS v4, @tanstack/react-query, Lucide React
- Backend: Node.js, Express, Prisma ORM, PostgreSQL (Supabase)
- PDF Engine: @react-pdf/renderer

---

### Task 1: Update Invoice Number Generation Logic with Dynamic Continuation

**Files:**
- Modify: `shapio/admin/src/pages/Invoices.jsx:34-50, 80-93, 230-250`

**Step 1: Write helper function to identify invoice type and compute max sequence per series**

```javascript
const isInvoiceTaxless = (inv) => {
  const invNo = String(inv.invoiceNumber || inv.invoiceNo || '');
  if (invNo.includes('-TL/') || invNo.includes('/TL/') || invNo.startsWith('TL-') || invNo.startsWith('TL/')) {
    return true;
  }
  const cgst = Number(inv.cgstAmount || 0);
  const sgst = Number(inv.sgstAmount || 0);
  const total = Number(inv.total || inv.totalAmount || 0);
  if (cgst === 0 && sgst === 0 && total > 0) return true;
  if (inv.items && inv.items.length > 0) {
    return inv.items.every(i => Number(i.cgstRatePct ?? 9) === 0 && Number(i.sgstRatePct ?? 9) === 0);
  }
  return false;
};

const getNextInvoiceNumber = (invoicesList, type = 'taxed') => {
  const currentFY = getFinancialYearString();
  let maxSeq = 0;
  
  (invoicesList || []).forEach(inv => {
    const invIsTaxless = isInvoiceTaxless(inv);
    if ((type === 'taxless' && invIsTaxless) || (type === 'taxed' && !invIsTaxless)) {
      const raw = String(inv.invoiceNumber || inv.invoiceNo || '').trim();
      const match = raw.match(/(\d+)(?:\D*)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  });

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(3, '0');
  
  if (type === 'taxless') {
    return `SHP3D-TL/${currentFY}/${seqStr}`;
  }
  return `SHP3D/${currentFY}/${seqStr}`;
};
```
*Note on manual entry continuity*: If a user manually changes a taxless invoice number to `SHP3D-TL/26-27/003`, when saved to the database, `inv.invoiceNumber` contains `003`. Next time `getNextInvoiceNumber(..., 'taxless')` runs, `maxSeq` will detect `3` and compute `nextSeq = 4` (`SHP3D-TL/26-27/004`).

**Step 2: Connect the toggle switcher to update the invoice number**
In `handleToggleInvoiceType(type)`:
```javascript
const handleToggleInvoiceType = (type) => {
  setInvoiceType(type);
  setForm(f => {
    // Check if the current invoice number looks like an auto-generated one from the other series
    const nextForType = getNextInvoiceNumber(invoices, type);
    return {
      ...f,
      invoiceNumber: nextForType,
      items: f.items.map(item => ({
        ...item,
        cgstRatePct: type === 'taxless' ? 0 : 9,
        sgstRatePct: type === 'taxless' ? 0 : 9,
        hsnSac: type === 'taxless' ? '' : item.hsnSac
      }))
    };
  });
};
```
- In `openNew()`:
  Default `invoiceNumber: getNextInvoiceNumber(invoices, 'taxed')`.

---

### Task 2: Remove HSN/SAC from Taxless Invoices in Admin UI

**Files:**
- Modify: `shapio/admin/src/pages/Invoices.jsx:650-715`

**Step 1: Desktop Table Headers**
- When `invoiceType === 'taxless'`:
  - `Description`: `col-span-6`
  - (HSN/SAC header hidden)
  - `Qty`: `col-span-2 text-center`
  - `Rate (₹)`: `col-span-2 text-right`
  - `Amount (₹)`: `col-span-2 text-right pr-10`
- When `invoiceType === 'taxed'`:
  - Render existing 12-column grid including HSN/SAC.

**Step 2: Desktop Row Inputs**
- When `invoiceType === 'taxless'`:
  - Description input: `col-span-6`
  - Hide HSN/SAC `<input>` completely.
  - Qty: `col-span-2`
  - Rate: `col-span-2`
  - Amount preview: `col-span-2 pr-10`

**Step 3: Mobile Card View**
- When `invoiceType === 'taxless'`:
  - Hide the HSN/SAC input field entirely.

---

### Task 3: Remove HSN/SAC from Taxless Quotations in Admin UI

**Files:**
- Modify: `shapio/admin/src/pages/Quotations.jsx:48-58, 435-495`

**Step 1: Clean item state on Quote Type Switcher**
- In `handleToggleQuoteType(type)`:
  If `type === 'taxless'`, set `hsnSac: ''` on all items in addition to setting 0% tax.

**Step 2: Desktop Table Headers**
- When `quoteType === 'taxless'`:
  - `Item & Description`: `col-span-6`
  - (HSN/SAC header hidden)
  - `Qty`: `col-span-2 text-center`
  - `Rate (₹)`: `col-span-2 text-right`
  - `Amount (₹)`: `col-span-2 text-right pr-6`
- When `quoteType === 'taxed'`:
  - Render existing columns with HSN/SAC.

**Step 3: Desktop Row Inputs**
- When `quoteType === 'taxless'`:
  - Description input: `col-span-6`
  - Hide HSN/SAC `<input>` completely.
  - Qty: `col-span-2`
  - Rate: `col-span-2`
  - Amount preview: `col-span-2`

**Step 4: Mobile Card View**
- When `quoteType === 'taxless'`:
  - Hide the HSN/SAC input field.

---

### Task 4: Remove HSN/SAC from Taxless Invoices and Quotations in PDF Template

**Files:**
- Modify: `shapio/server/lib/pdfTemplate.js:84-91, 500-521, 895-920`

**Step 1: Update Taxless Column Widths in `styles`**
```javascript
// Taxless Table Columns (No HSN, No CGST/SGST)
colNoTaxless: { width: '5%' },
colDescTaxless: { width: '55%', textAlign: 'left' },
colQtyTaxless: { width: '12%', textAlign: 'center' },
colRateTaxless: { width: '14%', textAlign: 'right' },
colAmountTaxless: { width: '14%', textAlign: 'right', borderRight: 'none' },
```

**Step 2: Update `TaxlessInvoiceTemplate`**
- In `tableHeader`:
  - Remove `<View style={[styles.thCell, styles.colHsnTaxless]}>HSN/SAC</View>`
  - Retain only `#`, `Item & Description`, `Qty`, `Rate`, `Amount`.
- In `tableRow`:
  - Remove `<Text style={[styles.tdCell, styles.colHsnTaxless]}>{item.hsnSac || '-'}</Text>`
  - Retain only `#`, `Item & Description`, `Qty`, `Rate`, `Amount`.

**Step 3: Update `TaxlessQuotationTemplate`**
- In `tableHeader`:
  - Remove `<View style={[styles.thCell, styles.colHsnTaxless]}>HSN/SAC</View>`
  - Retain only `#`, `Item & Description`, `Qty`, `Rate`, `Amount`.
- In `tableRow`:
  - Remove `<Text style={[styles.tdCell, styles.colHsnTaxless]}>{item.hsnSac || '-'}</Text>`
  - Retain only `#`, `Item & Description`, `Qty`, `Rate`, `Amount`.

---

### Task 5: Add Invoice Series Badge in Admin Invoices List

**Files:**
- Modify: `shapio/admin/src/pages/Invoices.jsx:870-930, 945-990`

**Step 1: Add Badge in Table & Mobile Card**
- Next to `inv.invoiceNumber`:
  - If taxless: render `<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Taxless</span>`
  - If taxed: render `<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Standard</span>`

---

### Task 6: Testing & Verification

**Step 1: Test Sequence Isolation and Manual Jump Continuity**
- Verify current taxed sequence suggestions (`SHP3D/26-27/051`).
- Switch to Taxless -> verify suggestions starts at `SHP3D-TL/26-27/001`.
- Simulate manual jump: Enter `SHP3D-TL/26-27/003`.
- Verify next taxless calculation returns `SHP3D-TL/26-27/004`.
- Switch back to Taxed -> verify sequence is still `SHP3D/26-27/051`.

**Step 2: Test Taxless Invoice UI & PDF**
- Verify HSN/SAC is hidden in form (both desktop & mobile).
- Verify preview and downloaded PDF has only 5 columns: `#`, `Item & Description`, `Qty`, `Rate`, `Amount`.

**Step 3: Test Taxless Quotation UI & PDF**
- Switch quotation type to Taxless -> verify HSN/SAC is hidden in form.
- Verify preview and downloaded quotation PDF has only 5 columns: `#`, `Item & Description`, `Qty`, `Rate`, `Amount`.
- Import taxless quotation into invoice -> verify it imports as taxless without HSN.
