/**
 * @module DeterministicFallback
 * @description Dynamic, context-aware offline synthesis engine that generates
 * project blueprints tailored to student skills and domains without
 * requiring any network connectivity. Provides 100% resilient fallback
 * when the Gemini API is unavailable.
 */

import type { StudentProfile, SkillTag, DomainPillar } from '../../domain/contracts/student.contract';
import {
  type BlueprintContract,
  type TechStackEntry,
  type FeatureSpec,
  type ImprovementSuggestion,
  NoveltyFactor,
  StackTier,
} from '../../domain/contracts/blueprint.contract';
import { AmbitionLevel } from '../../domain/contracts/student.contract';

/**
 * Mapping of skill tags to their most natural tech stack placements.
 */
const SKILL_TO_STACK: Readonly<Record<string, TechStackEntry>> = {
  Python: { tier: StackTier.Logic, name: 'Python (FastAPI)', rationale: 'High-performance async API development with type hints' },
  JavaScript: { tier: StackTier.Presentation, name: 'JavaScript (Vanilla)', rationale: 'Lightweight client-side interactivity without framework overhead' },
  TypeScript: { tier: StackTier.Presentation, name: 'TypeScript + React', rationale: 'Type-safe component architecture for complex UI state management' },
  React: { tier: StackTier.Presentation, name: 'React 19', rationale: 'Component-based UI with concurrent rendering for smooth interactions' },
  'Next.js': { tier: StackTier.Presentation, name: 'Next.js 15', rationale: 'Full-stack React framework with SSR and API routes' },
  'Node.js': { tier: StackTier.Logic, name: 'Node.js + Express', rationale: 'Event-driven server for real-time data streaming and WebSocket support' },
  PyTorch: { tier: StackTier.AI, name: 'PyTorch 2.x', rationale: 'Dynamic computation graphs for flexible model experimentation' },
  TensorFlow: { tier: StackTier.AI, name: 'TensorFlow + Keras', rationale: 'Production-grade ML framework with TFLite deployment path' },
  Docker: { tier: StackTier.DevOps, name: 'Docker + Compose', rationale: 'Containerized development and deployment reproducibility' },
  Kubernetes: { tier: StackTier.DevOps, name: 'Kubernetes', rationale: 'Orchestrated container deployment with auto-scaling' },
  Rust: { tier: StackTier.Logic, name: 'Rust (Actix-Web)', rationale: 'Memory-safe high-performance backend for latency-critical paths' },
  Go: { tier: StackTier.Logic, name: 'Go (Gin)', rationale: 'Concurrent service architecture with built-in goroutine support' },
  PostgreSQL: { tier: StackTier.Storage, name: 'PostgreSQL 16', rationale: 'Advanced relational database with JSON support and robust indexing' },
  MongoDB: { tier: StackTier.Storage, name: 'MongoDB Atlas', rationale: 'Flexible document store for semi-structured domain data' },
  Redis: { tier: StackTier.Storage, name: 'Redis 7', rationale: 'In-memory cache and pub/sub for real-time event propagation' },
  GraphQL: { tier: StackTier.Logic, name: 'GraphQL (Apollo)', rationale: 'Flexible query language reducing over-fetching on complex data graphs' },
  AWS: { tier: StackTier.DevOps, name: 'AWS (EC2 + S3 + Lambda)', rationale: 'Elastic cloud infrastructure with serverless compute options' },
  GCP: { tier: StackTier.DevOps, name: 'Google Cloud Platform', rationale: 'Cloud infrastructure with Vertex AI and BigQuery analytics' },
  Flutter: { tier: StackTier.Presentation, name: 'Flutter 3', rationale: 'Cross-platform mobile UI with single codebase for iOS and Android' },
  Swift: { tier: StackTier.Presentation, name: 'Swift + SwiftUI', rationale: 'Native iOS development with declarative UI framework' },
  OpenCV: { tier: StackTier.AI, name: 'OpenCV + NumPy', rationale: 'Real-time computer vision processing and image transformation pipeline' },
  LangChain: { tier: StackTier.AI, name: 'LangChain + ChromaDB', rationale: 'LLM orchestration with vector store for RAG-based retrieval' },
  Solidity: { tier: StackTier.Logic, name: 'Solidity + Hardhat', rationale: 'Smart contract development with comprehensive testing framework' },
  ROS: { tier: StackTier.Logic, name: 'ROS 2 (Humble)', rationale: 'Robotics middleware for sensor fusion and autonomous control' },
};

/**
 * Domain-specific project title templates.
 * Each domain has multiple templates that incorporate skill context.
 */
const DOMAIN_TITLE_TEMPLATES: Readonly<Record<string, ReadonlyArray<string>>> = {
  HealthTech: [
    'Intelligent {skill}-Powered Patient Risk Stratification Platform',
    'AI-Assisted Clinical Decision Support System Using {skill}',
    'Smart Telemedicine Triage Engine with {skill} Analytics',
  ],
  'Cyber-Physical Systems': [
    'Autonomous {skill}-Based Industrial IoT Monitoring Framework',
    'Real-Time Digital Twin Platform with {skill} Integration',
    'Smart Manufacturing Quality Control Using {skill} Vision',
  ],
  FinTech: [
    'Algorithmic Trading Strategy Backtester Powered by {skill}',
    'Fraud Detection Engine with {skill} Behavioral Analytics',
    'Decentralized Credit Scoring Platform Using {skill}',
  ],
  'Green AI': [
    'Carbon-Optimized {skill} Training Scheduler for Sustainable ML',
    'Energy-Efficient Edge Inference Engine Using {skill}',
    'Eco-Aware Data Pipeline Optimizer with {skill} Monitoring',
  ],
  EdTech: [
    'Adaptive Learning Pathway Generator Using {skill} Intelligence',
    'AI-Powered Student Performance Predictor with {skill}',
    'Gamified Peer Assessment Platform Built with {skill}',
  ],
  Cybersecurity: [
    'Zero-Trust Network Anomaly Detector Powered by {skill}',
    'Automated Vulnerability Scanner Using {skill} Analysis',
    'Threat Intelligence Graph Platform with {skill} Correlation',
  ],
  'Computer Vision': [
    'Real-Time Object Detection Pipeline Using {skill}',
    'Medical Image Segmentation Platform with {skill} Models',
    'Augmented Reality Guidance System Built on {skill}',
  ],
  'Natural Language Processing': [
    'Contextual Document Summarization Engine Using {skill}',
    'Multilingual Sentiment Analysis Platform with {skill}',
    'Conversational AI Assistant Built on {skill} RAG Architecture',
  ],
  'Internet of Things': [
    'Edge-Computing IoT Gateway with {skill} Analytics',
    'Smart Agriculture Monitoring System Using {skill} Sensors',
    'Predictive Maintenance Platform with {skill} Telemetry',
  ],
  'Blockchain & Web3': [
    'Decentralized Identity Verification Using {skill}',
    'DAO Governance Platform Built with {skill} Smart Contracts',
    'Supply Chain Provenance Tracker on {skill} Blockchain',
  ],
};

/**
 * Domain-specific abstract templates for generating meaningful descriptions.
 */
const DOMAIN_ABSTRACT_TEMPLATES: Readonly<Record<string, string>> = {
  HealthTech: 'This platform leverages advanced {skills} technologies to transform healthcare delivery by automating clinical workflows, improving diagnostic accuracy, and enabling data-driven patient care decisions. The system processes multi-modal medical data through a robust pipeline, providing healthcare professionals with actionable insights while maintaining strict HIPAA compliance and patient data privacy. Key innovations include real-time risk scoring, explainable AI recommendations, and seamless EHR integration.',
  'Cyber-Physical Systems': 'This framework bridges the gap between physical processes and digital intelligence using {skills} to create responsive, self-optimizing cyber-physical systems. By deploying intelligent agents across the operational technology stack, the platform enables predictive anomaly detection, autonomous process control, and digital twin synchronization with sub-second latency.',
  FinTech: 'This financial technology platform harnesses {skills} to deliver next-generation financial services with enhanced security, transparency, and accessibility. The system implements sophisticated risk modeling, real-time transaction analysis, and regulatory compliance automation while maintaining institutional-grade performance benchmarks.',
  'Green AI': 'This sustainability-focused platform uses {skills} to minimize the environmental impact of computational workloads while maintaining performance targets. Through intelligent scheduling, energy-aware optimization, and comprehensive carbon accounting, the system enables organizations to achieve their sustainability goals without sacrificing productivity.',
  EdTech: 'This educational technology platform employs {skills} to create personalized, adaptive learning experiences that respond to individual student needs in real time. The system combines learning analytics, intelligent content curation, and social learning mechanisms to improve educational outcomes measurably.',
  Cybersecurity: 'This security platform integrates {skills} technologies to provide comprehensive threat detection, automated incident response, and proactive vulnerability management. The system employs behavioral analytics, pattern recognition, and threat intelligence correlation to identify and neutralize sophisticated attack vectors.',
  'Computer Vision': 'This computer vision platform applies {skills} to extract meaningful information from visual data streams in real time. The system processes multi-resolution imagery through optimized neural network pipelines, delivering accurate detection, segmentation, and classification results with industry-leading inference speed.',
  'Natural Language Processing': 'This NLP platform leverages {skills} to understand, generate, and transform human language at scale. The system combines transformer-based models with domain-specific fine-tuning to deliver contextually aware text analysis, generation, and interaction capabilities.',
  'Internet of Things': 'This IoT platform utilizes {skills} to create an intelligent network of connected devices with edge-computing capabilities. The system processes sensor telemetry through distributed analytics pipelines, enabling predictive insights and autonomous actuator control.',
  'Blockchain & Web3': 'This decentralized platform uses {skills} to build trustless, transparent, and immutable systems for digital asset management and governance. The architecture implements smart contract automation, cross-chain interoperability, and decentralized identity management.',
};

/**
 * Domain-specific feature templates.
 */
const DOMAIN_FEATURES: Readonly<Record<string, ReadonlyArray<FeatureSpec>>> = {
  HealthTech: [
    { name: 'Multi-Modal Data Ingestion', description: 'Unified pipeline processing EHR records, imaging data, lab results, and wearable telemetry', priority: 1 },
    { name: 'AI Diagnostic Assistant', description: 'Machine learning model providing evidence-based diagnostic suggestions with confidence intervals', priority: 1 },
    { name: 'Patient Risk Dashboard', description: 'Real-time risk stratification visualization with trend analysis and alert thresholds', priority: 2 },
    { name: 'Compliance Audit Trail', description: 'Immutable logging of all data access and AI decisions for HIPAA compliance', priority: 2 },
    { name: 'Explainable AI Module', description: 'SHAP/LIME explanations for every AI recommendation to build clinical trust', priority: 3 },
  ],
  default: [
    { name: 'Intelligent Data Pipeline', description: 'Automated ETL pipeline with validation, transformation, and quality scoring', priority: 1 },
    { name: 'Core ML Engine', description: 'Domain-specific machine learning model with automated retraining and versioning', priority: 1 },
    { name: 'Real-Time Analytics Dashboard', description: 'Interactive visualization of key metrics with drill-down capabilities', priority: 2 },
    { name: 'API Gateway & Authentication', description: 'Secure REST API with OAuth 2.0, rate limiting, and request validation', priority: 2 },
    { name: 'Automated Reporting', description: 'Scheduled and on-demand report generation in multiple formats', priority: 3 },
  ],
};

/**
 * Generates a slug from a project title.
 *
 * @param title - The project title to slugify
 * @returns A URL-safe slug string
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

/**
 * Computes a feasibility score based on skill count, proficiency, and ambition.
 *
 * @param profile - The student profile to evaluate
 * @returns A score between 0 and 100
 */
function computeFeasibility(profile: StudentProfile): number {
  const skillCount = profile.skills.length;
  const proficiencyWeights: Record<string, number> = {
    Beginner: 0.4,
    Intermediate: 0.6,
    Advanced: 0.8,
    Expert: 1.0,
  };

  const avgProficiency =
    skillCount > 0
      ? profile.skills.reduce((sum, s) => sum + (proficiencyWeights[s.proficiency] ?? 0.5), 0) / skillCount
      : 0.3;

  const ambitionPenalty =
    profile.ambition === AmbitionLevel.Moonshot
      ? 0.7
      : profile.ambition === AmbitionLevel.Ambitious
        ? 0.85
        : 1.0;

  const teamBonus = Math.min(profile.teamSize * 0.05, 0.2);
  const rawScore = (avgProficiency * 80 + skillCount * 3 + teamBonus * 100) * ambitionPenalty;

  return Math.min(100, Math.max(0, Math.round(rawScore)));
}

/**
 * Synthesizes a complete project blueprint from a student profile without
 * requiring any network connectivity. Dynamically assembles project titles,
 * abstracts, tech stacks, and features based on selected skills and domains.
 *
 * @param profile - The student profile with skills and domain preferences
 * @returns A fully populated BlueprintContract tailored to the student's inputs
 * @throws Never — gracefully handles empty skill sets with sensible defaults
 *
 * @example
 * ```typescript
 * const blueprint = synthesizeProject(studentProfile);
 * console.log(blueprint.title); // "Intelligent Python-Powered Patient Risk Stratification Platform"
 * console.log(blueprint.feasibilityScore); // 78
 * ```
 */
export function synthesizeProject(profile: StudentProfile): BlueprintContract {
  const primaryDomain = profile.domains[0] ?? 'EdTech';
  const primarySkill: string = profile.skills[0]?.tag ?? 'Python';

  // Generate title from domain templates
  const templates = DOMAIN_TITLE_TEMPLATES[primaryDomain] ?? DOMAIN_TITLE_TEMPLATES['EdTech']!;
  const templateIndex = Math.abs(primarySkill.length + primaryDomain.length) % templates.length;
  const title = templates[templateIndex]!.replace('{skill}', primarySkill);

  // Generate abstract
  const abstractTemplate = DOMAIN_ABSTRACT_TEMPLATES[primaryDomain] ?? DOMAIN_ABSTRACT_TEMPLATES['EdTech']!;
  const skillNames = profile.skills.length > 0
    ? profile.skills.map((s) => s.tag).join(', ')
    : 'modern full-stack';
  const abstract = abstractTemplate.replace('{skills}', skillNames);

  // Build tech stack from selected skills
  const techStack: TechStackEntry[] = [];
  const usedTiers = new Set<StackTier>();

  for (const skill of profile.skills) {
    const entry = SKILL_TO_STACK[skill.tag];
    if (entry && !usedTiers.has(entry.tier)) {
      techStack.push(entry);
      usedTiers.add(entry.tier);
    }
  }

  // Ensure at least one entry per critical tier
  if (!usedTiers.has(StackTier.Storage)) {
    techStack.push({ tier: StackTier.Storage, name: 'PostgreSQL 16', rationale: 'Reliable relational database with advanced querying capabilities' });
  }
  if (!usedTiers.has(StackTier.DevOps)) {
    techStack.push({ tier: StackTier.DevOps, name: 'Docker + GitHub Actions', rationale: 'Containerized CI/CD pipeline for reproducible deployments' });
  }
  if (!usedTiers.has(StackTier.Presentation)) {
    techStack.push({ tier: StackTier.Presentation, name: 'React + TypeScript', rationale: 'Type-safe interactive frontend with component-based architecture' });
  }
  if (!usedTiers.has(StackTier.Logic)) {
    techStack.push({ tier: StackTier.Logic, name: 'Python (FastAPI)', rationale: 'Async API framework for high-performance backend services' });
  }

  // Select features
  const features = DOMAIN_FEATURES[primaryDomain] ?? DOMAIN_FEATURES['default']!;

  // Compute novelty and feasibility
  const novelty =
    profile.ambition === AmbitionLevel.Moonshot
      ? NoveltyFactor.Pioneering
      : profile.ambition === AmbitionLevel.Ambitious
        ? NoveltyFactor.Novel
        : NoveltyFactor.Incremental;

  const feasibilityScore = computeFeasibility(profile);

  // Generate improvements
  const improvements: ImprovementSuggestion[] = [
    { title: 'Progressive Web App Support', description: 'Add offline caching and install prompt for mobile-first accessibility', impact: 'Medium' },
    { title: 'A/B Testing Framework', description: 'Implement feature flags and statistical analysis for iterative UX improvement', impact: 'Medium' },
    { title: 'Multi-Tenant Architecture', description: 'Extend to support multiple organizations with data isolation', impact: 'High' },
  ];

  const id = `synth-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  return {
    id,
    slug: slugify(title),
    title,
    abstract,
    novelty,
    feasibilityScore,
    techStack,
    features: [...features],
    improvements,
    targetDomain: String(primaryDomain),
    estimatedWeeks: profile.timeFrame === '4 Weeks' ? 4 : profile.timeFrame === '8 Weeks' ? 8 : profile.timeFrame === '16 Weeks' ? 16 : 12,
  };
}
