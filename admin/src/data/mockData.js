// All data is now fetched from Supabase directly.
// This file is kept only if any legacy components still import it, but it should be empty.

export const MOCK_CUSTOMERS = []
export const MOCK_INVOICES = []
export const MOCK_QUOTATIONS = []
export const MOCK_PRODUCTS = []
export const MOCK_STATS = {
  totalRevenue: 0,
  pendingInvoices: 0,
  totalCustomers: 0,
  totalProducts: 0,
  monthlyRevenue: [],
  invoicesByStatus: [],
}
