-- Add missing columns to Invoice table for existing rows
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "invoiceNo" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "customerId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT NOW();

-- Set defaults on the existing row so NOT NULL constraints can be applied
UPDATE "Invoice" SET "invoiceNo" = 'INV-LEGACY-001' WHERE "invoiceNo" IS NULL;
UPDATE "Invoice" SET "customerId" = (SELECT id FROM "Customer" LIMIT 1) WHERE "customerId" IS NULL;
UPDATE "Invoice" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL;

-- Now make them NOT NULL
ALTER TABLE "Invoice" ALTER COLUMN "invoiceNo" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "customerId" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Add unique constraint if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_invoiceNo_key') THEN
    ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_invoiceNo_key" UNIQUE ("invoiceNo");
  END IF;
END $$;

-- Add FK if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_customerId_fkey') THEN
    ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
