/**
 * @module BlueprintContract
 * @description Defines the data contracts for generated capstone project blueprints,
 * including title, abstract, novelty factor, multi-tier technology stack,
 * feasibility scoring, and feature specifications.
 */

/**
 * Technology stack tier classification.
 * Maps to the logical architecture layers of a capstone project.
 */
export enum StackTier {
  Presentation = 'Presentation',
  Logic = 'Logic',
  AI = 'AI/ML',
  Storage = 'Storage',
  DevOps = 'DevOps',
}

/**
 * Represents a single technology choice within a specific tier.
 *
 * @property tier - The architecture layer this technology serves
 * @property name - Display name of the technology
 * @property rationale - Brief justification for choosing this technology
 */
export interface TechStackEntry {
  readonly tier: StackTier;
  readonly name: string;
  readonly rationale: string;
}

/**
 * Novelty classification for a generated project idea.
 * Indicates the degree of innovation relative to existing solutions.
 */
export enum NoveltyFactor {
  Incremental = 'Incremental',
  Novel = 'Novel',
  Pioneering = 'Pioneering',
}

/**
 * A key feature of the generated capstone project.
 *
 * @property name - Feature title
 * @property description - Detailed description of the feature
 * @property priority - Implementation priority (1 = highest)
 */
export interface FeatureSpec {
  readonly name: string;
  readonly description: string;
  readonly priority: number;
}

/**
 * Improvement suggestion to enhance the project beyond MVP scope.
 *
 * @property title - Short improvement title
 * @property description - What the improvement entails
 * @property impact - Expected impact level on project quality
 */
export interface ImprovementSuggestion {
  readonly title: string;
  readonly description: string;
  readonly impact: 'Low' | 'Medium' | 'High';
}

/**
 * Complete project blueprint contract representing a fully synthesized
 * capstone project idea with all supporting metadata.
 *
 * @property id - Unique identifier for the blueprint
 * @property slug - URL-safe identifier derived from the title
 * @property title - Human-readable project title
 * @property abstract - Comprehensive project abstract (150-300 words)
 * @property novelty - Classification of the project's innovation level
 * @property feasibilityScore - Computed score from 0-100 indicating project viability
 * @property techStack - Multi-tier technology stack specification
 * @property features - Core feature specifications for the project
 * @property improvements - Suggested enhancements beyond MVP
 * @property targetDomain - Primary domain vertical for the project
 * @property estimatedWeeks - Estimated development time in weeks
 */
export interface BlueprintContract {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly abstract: string;
  readonly novelty: NoveltyFactor;
  readonly feasibilityScore: number;
  readonly techStack: ReadonlyArray<TechStackEntry>;
  readonly features: ReadonlyArray<FeatureSpec>;
  readonly improvements: ReadonlyArray<ImprovementSuggestion>;
  readonly targetDomain: string;
  readonly estimatedWeeks: number;
}
