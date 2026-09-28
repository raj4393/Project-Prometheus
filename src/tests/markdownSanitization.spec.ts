import { describe, it, expect } from 'vitest';
import DOMPurify from 'dompurify';

describe('Markdown Sanitization (DOMPurify)', () => {
  it('strips <script> tags safely', () => {
    const dirty = '<script>alert("XSS")</script><h1>Title</h1>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<h1>Title</h1>');
  });

  it('strips onerror payloads safely', () => {
    const dirty = '<img src="x" onerror="alert(1)">';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('onerror');
    expect(clean).toContain('<img src="x">');
  });
});
