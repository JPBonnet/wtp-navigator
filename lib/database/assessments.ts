function getSupabase() {
  return require('@/lib/supabase/client').supabase;
}

interface CreateAssessmentInput {
  pensionSetupId: string;
  organizationId: string;
  riskScore: number;
  gaps: Array<{ category: string; severity: string }>;
  recommendations: Array<{ action: string; priority: string }>;
  createdBy: string;
}

export async function createAssessment(input: CreateAssessmentInput) {
  const result = await getSupabase()
    .from('assessments')
    .insert(input)
    .select()
    .single();

  if (result?.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function getAssessmentById(id: string) {
  const query = getSupabase().from('assessments').select('*');
  query.eq('id', id);
  const result = await query.single();

  if (result?.error) {
    throw new Error(result.error.message);
  }

  if (!result || !result.data) {
    return null;
  }

  return result.data;
}

export async function getAssessmentsByOrganization(organizationId: string) {
  const result = await getSupabase()
    .from('assessments')
    .select('*')
    .eq('organization_id', organizationId);

  if (result?.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}

export async function updateAssessmentStatus(id: string, status: string) {
  const query = getSupabase().from('assessments').update({ status });
  query.eq('id', id);
  const result = await query.select().single();

  if (result?.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
