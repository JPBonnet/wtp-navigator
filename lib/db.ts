const store: Record<string, Record<string, unknown>> = {};

export const db = {
  async save(table: string, data: Record<string, unknown>) {
    const id = data.id || `${table}_${Date.now()}`;
    store[`${table}:${id}`] = { ...data, id };
    return { ...data, id };
  },
  async get(table: string, id: string) {
    return store[`${table}:${id}`] || null;
  },
};
