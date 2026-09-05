/**
 * @module DefenseContract
 * @description Defines the data contracts for viva voce defense simulation,
 * including examiner questions, model answers, difficulty levels,
 * and rubric scoring criteria.
 */

/**
 * Difficulty classification for viva voce questions.
 */
export enum QuestionDifficulty {
  Foundational = 'Foundational',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert',
}

/**
 * Category of viva voce interrogation.
 * Maps to common capstone defense evaluation areas.
 */
export enum QuestionCategory {
  Architecture = 'System Architecture',
  Methodology = 'Methodology & Approach',
  Innovation = 'Innovation & Novelty',
  Scalability = 'Scalability & Performance',
  Ethics = 'Ethics & Social Impact',
  Testing = 'Testing & Validation',
}

/**
 * Represents a single viva voce interrogation question
 * with its model answer and scoring rubric.
 *
 * @property id - Unique identifier for the question
 * @property question - The examiner's question text
 * @property modelAnswer - A comprehensive model defense answer
 * @property difficulty - Difficulty level of the question
 * @property category - The evaluation area this question targets
 * @property scoringRubric - Brief rubric description for evaluators
 * @property isRevealed - Whether the model answer is currently visible
 */
export interface VivaQuestion {
  readonly id: string;
  readonly question: string;
  readonly modelAnswer: string;
  readonly difficulty: QuestionDifficulty;
  readonly category: QuestionCategory;
  readonly scoringRubric: string;
  readonly isRevealed: boolean;
}

/**
 * Complete viva voce defense simulation contract containing
 * all questions for a specific project blueprint.
 *
 * @property projectId - Reference to the associated blueprint ID
 * @property questions - Array of examiner questions with model answers
 * @property totalQuestions - Total number of questions in the simulation
 */
export interface DefenseContract {
  readonly projectId: string;
  readonly questions: ReadonlyArray<VivaQuestion>;
  readonly totalQuestions: number;
}
