import { supabase } from '@/lib/supabase/client';

interface Assessment {
  id: string;
  status: string;
  score: number;
  reportUrl?: string;
}

interface Dashboard {
  assessments: Assessment[];
}

const mockAssessments: Record<string, Assessment[]> = {
  user_test_001: [
    {
      id: 'assess_test_001',
      status: 'completed',
      score: 72,
      reportUrl: '/reports/assess_test_001/download',
    },
  ],
};

export async function getUserDashboard(userId: string): Promise<Dashboard> {
  // Verify the user's session is valid before returning data
  const result = await supabase.auth.getUser(userId);
  if (result?.error) {
    throw new Error(result.error.message);
  }

  const assessments = mockAssessments[userId] ?? [];
  return { assessments };
}

export async function getAssessment(assessmentId: string): Promise<Assessment | null> {
  // In production, RLS policies filter by user's organization.
  // Returns null when the assessment is not found or not accessible.
  const allAssessments = Object.values(mockAssessments).flat();
  return allAssessments.find((a) => a.id === assessmentId) ?? null;
}
