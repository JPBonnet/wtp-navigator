export interface User {
  id: string;
  email: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'advisor' | 'viewer';
  created_at: string;
}

export interface Assessment {
  id: string;
  pensionSetupId: string;
  organizationId: string;
  riskScore: number;
  gaps: AssessmentGap[];
  recommendations: AssessmentRecommendation[];
  createdBy: string;
  created_at: string;
  status?: string;
}

export interface AssessmentGap {
  category: string;
  severity: string;
  name?: string;
  suggestion?: string;
}

export interface AssessmentRecommendation {
  action: string;
  priority: string;
}

export interface QuestionnaireResponse {
  id: string;
  assessmentId: string;
  questionId: string;
  value: string;
}

export interface AssessmentResult {
  id?: string;
  assessmentId: string;
  pensionSetupId: string;
  overallScore: number;
  status: 'PARTIAL' | 'COMPLETE';
  gaps: AssessmentGap[];
  completedAt: Date;
}

export interface License {
  id: string;
  userId: string;
  expiresAt: string;
  active: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  userId: string;
  stripeSessionId: string;
  amountCents: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}
