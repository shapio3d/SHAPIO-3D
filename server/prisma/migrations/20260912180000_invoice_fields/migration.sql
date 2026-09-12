-- Keep the production invoice tables aligned with the fields used by the API.
-- IF NOT EXISTS makes this safe for databases where a column was added manually.
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "terms" TEXT DEFAULT 'Due on Receipt';
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "panNo" TEXT;

ALTER TABLE "InvoiceItem" ADD COLUMN IF NOT EXISTS "cgstRatePct" DOUBLE PRECISION DEFAULT 9;
ALTER TABLE "InvoiceItem" ADD COLUMN IF NOT EXISTS "sgstRatePct" DOUBLE PRECISION DEFAULT 9;

UPDATE "Invoice" SET "terms" = 'Due on Receipt' WHERE "terms" IS NULL;
UPDATE "InvoiceItem" SET "cgstRatePct" = 9 WHERE "cgstRatePct" IS NULL;
UPDATE "InvoiceItem" SET "sgstRatePct" = 9 WHERE "sgstRatePct" IS NULL;