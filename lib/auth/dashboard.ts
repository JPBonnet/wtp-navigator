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
  const assessments = mockAssessments[userId] ?? [];
  return { assessments };
}

export async function getAssessment(assessmentId: string): Promise<Assessment> {
  return {
    id: assessmentId,
    status: 'completed',
    score: 72,
    reportUrl: `/reports/${assessmentId}/download`,
  };
}
