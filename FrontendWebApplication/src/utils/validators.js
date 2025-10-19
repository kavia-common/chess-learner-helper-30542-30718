//
// PUBLIC_INTERFACE
export function isValidEmail(email) {
  /** Basic email format validation. */
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Simple RFC5322-like check
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(trimmed);
}

// PUBLIC_INTERFACE
export function checkPasswordStrength(password) {
  /**
   * Returns an object { valid: boolean, errors: string[] }
   * Rules:
   *  - min length 8
   *  - at least one letter
   *  - at least one number
   */
  const errors = [];
  if (typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }
  if (!/[A-Za-z]/.test(password)) {
    errors.push('Password must include at least one letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must include at least one number.');
  }
  return { valid: errors.length === 0, errors };
}

// PUBLIC_INTERFACE
export function required(value) {
  /** Check that a value is present and non-empty. */
  return value !== undefined && value !== null && String(value).trim().length > 0;
}
