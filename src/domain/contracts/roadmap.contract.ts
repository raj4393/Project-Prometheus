/**
 * @module RoadmapContract
 * @description Defines the data contracts for 12-week development roadmaps,
 * sprint phases, milestone states, and completion tracking used in
 * the capstone project planning interface.
 */

/**
 * Enumeration of the four major development phases
 * in a standard 12-week capstone project lifecycle.
 */
export enum PhaseLabel {
  Architecture = 'Phase 1: Architecture & Datasets',
  CoreMVP = 'Phase 2: Core MVP Development',
  StressTesting = 'Phase 3: Stress Testing & Optimization',
  VivaDefense = 'Phase 4: Viva Voce Defense Prep',
}

/**
 * Completion state of an individual milestone task.
 */
export enum MilestoneState {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
}

/**
 * Represents a single actionable milestone within a sprint.
 *
 * @property id - Unique identifier for the milestone
 * @property title - Short descriptive title of the milestone
 * @property description - Detailed explanation of what this milestone entails
 * @property weekNumber - The week (1-12) this milestone is scheduled for
 * @property state - Current completion state of the milestone
 */
export interface Milestone {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly weekNumber: number;
  readonly state: MilestoneState;
}

/**
 * Represents a development sprint phase containing
 * multiple related milestones.
 *
 * @property label - The phase label identifier
 * @property weekRange - Human-readable week range (e.g., "Weeks 1-3")
 * @property milestones - Ordered list of milestones in this phase
 */
export interface SprintPhase {
  readonly label: PhaseLabel;
  readonly weekRange: string;
  readonly milestones: ReadonlyArray<Milestone>;
}

/**
 * Complete 12-week roadmap contract containing all sprint phases
 * and aggregate completion metrics.
 *
 * @property projectId - Reference to the associated blueprint ID
 * @property phases - Array of sprint phases covering the full 12 weeks
 * @property totalMilestones - Total number of milestones across all phases
 * @property completedMilestones - Number of milestones marked as completed
 */
export interface RoadmapContract {
  readonly projectId: string;
  readonly phases: ReadonlyArray<SprintPhase>;
  readonly totalMilestones: number;
  readonly completedMilestones: number;
}

/**
 * Computes the completion percentage for a roadmap.
 *
 * @param completed - Number of completed milestones
 * @param total - Total number of milestones
 * @returns Percentage value between 0 and 100, rounded to one decimal place
 * @throws Never — returns 0 for edge cases (total = 0)
 */
export function computeCompletionPercentage(completed: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((completed / total) * 1000) / 10;
}
