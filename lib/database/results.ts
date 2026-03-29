function getSupabase() {
  return require('@/lib/supabase/client').supabase;
}

export async function storeAssessmentResult(result: Record<string, unknown>) {
  const response = await getSupabase()
    .from('assessment_results')
    .insert(result)
    .select()
    .single();

  if (response?.error) {
    throw new Error(response.error.message);
  }

  return response.data;
}

export async function getAssessmentResult(assessmentId: string) {
  const query = getSupabase().from('assessment_results').select('*');
  query.eq('assessment_id', assessmentId);
  const result = await query.single();

  if (result?.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
