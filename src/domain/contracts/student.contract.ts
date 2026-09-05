/**
 * @module StudentContract
 * @description Defines the data contracts for student profiles, skill matrices,
 * domain pillars, timeframe preferences, and ambition levels used throughout
 * the capstone project generation pipeline.
 */

/**
 * Enumeration of recognized technical skill categories.
 * Each skill maps to a specific technology or framework
 * that can be leveraged in capstone project generation.
 */
export enum SkillTag {
  Python = 'Python',
  JavaScript = 'JavaScript',
  TypeScript = 'TypeScript',
  React = 'React',
  NextJS = 'Next.js',
  NodeJS = 'Node.js',
  PyTorch = 'PyTorch',
  TensorFlow = 'TensorFlow',
  Docker = 'Docker',
  Kubernetes = 'Kubernetes',
  Rust = 'Rust',
  Go = 'Go',
  PostgreSQL = 'PostgreSQL',
  MongoDB = 'MongoDB',
  Redis = 'Redis',
  GraphQL = 'GraphQL',
  AWS = 'AWS',
  GCP = 'GCP',
  Flutter = 'Flutter',
  Swift = 'Swift',
  OpenCV = 'OpenCV',
  LangChain = 'LangChain',
  Solidity = 'Solidity',
  ROS = 'ROS',
}

/**
 * Proficiency level for a given skill.
 * Used to weight skill relevance during project synthesis.
 */
export enum ProficiencyLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert',
}

/**
 * Represents a single skill entry in the student's matrix,
 * pairing a skill tag with a self-assessed proficiency level.
 *
 * @property tag - The specific technology or framework identifier
 * @property proficiency - The student's self-assessed skill level
 */
export interface SkillEntry {
  readonly tag: SkillTag;
  readonly proficiency: ProficiencyLevel;
}

/**
 * Domain pillars representing major capstone project verticals.
 * Each domain guides the thematic direction of generated projects.
 */
export enum DomainPillar {
  HealthTech = 'HealthTech',
  CyberPhysical = 'Cyber-Physical Systems',
  FinTech = 'FinTech',
  GreenAI = 'Green AI',
  EdTech = 'EdTech',
  Cybersecurity = 'Cybersecurity',
  ComputerVision = 'Computer Vision',
  NLP = 'Natural Language Processing',
  IoT = 'Internet of Things',
  Blockchain = 'Blockchain & Web3',
}

/**
 * Project development timeframe options.
 * Influences scope and complexity of generated blueprints.
 */
export enum TimeFrame {
  FourWeeks = '4 Weeks',
  EightWeeks = '8 Weeks',
  TwelveWeeks = '12 Weeks',
  SixteenWeeks = '16 Weeks',
}

/**
 * Ambition level that calibrates the complexity and novelty
 * of the generated capstone project.
 */
export enum AmbitionLevel {
  /** A focused, achievable project suitable for solo developers */
  Practical = 'Practical',
  /** A moderately complex project with some innovative elements */
  Ambitious = 'Ambitious',
  /** A highly novel, research-oriented project pushing boundaries */
  Moonshot = 'Moonshot',
}

/**
 * Complete student profile contract aggregating all intake parameters
 * required by the synthesis engine to generate tailored capstone projects.
 *
 * @property studentName - The student's display name
 * @property skills - Array of skill entries with proficiency levels
 * @property domains - Selected domain pillars of interest (1-3)
 * @property timeFrame - Preferred development timeline
 * @property ambition - Desired project complexity level
 * @property teamSize - Number of team members (1-5)
 */
export interface StudentProfile {
  readonly studentName: string;
  readonly skills: ReadonlyArray<SkillEntry>;
  readonly domains: ReadonlyArray<DomainPillar>;
  readonly timeFrame: TimeFrame;
  readonly ambition: AmbitionLevel;
  readonly teamSize: number;
}
