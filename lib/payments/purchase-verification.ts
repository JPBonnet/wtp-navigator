interface Purchase {
  productType: string;
  status: string;
  sessionId: string;
  completedAt: Date;
}

const purchaseStore: Map<string, Purchase[]> = new Map();

export function addPurchase(userId: string, purchase: Purchase) {
  const existing = purchaseStore.get(userId) || [];
  existing.push(purchase);
  purchaseStore.set(userId, existing);
}

export async function getUserPurchases(userId: string): Promise<Purchase[]> {
  return purchaseStore.get(userId) || [];
}

export async function verifyUserPurchase(userId: string, productType: string): Promise<boolean> {
  const purchases = purchaseStore.get(userId) || [];
  return purchases.some(
    (p) => p.productType === productType && p.status === 'completed'
  );
}

export function resetPurchaseStore() {
  purchaseStore.clear();
}
