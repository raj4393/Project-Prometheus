import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../core/security/sanitize';

describe('escapeHtml', () => {
  it('escapes html entities', () => {
    expect(escapeHtml('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    expect(escapeHtml('O\'Brien & Co.')).toBe('O&#39;Brien &amp; Co.');
    expect(escapeHtml('AI/ML')).toBe('AI/ML');
  });
});
