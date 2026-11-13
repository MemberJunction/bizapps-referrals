const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class InvalidUUIDError extends Error {
  public readonly FieldName: string;
  constructor(fieldName: string, value: string) {
    super(`Invalid UUID for '${fieldName}': '${value}'.`);
    this.name = 'InvalidUUIDError';
    this.FieldName = fieldName;
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ConflictScreeningUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictScreeningUnavailableError';
  }
}

export class InvalidLifecycleStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidLifecycleStateError';
  }
}

export class PersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PersistenceError';
  }
}

export class ConcurrencyConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConcurrencyConflictError';
  }
}

/**
 * Validates that `value` is a well-formed RFC 4122 UUID before it is used in
 * any RunView ExtraFilter or entity lookup. Throws {@link InvalidUUIDError} otherwise.
 */
export function AssertValidUUID(value: string | null | undefined, fieldName: string): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!UUID_REGEX.test(trimmed)) {
    throw new InvalidUUIDError(fieldName, String(value ?? ''));
  }
  return trimmed;
}

/**
 * Case-insensitive, whitespace-trimmed UUID equality check.
 */
export function UUIDsEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) {
    return false;
  }
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
