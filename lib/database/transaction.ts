function getSupabase() {
  return require('@/lib/supabase/client').supabase;
}

export interface TransactionContext {
  insert: (table: string, data: Record<string, unknown>) => Promise<void>;
}

export async function withTransaction<T>(
  callback: (tx: TransactionContext) => Promise<T>,
): Promise<T> {
  const tx: TransactionContext = {
    insert: async (table: string, data: Record<string, unknown>) => {
      const result = await getSupabase().from(table).insert(data);
      if (result?.error) {
        throw new Error(result.error.message);
      }
    },
  };

  try {
    const result = await callback(tx);
    return result;
  } catch (error) {
    throw error;
  }
}
