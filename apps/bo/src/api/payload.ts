/**
 * The API runs a global ValidationPipe with `forbidNonWhitelisted: true`, so a
 * request is rejected outright if it carries any property the DTO doesn't
 * declare. Edit forms are populated straight from a fetched document, which
 * also contains server-managed fields (`_id`, `__v`, `isDeleted`, timestamps) —
 * sending those back produces a 400.
 *
 * Blank optionals are dropped too: an empty string fails validators like
 * `@IsEmail()`, which only run when the property is present.
 *
 * `clearableKeys` opt out of that last rule. Image URL fields must be able to
 * send `''`, otherwise clicking Remove drops the key and the API keeps the old
 * value — the image looks un-removable.
 */
export function buildPayload<T extends object>(
  source: Record<string, unknown>,
  allowedKeys: readonly (keyof T)[],
  clearableKeys: readonly (keyof T)[] = [],
): Partial<T> {
  const payload: Record<string, unknown> = {};

  for (const key of allowedKeys) {
    const value = source[key as string];
    if (value === undefined || value === null) continue;
    if (typeof value !== 'string') {
      payload[key as string] = value;
      continue;
    }
    const trimmed = value.trim();
    if (trimmed === '' && !clearableKeys.includes(key)) continue;
    payload[key as string] = trimmed;
  }

  return payload as Partial<T>;
}
