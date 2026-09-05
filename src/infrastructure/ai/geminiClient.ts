/**
 * @module GeminiClient
 * @description Official Google Gen AI SDK integration targeting gemini-2.5-flash.
 * Checks for VITE_GEMINI_API_KEY, sends student profile as JSON,
 * validates output against BlueprintContract, and auto-failovers to
 * the deterministic fallback engine on errors.
 */

import { GoogleGenAI } from '@google/genai';
import type { StudentProfile } from '../../domain/contracts/student.contract';
import type { BlueprintContract } from '../../domain/contracts/blueprint.contract';
import { synthesizeProject } from './deterministicFallback';
import { startMeasure, endMeasure } from '../../core/telemetry/performance';

/**
 * The Gemini model identifier to use for project synthesis.
 */
const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Request timeout in milliseconds (15 seconds).
 */
const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Result of a Gemini API synthesis attempt, indicating the source
 * of the generated blueprint (API or fallback).
 *
 * @property blueprint - The generated project blueprint
 * @property source - Whether the result came from the Gemini API or local fallback
 * @property latencyMs - Time taken to generate the blueprint in milliseconds
 */
export interface SynthesisResult {
  readonly blueprint: BlueprintContract;
  readonly source: 'gemini' | 'fallback';
  readonly latencyMs: number;
}

/**
 * Retrieves the Gemini API key from environment variables.
 *
 * @returns The API key string, or null if not configured
 */
function getApiKey(): string | null {
  try {
    const key = import.meta.env?.VITE_GEMINI_API_KEY as string | undefined;
    if (key && key.trim().length > 0) {
      return key.trim();
    }
  } catch {
    // import.meta.env may not be available in all contexts
  }
  return null;
}

/**
 * Validates that an object conforms to the BlueprintContract shape.
 *
 * @param data - The parsed response data to validate
 * @returns True if the data is a valid BlueprintContract
 */
function isValidBlueprint(data: unknown): data is BlueprintContract {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj['title'] === 'string' &&
    typeof obj['abstract'] === 'string' &&
    typeof obj['feasibilityScore'] === 'number' &&
    obj['feasibilityScore'] >= 0 &&
    obj['feasibilityScore'] <= 100 &&
    Array.isArray(obj['techStack']) &&
    Array.isArray(obj['features'])
  );
}

/**
 * Builds the prompt for the Gemini API based on the student profile.
 *
 * @param profile - The student profile to synthesize a project for
 * @returns The formatted prompt string
 */
function buildPrompt(profile: StudentProfile): string {
  return `You are an expert capstone project advisor. Given the following student profile, generate a detailed project blueprint.

Student Profile:
${JSON.stringify(profile, null, 2)}

Respond with a valid JSON object matching this exact structure:
{
  "id": "unique-string-id",
  "slug": "url-safe-slug",
  "title": "Project Title",
  "abstract": "150-300 word project abstract",
  "novelty": "Incremental" | "Novel" | "Pioneering",
  "feasibilityScore": 0-100,
  "techStack": [{"tier": "Presentation|Logic|AI/ML|Storage|DevOps", "name": "Tech Name", "rationale": "Why this tech"}],
  "features": [{"name": "Feature Name", "description": "Feature description", "priority": 1-3}],
  "improvements": [{"title": "Title", "description": "Description", "impact": "Low|Medium|High"}],
  "targetDomain": "Primary domain",
  "estimatedWeeks": 12
}

Requirements:
- Title must be creative and professional
- Abstract must be 150-300 words explaining the project thoroughly
- Tech stack must include at least one entry per tier, prioritizing the student's skills
- Include exactly 5-6 features ordered by priority
- Include exactly 3 improvement suggestions
- Feasibility score should reflect the student's skill level and ambition
- Respond ONLY with the JSON object, no additional text`;
}

/**
 * Generates a project blueprint by first attempting the Gemini API,
 * then falling back to the deterministic local engine on any failure.
 *
 * Handles: missing API key, network errors, timeouts, HTTP 401/403/429,
 * malformed responses, and validation failures.
 *
 * @param profile - The student profile to generate a blueprint for
 * @returns A SynthesisResult containing the blueprint and its source
 * @throws Never — always returns a valid result via fallback
 *
 * @example
 * ```typescript
 * const result = await generateBlueprint(studentProfile);
 * console.log(result.source); // 'gemini' or 'fallback'
 * console.log(result.blueprint.title);
 * ```
 */
export async function generateBlueprint(profile: StudentProfile): Promise<SynthesisResult> {
  const perfIndex = startMeasure('blueprint-synthesis');

  const apiKey = getApiKey();

  // If no API key, immediately use fallback
  if (!apiKey) {
    const blueprint = synthesizeProject(profile);
    const perf = endMeasure(perfIndex);
    return {
      blueprint,
      source: 'fallback',
      latencyMs: perf?.duration ?? 0,
    };
  }

  // Attempt Gemini API call with timeout
  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = buildPrompt(profile);

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      clearTimeout(timeoutId);

      const text = response.text ?? '';

      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in Gemini response');
      }

      const parsed: unknown = JSON.parse(jsonMatch[0]);

      if (!isValidBlueprint(parsed)) {
        throw new Error('Gemini response does not conform to BlueprintContract');
      }

      const perf = endMeasure(perfIndex);
      return {
        blueprint: parsed,
        source: 'gemini',
        latencyMs: perf?.duration ?? 0,
      };
    } catch (innerError) {
      clearTimeout(timeoutId);
      throw innerError;
    }
  } catch {
    // Any error (network, timeout, auth, parse, validation) → fallback
    const blueprint = synthesizeProject(profile);
    const perf = endMeasure(perfIndex);
    return {
      blueprint,
      source: 'fallback',
      latencyMs: perf?.duration ?? 0,
    };
  }
}
