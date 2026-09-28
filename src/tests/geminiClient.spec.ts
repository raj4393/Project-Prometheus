import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateBlueprint } from '../infrastructure/ai/geminiClient';
import { TimeFrame, AmbitionLevel } from '../domain/contracts/student.contract';
import type { StudentProfile } from '../domain/contracts/student.contract';

const mockProfile: StudentProfile = {
  studentName: 'Test Student',
  skills: [],
  domains: [],
  timeFrame: TimeFrame.TwelveWeeks,
  ambition: AmbitionLevel.Ambitious,
  teamSize: 1,
};

describe('geminiClient', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('falls back to deterministic engine when the server returns 500', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await generateBlueprint(mockProfile);
    expect(result.source).toBe('fallback');
    expect(result.blueprint.title).toBeDefined();
  });

  it('falls back to deterministic engine on timeout', async () => {
    globalThis.fetch = vi.fn().mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AbortError')), 50);
      });
    });

    const result = await generateBlueprint(mockProfile);
    expect(result.source).toBe('fallback');
    expect(result.blueprint.title).toBeDefined();
  });
});
