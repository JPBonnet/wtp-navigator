export interface CheckoutSession {
  id: string;
  sessionId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  createdAt: Date;
}

export interface License {
  id: string;
  userId: string;
  expiresAt: Date;
  active: boolean;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  license?: License;
}
