// Very small sanitizer for raw text: trim, strip control chars, minimal html escape.
export function sanitize(raw: string) {
  if (!raw || typeof raw !== 'string') return { valid: false };
  const text = raw.replace(/\p{C}/gu, '').trim(); // remove control chars
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const valid = escaped.length > 10; // domain rule
  return { valid, text: escaped };
}
