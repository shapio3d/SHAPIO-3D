CREATE TYPE "InvoiceStatus" AS ENUM ('PAID', 'UNPAID', 'PARTIALLY_PAID', 'OVERDUE');

CREATE TABLE "Client" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "billAddress" TEXT NOT NULL,
  "defaultShipAddress" TEXT,
  "gstNumber" TEXT,
  "phone" TEXT,
  "email" TEXT,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "issueDate" TIMESTAMP(3) NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "terms" TEXT NOT NULL DEFAULT 'Due on Receipt',
  "placeOfSupply" TEXT NOT NULL,
  "panNo" TEXT,
  "shipAddress" TEXT NOT NULL,
  "subtotal" DECIMAL(10,2) NOT NULL,
  "cgstAmount" DECIMAL(10,2) NOT NULL,
  "sgstAmount" DECIMAL(10,2) NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "balanceDue" DECIMAL(10,2) NOT NULL,
  "status" "InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "InvoiceItem" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "hsnSac" TEXT NOT NULL,
  "quantity" DECIMAL(10,2) NOT NULL,
  "rate" DECIMAL(10,2) NOT NULL,
  "cgstRatePct" DECIMAL(10,2) NOT NULL DEFAULT 9,
  "cgstAmount" DECIMAL(10,2) NOT NULL,
  "sgstRatePct" DECIMAL(10,2) NOT NULL DEFAULT 9,
  "sgstAmount" DECIMAL(10,2) NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enforce RLS by blocking all direct client access (anon and authenticated)
-- The backend will use the Service Role Key to bypass RLS.
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceItem" ENABLE ROW LEVEL SECURITY;

-- No policies are created for anon/authenticated, which means default-deny for those roles.
