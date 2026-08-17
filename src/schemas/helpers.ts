import { z } from 'zod';

export function extractErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  error.issues.forEach((e) => {
    const field = e.path[0] as string;
    if (!fieldErrors[field]) fieldErrors[field] = e.message;
  });
  return fieldErrors;
}
