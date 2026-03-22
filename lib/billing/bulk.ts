import { initializeStripe } from '../stripe';

export interface BulkQuote {
  id: string;
  quantity: number;
  unitPriceCents: number;
  discountPercent: number;
  totalCents: number;
  validUntil: Date;
}

export interface BulkPurchase {
  id: string;
  quoteId: string;
  customerId: string;
  quantity: number;
  totalCents: number;
  licenseKeys: string[];
  status: 'completed' | 'pending' | 'failed';
}

const BASE_PRICE_CENTS = 99900; // €999.00 per license

function getDiscountPercent(quantity: number): number {
  if (quantity >= 100) return 30;
  if (quantity >= 50) return 20;
  if (quantity >= 20) return 15;
  if (quantity >= 10) return 10;
  if (quantity >= 5) return 5;
  return 0;
}

export function generateBulkQuote(quantity: number): BulkQuote {
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  const discountPercent = getDiscountPercent(quantity);
  const unitPriceCents = Math.round(BASE_PRICE_CENTS * (1 - discountPercent / 100));
  const totalCents = unitPriceCents * quantity;
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  return {
    id: `quote_${Date.now()}`,
    quantity,
    unitPriceCents,
    discountPercent,
    totalCents,
    validUntil,
  };
}

export async function createBulkPurchase(
  customerId: string,
  quote: BulkQuote
): Promise<BulkPurchase> {
  const stripe = initializeStripe();

  await stripe.paymentIntents.create({
    amount: quote.totalCents,
    currency: 'eur',
    customer: customerId,
    metadata: {
      quoteId: quote.id,
      quantity: String(quote.quantity),
      type: 'bulk_purchase',
    },
  });

  const licenseKeys = Array.from({ length: quote.quantity }, (_, i) =>
    `lic_bulk_${Date.now()}_${i}`
  );

  return {
    id: `bulk_${Date.now()}`,
    quoteId: quote.id,
    customerId,
    quantity: quote.quantity,
    totalCents: quote.totalCents,
    licenseKeys,
    status: 'completed',
  };
}
