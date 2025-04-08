import DOMPurify from 'dompurify';

/**
 * Sanitize any user input or dynamic content before rendering or processing.
 * @param {string} dirty - The potentially unsafe input string.
 * @returns {string} - The sanitized, safe string.
 */
export function sanitize(dirty) {
  if (typeof dirty !== 'string') {
    console.warn('sanitize() expected a string, but got:', typeof dirty);
    return '';
  }

  return DOMPurify.sanitize(dirty);
}