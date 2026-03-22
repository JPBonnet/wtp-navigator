import { addPurchase } from './purchase-verification';

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}

interface WebhookResult {
  success: boolean;
  action: string;
  error?: string;
}

interface WebhookLog {
  eventId: string;
  eventType: string;
  processedAt: Date;
}

const webhookLogs: WebhookLog[] = [];

export async function handleStripeWebhook(event: StripeEvent): Promise<WebhookResult> {
  try {
    if (!event?.id || !event?.type || !event?.data) {
      throw new Error('Malformed webhook event');
    }

    webhookLogs.push({
      eventId: event.id,
      eventType: event.type,
      processedAt: new Date(),
    });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata as { userId?: string; productType?: string } | undefined;

      if (metadata?.userId && metadata?.productType) {
        addPurchase(metadata.userId, {
          productType: metadata.productType,
          status: 'completed',
          sessionId: session.id as string,
          completedAt: new Date(),
        });
      }

      return { success: true, action: 'grant_assessment_access' };
    }

    return { success: true, action: 'ignored' };
  } catch (error) {
    return {
      success: false,
      action: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getWebhookLogs(): Promise<WebhookLog[]> {
  return [...webhookLogs];
}

export function resetWebhookState() {
  webhookLogs.length = 0;
}
