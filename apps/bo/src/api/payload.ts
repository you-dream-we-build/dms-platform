/**
 * The API runs a global ValidationPipe with `forbidNonWhitelisted: true`, so a
 * request is rejected outright if it carries any property the DTO doesn't
 * declare. Edit forms are populated straight from a fetched document, which
 * also contains server-managed fields (`_id`, `__v`, `isDeleted`, timestamps) —
 * sending those back produces a 400.
 *
 * Blank optionals are dropped too: an empty string fails validators like
 * `@IsEmail()`, which only run when the property is present.
 */
export function buildPayload<T extends object>(
  source: Record<string, unknown>,
  allowedKeys: readonly (keyof T)[],
): Partial<T> {
  const payload: Record<string, unknown> = {};

  for (const key of allowedKeys) {
    const value = source[key as string];
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    payload[key as string] = typeof value === 'string' ? value.trim() : value;
  }

  return payload as Partial<T>;
}
