import { supabase } from '@/lib/supabase/client';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  return data.user!;
}

export async function logIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  return data.session!;
}

export async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function signInWithMagicLink(token: string) {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}
