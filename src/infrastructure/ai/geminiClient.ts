import type { StudentProfile } from '../../domain/contracts/student.contract';
import type { BlueprintContract } from '../../domain/contracts/blueprint.contract';
import { synthesizeProject } from './deterministicFallback';
import { startMeasure, endMeasure } from '../../core/telemetry/performance';

/**
 * Result of a Gemini API synthesis attempt, indicating the source
 * of the generated blueprint (API or fallback).
 */
export interface SynthesisResult {
  readonly blueprint: BlueprintContract;
  readonly source: 'gemini' | 'fallback';
  readonly latencyMs: number;
}

/**
 * Executes a high-velocity synthesis request against our internal Vercel API.
 */
export async function generateBlueprint(profile: StudentProfile): Promise<SynthesisResult> {
  const startTime = Date.now();
  const perfIndex = startMeasure('gemini_generation');

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 20000) as unknown as number;

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
      signal: abortController.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const parsed: BlueprintContract = await response.json();

    if (!parsed || typeof parsed.title !== 'string' || typeof parsed.abstract !== 'string' ||
        typeof parsed.feasibilityScore !== 'number' ||
        !Array.isArray(parsed.techStack) || !Array.isArray(parsed.features)) {
      throw new Error('Invalid schema received from server');
    }

    endMeasure(perfIndex);
    return {
      blueprint: parsed,
      latencyMs: Date.now() - startTime,
      source: 'gemini',
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Gemini API Error, falling back to deterministic synthesis:', error);
    const fallback = synthesizeProject(profile);
    endMeasure(perfIndex);
    return {
      blueprint: fallback,
      latencyMs: Date.now() - startTime,
      source: 'fallback',
    };
  }
}
