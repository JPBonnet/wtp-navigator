import { initializeStripe } from '../stripe';

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  createdAt: Date;
}

export async function savePaymentMethod(
  customerId: string,
  paymentMethodId: string,
  setDefault = false
): Promise<PaymentMethod> {
  const stripe = initializeStripe();

  const pm = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  if (setDefault) {
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }

  return mapPaymentMethod(pm, setDefault);
}

export async function listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
  const stripe = initializeStripe();

  const customer = await stripe.customers.retrieve(customerId) as any;
  const defaultPmId = customer.invoice_settings?.default_payment_method;

  const result = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });

  return result.data.map((pm) => mapPaymentMethod(pm, pm.id === defaultPmId));
}

export async function deletePaymentMethod(paymentMethodId: string): Promise<{ deleted: boolean }> {
  const stripe = initializeStripe();
  await stripe.paymentMethods.detach(paymentMethodId);
  return { deleted: true };
}

function mapPaymentMethod(pm: any, isDefault: boolean): PaymentMethod {
  return {
    id: pm.id,
    type: pm.type,
    card: pm.card
      ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        }
      : undefined,
    isDefault,
    createdAt: new Date(pm.created * 1000),
  };
}
