/**
 * @module Performance
 * @description Performance measurement utilities and memoized cache handlers
 * for tracking synthesis latency, render cycles, and cache hit rates.
 */

/**
 * Represents a single performance measurement entry.
 *
 * @property label - Human-readable label for the measurement
 * @property startTime - Timestamp when measurement began (ms)
 * @property endTime - Timestamp when measurement ended (ms, null if ongoing)
 * @property duration - Computed duration in milliseconds (null if ongoing)
 */
export interface PerfEntry {
  readonly label: string;
  readonly startTime: number;
  readonly endTime: number | null;
  readonly duration: number | null;
}

/**
 * In-memory performance measurement store.
 */
const perfEntries: PerfEntry[] = [];

/**
 * Starts a named performance measurement.
 *
 * @param label - A descriptive label for the measurement
 * @returns The index of the created entry for later completion
 */
export function startMeasure(label: string): number {
  const entry: PerfEntry = {
    label,
    startTime: performance.now(),
    endTime: null,
    duration: null,
  };
  return perfEntries.push(entry) - 1;
}

/**
 * Completes a previously started performance measurement.
 *
 * @param index - The index returned by startMeasure
 * @returns The completed PerfEntry with duration, or null if index is invalid
 */
export function endMeasure(index: number): PerfEntry | null {
  const entry = perfEntries[index];
  if (!entry) return null;

  const endTime = performance.now();
  const completed: PerfEntry = {
    ...entry,
    endTime,
    duration: endTime - entry.startTime,
  };
  perfEntries[index] = completed;
  return completed;
}

/**
 * Retrieves all recorded performance entries.
 *
 * @returns A readonly copy of all performance entries
 */
export function getAllMeasurements(): ReadonlyArray<PerfEntry> {
  return [...perfEntries];
}

/**
 * Clears all recorded performance entries.
 */
export function clearMeasurements(): void {
  perfEntries.length = 0;
}

/**
 * Simple memoization cache with TTL support.
 * Used to cache AI synthesis results and avoid redundant API calls.
 */
interface CacheEntry<T> {
  readonly value: T;
  readonly timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/** Default cache TTL: 5 minutes */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/**
 * Retrieves a cached value if it exists and has not expired.
 *
 * @param key - The cache key
 * @param ttlMs - Time-to-live in milliseconds (default: 5 minutes)
 * @returns The cached value, or null if not found or expired
 */
export function getCached<T>(key: string, ttlMs: number = DEFAULT_TTL_MS): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  if (Date.now() - entry.timestamp > ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Stores a value in the memoization cache.
 *
 * @param key - The cache key
 * @param value - The value to cache
 */
export function setCached<T>(key: string, value: T): void {
  cache.set(key, { value, timestamp: Date.now() });
}

/**
 * Clears the entire memoization cache.
 */
export function clearCache(): void {
  cache.clear();
}
