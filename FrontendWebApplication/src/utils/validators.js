const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * PUBLIC_INTERFACE
 * Validate email format
 */
export function isValidEmail(email) {
  /** Returns true if email seems valid. */
  return EMAIL_REGEX.test(String(email || '').trim());
}

/**
 * PUBLIC_INTERFACE
 * Check password strength
 */
export function getPasswordStrength(password) {
  /**
   * Returns a score 0-4 and a label: weak, fair, good, strong, very-strong
   * Criteria: length, lowercase, uppercase, number, special
   */
  const pwd = String(password || '');
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ['weak', 'fair', 'good', 'strong', 'very-strong'];
  const idx = Math.max(0, Math.min(labels.length - 1, score - 1));
  return { score, label: labels[idx] };
}

/**
 * PUBLIC_INTERFACE
 * Validate password meets minimal requirements
 */
export function isStrongEnough(password) {
  /** Minimum: 8 chars, includes lowercase and number */
  const pwd = String(password || '');
  return pwd.length >= 8 && /[a-z]/.test(pwd) && /\d/.test(pwd);
}
