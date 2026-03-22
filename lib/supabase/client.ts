export const supabase: any = {
  auth: {
    getUser: async (token: string) => {
      throw new Error('Supabase client not configured');
    },
  },
};
