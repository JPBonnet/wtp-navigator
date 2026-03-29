import { supabase } from '@/lib/supabase/client';

interface ValidationSchema {
  required?: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateRequest(
  body: Record<string, unknown>,
  schema: ValidationSchema
): ValidationResult {
  const errors: string[] = [];

  if (schema.required) {
    for (const field of schema.required) {
      if (body[field] === undefined || body[field] === null) {
        errors.push(`${field} is required`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function requireAuth(req: any, res: any): Promise<any> {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  const token = authHeader.replace('Bearer ', '');

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    res.status(401).json({ error: error?.message || 'Invalid token' });
    return null;
  }

  return data.user;
}

export async function requireOrganization(user: any, res: any): Promise<any> {
  if (!user.organizationId) {
    res.status(403).json({ error: 'Organization membership required' });
    return null;
  }

  return user.organizationId;
}
