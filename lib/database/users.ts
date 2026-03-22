function getSupabase() {
  return require('@/lib/supabase/client').supabase;
}

interface CreateUserInput {
  email: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'advisor' | 'viewer';
}

export async function createUser(input: CreateUserInput) {
  const result = await getSupabase()
    .from('users')
    .insert(input)
    .select()
    .single();

  if (result?.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function getUserById(id: string) {
  const query = getSupabase().from('users').select('*');
  query.eq('id', id);
  const result = (await query.maybeSingle()) ?? (await query.single());

  if (result?.error) {
    throw new Error(result.error.message);
  }

  if (!result || !result.data) {
    return null;
  }

  return result.data;
}

export async function getUserByEmail(email: string) {
  const query = getSupabase().from('users').select('*');
  query.eq('email', email);
  const result = await query.single();

  if (result?.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
