import { initializeStripe } from '../stripe';

export interface Invoice {
  id: string;
  customerId: string;
  amountCents: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  createdAt: Date;
  lines: InvoiceLine[];
}

export interface InvoiceLine {
  description: string;
  amountCents: number;
  quantity: number;
}

export async function listInvoices(customerId: string): Promise<Invoice[]> {
  const stripe = initializeStripe();
  const result = await stripe.invoices.list({
    customer: customerId,
    limit: 100,
  });

  return result.data.map(mapInvoice);
}

export async function getInvoicePdf(invoiceId: string): Promise<{ url: string }> {
  const stripe = initializeStripe();
  const invoice = await stripe.invoices.retrieve(invoiceId);

  if (!invoice.invoice_pdf) {
    throw new Error('Invoice PDF not available');
  }

  return { url: invoice.invoice_pdf };
}

export async function emailInvoice(invoiceId: string): Promise<{ sent: boolean }> {
  const stripe = initializeStripe();
  await stripe.invoices.sendInvoice(invoiceId);
  return { sent: true };
}

function mapInvoice(inv: any): Invoice {
  return {
    id: inv.id,
    customerId: inv.customer as string,
    amountCents: inv.amount_due,
    currency: inv.currency,
    status: inv.status,
    pdfUrl: inv.invoice_pdf || null,
    createdAt: new Date(inv.created * 1000),
    lines: (inv.lines?.data || []).map((line: any) => ({
      description: line.description || '',
      amountCents: line.amount,
      quantity: line.quantity || 1,
    })),
  };
}
