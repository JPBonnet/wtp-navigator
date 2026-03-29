function getSupabase() {
  return require('@/lib/supabase/client').supabase;
}

export async function insertResponse(
  assessmentId: string,
  questionId: string,
  value: string,
) {
  const result = await getSupabase()
    .from('responses')
    .insert({ assessmentId, questionId, value })
    .select()
    .single();

  if (result?.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function updateResponse(id: string, value: string) {
  const query = getSupabase().from('responses').update({ value });
  query.eq('id', id);
  const result = await query.select().single();

  if (result?.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function getResponsesByAssessment(assessmentId: string) {
  const result = await getSupabase()
    .from('responses')
    .select('*')
    .eq('assessment_id', assessmentId);

  if (result?.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}
