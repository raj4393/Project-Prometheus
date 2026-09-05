/**
 * @module ProjectPresets
 * @description Provides 3 pre-populated, production-grade capstone blueprint seeds
 * ensuring the dashboard displays live metrics and visual topologies on first render.
 * These presets cover HealthTech, Cybersecurity, and Green AI domains.
 */

import { type BlueprintContract, NoveltyFactor, StackTier } from '../contracts/blueprint.contract';
import {
  type RoadmapContract,
  PhaseLabel,
  MilestoneState,
} from '../contracts/roadmap.contract';
import {
  type DefenseContract,
  QuestionDifficulty,
  QuestionCategory,
} from '../contracts/defense.contract';

/**
 * Pre-populated capstone blueprint: AI-Powered Medical Imaging Triage System.
 * Domain: HealthTech | Ambition: Ambitious | Timeline: 12 weeks
 */
export const PRESET_BLUEPRINT_HEALTHTECH: BlueprintContract = {
  id: 'preset-healthtech-001',
  slug: 'ai-medical-imaging-triage',
  title: 'NeuroScan AI — Intelligent Medical Imaging Triage System',
  abstract:
    'NeuroScan AI is a deep learning–powered diagnostic triage platform that assists radiologists by automatically prioritizing and classifying brain MRI scans. The system ingests DICOM-format imaging data, applies a fine-tuned convolutional neural network ensemble (EfficientNet-B4 + Vision Transformer hybrid) to detect anomalies including tumors, hemorrhages, and ischemic lesions, and outputs a severity-ranked queue with explainable heatmap overlays via Grad-CAM. The platform integrates with hospital PACS/RIS workflows through a FHIR-compliant REST API, enabling seamless adoption without disrupting existing clinical pipelines. A real-time dashboard provides department-level analytics on scan throughput, average triage latency, and diagnostic confidence distributions. The architecture employs federated learning capabilities for multi-institution model improvement while preserving patient data sovereignty through differential privacy guarantees.',
  novelty: NoveltyFactor.Pioneering,
  feasibilityScore: 78,
  techStack: [
    { tier: StackTier.Presentation, name: 'React + TypeScript', rationale: 'Type-safe interactive dashboard for radiologist workflow' },
    { tier: StackTier.Presentation, name: 'D3.js', rationale: 'Custom visualization for heatmap overlays and analytics charts' },
    { tier: StackTier.Logic, name: 'FastAPI (Python)', rationale: 'High-performance async API for DICOM processing pipeline' },
    { tier: StackTier.Logic, name: 'Celery + Redis', rationale: 'Distributed task queue for batch scan processing' },
    { tier: StackTier.AI, name: 'PyTorch + TorchVision', rationale: 'CNN/ViT hybrid model training and inference' },
    { tier: StackTier.AI, name: 'Grad-CAM', rationale: 'Explainable AI heatmap generation for clinical trust' },
    { tier: StackTier.Storage, name: 'PostgreSQL + TimescaleDB', rationale: 'Relational storage with time-series analytics for scan metrics' },
    { tier: StackTier.DevOps, name: 'Docker + NVIDIA Container Toolkit', rationale: 'GPU-accelerated containerized inference deployment' },
  ],
  features: [
    { name: 'DICOM Ingestion Pipeline', description: 'Automated DICOM file parsing, anonymization, and preprocessing with support for multi-slice volumetric data', priority: 1 },
    { name: 'Hybrid CNN-ViT Classifier', description: 'Ensemble model combining EfficientNet-B4 spatial features with Vision Transformer global attention for multi-class pathology detection', priority: 1 },
    { name: 'Grad-CAM Explainability', description: 'Gradient-weighted class activation maps overlaid on source images to highlight regions driving diagnostic decisions', priority: 2 },
    { name: 'Severity-Ranked Triage Queue', description: 'Real-time priority queue ranking scans by predicted severity to optimize radiologist attention allocation', priority: 1 },
    { name: 'FHIR-Compliant API', description: 'HL7 FHIR R4 compatible REST endpoints for seamless EHR/PACS integration', priority: 2 },
    { name: 'Analytics Dashboard', description: 'Department-level metrics on throughput, latency, confidence distributions, and model performance drift', priority: 3 },
  ],
  improvements: [
    { title: 'Federated Learning Module', description: 'Enable cross-institutional model training without centralizing patient data using federated averaging', impact: 'High' },
    { title: '3D Volumetric Rendering', description: 'WebGL-based 3D brain volume rendering for immersive scan review', impact: 'Medium' },
    { title: 'Voice-Activated Reporting', description: 'Integrate speech-to-text for hands-free radiology report dictation', impact: 'Low' },
  ],
  targetDomain: 'HealthTech',
  estimatedWeeks: 12,
};

/**
 * Pre-populated capstone blueprint: Zero-Trust Network Anomaly Detector.
 * Domain: Cybersecurity | Ambition: Ambitious | Timeline: 12 weeks
 */
export const PRESET_BLUEPRINT_CYBERSECURITY: BlueprintContract = {
  id: 'preset-cyber-002',
  slug: 'zero-trust-anomaly-detector',
  title: 'SentinelNet — Zero-Trust Network Anomaly Detection Engine',
  abstract:
    'SentinelNet is an intelligent network security platform that implements zero-trust architecture principles combined with real-time anomaly detection using unsupervised machine learning. The system deploys lightweight agents across network endpoints that capture packet metadata and behavioral telemetry, streaming events to a centralized analysis engine via Apache Kafka. An autoencoder-based anomaly detector trained on normal traffic baselines identifies deviations indicating potential intrusions, lateral movement, or data exfiltration attempts. The platform provides a SOC analyst dashboard with threat severity scoring, automated incident response playbook suggestions, and forensic timeline reconstruction. Integration with MITRE ATT&CK framework enables automatic technique classification, while a graph database models entity relationships for advanced threat hunting queries.',
  novelty: NoveltyFactor.Novel,
  feasibilityScore: 82,
  techStack: [
    { tier: StackTier.Presentation, name: 'Next.js + TypeScript', rationale: 'SSR-capable dashboard for SOC analyst real-time monitoring' },
    { tier: StackTier.Presentation, name: 'Cytoscape.js', rationale: 'Interactive network topology and attack graph visualization' },
    { tier: StackTier.Logic, name: 'Node.js + Express', rationale: 'Event-driven API server for high-throughput telemetry ingestion' },
    { tier: StackTier.Logic, name: 'Apache Kafka', rationale: 'Distributed streaming for real-time packet metadata processing' },
    { tier: StackTier.AI, name: 'TensorFlow + Keras', rationale: 'Autoencoder model for unsupervised anomaly detection' },
    { tier: StackTier.AI, name: 'scikit-learn', rationale: 'Feature engineering and baseline statistical analysis' },
    { tier: StackTier.Storage, name: 'Neo4j', rationale: 'Graph database for entity relationship modeling and threat hunting' },
    { tier: StackTier.Storage, name: 'InfluxDB', rationale: 'Time-series database for high-frequency network metrics' },
    { tier: StackTier.DevOps, name: 'Docker + Kubernetes', rationale: 'Scalable microservice deployment for distributed agents' },
  ],
  features: [
    { name: 'Endpoint Telemetry Agents', description: 'Lightweight daemon processes capturing network flow metadata, process trees, and file system events from monitored hosts', priority: 1 },
    { name: 'Autoencoder Anomaly Engine', description: 'Deep autoencoder trained on baseline network behavior to detect statistical outliers indicating potential threats', priority: 1 },
    { name: 'MITRE ATT&CK Classifier', description: 'Automatic mapping of detected anomalies to MITRE ATT&CK techniques and tactics for standardized threat intelligence', priority: 2 },
    { name: 'SOC Analyst Dashboard', description: 'Real-time threat feed with severity scoring, incident clustering, and one-click response playbook activation', priority: 1 },
    { name: 'Graph-Based Threat Hunting', description: 'Cypher query interface over entity relationship graphs for proactive threat investigation and lateral movement tracing', priority: 2 },
    { name: 'Forensic Timeline Reconstruction', description: 'Automated chronological event sequencing for post-incident analysis and compliance reporting', priority: 3 },
  ],
  improvements: [
    { title: 'Adversarial Robustness Training', description: 'Harden the anomaly detector against adversarial evasion attacks using FGSM and PGD augmentation', impact: 'High' },
    { title: 'SOAR Integration', description: 'Connect with Security Orchestration, Automation and Response platforms for automated remediation', impact: 'High' },
    { title: 'Encrypted Traffic Analysis', description: 'Implement JA3/JA4 fingerprinting for anomaly detection in TLS-encrypted traffic without decryption', impact: 'Medium' },
  ],
  targetDomain: 'Cybersecurity',
  estimatedWeeks: 12,
};

/**
 * Pre-populated capstone blueprint: Carbon-Aware Compute Scheduler.
 * Domain: Green AI | Ambition: Moonshot | Timeline: 12 weeks
 */
export const PRESET_BLUEPRINT_GREENAI: BlueprintContract = {
  id: 'preset-greenai-003',
  slug: 'carbon-aware-compute-scheduler',
  title: 'EcoForge — Carbon-Aware Intelligent Compute Scheduler',
  abstract:
    'EcoForge is a sustainability-focused compute orchestration platform that dynamically schedules machine learning training jobs and batch workloads across cloud regions based on real-time carbon intensity data from electricity grids. The system integrates with WattTime and Electricity Maps APIs to obtain marginal carbon emission rates per region, then applies a multi-objective optimization algorithm balancing training time, monetary cost, and carbon footprint. A reinforcement learning agent continuously improves scheduling decisions by learning from historical job completion patterns and grid carbon forecasts. The platform provides researchers with transparent carbon accounting dashboards showing per-experiment emissions, cumulative lab footprint, and counterfactual analysis comparing carbon-optimized versus default scheduling. EcoForge supports major cloud providers (GCP, AWS, Azure) and on-premise GPU clusters through a unified abstraction layer.',
  novelty: NoveltyFactor.Pioneering,
  feasibilityScore: 71,
  techStack: [
    { tier: StackTier.Presentation, name: 'React + TypeScript', rationale: 'Interactive carbon accounting dashboard with real-time grid maps' },
    { tier: StackTier.Presentation, name: 'Recharts', rationale: 'Responsive charting library for emissions and cost visualizations' },
    { tier: StackTier.Logic, name: 'Go (Gin)', rationale: 'High-concurrency scheduler service handling multi-region job dispatch' },
    { tier: StackTier.Logic, name: 'gRPC', rationale: 'Efficient inter-service communication for scheduler-agent coordination' },
    { tier: StackTier.AI, name: 'Stable-Baselines3 (PPO)', rationale: 'Reinforcement learning agent for adaptive scheduling policy optimization' },
    { tier: StackTier.AI, name: 'Prophet', rationale: 'Time-series forecasting for carbon intensity prediction' },
    { tier: StackTier.Storage, name: 'PostgreSQL', rationale: 'Relational storage for job metadata and carbon accounting records' },
    { tier: StackTier.Storage, name: 'Redis', rationale: 'In-memory cache for real-time carbon intensity data and job queues' },
    { tier: StackTier.DevOps, name: 'Terraform + GCP', rationale: 'Infrastructure-as-code for multi-cloud resource provisioning' },
  ],
  features: [
    { name: 'Real-Time Carbon Grid Integration', description: 'Live ingestion of marginal carbon intensity data from WattTime and Electricity Maps covering 30+ global grid regions', priority: 1 },
    { name: 'Multi-Objective Job Scheduler', description: 'Pareto-optimal scheduling balancing training latency, cloud cost, and gCO₂eq emissions using constrained optimization', priority: 1 },
    { name: 'RL Scheduling Agent', description: 'PPO-trained reinforcement learning agent that adapts scheduling policies based on historical outcomes and grid forecasts', priority: 2 },
    { name: 'Carbon Accounting Dashboard', description: 'Per-experiment and lab-level carbon footprint tracking with counterfactual comparisons and exportable sustainability reports', priority: 1 },
    { name: 'Multi-Cloud Abstraction Layer', description: 'Unified API supporting GCP Compute Engine, AWS EC2, Azure VMs, and on-premise SLURM clusters', priority: 2 },
    { name: 'Carbon Forecast Visualizer', description: 'Interactive world map showing predicted carbon intensity by region with optimal scheduling windows highlighted', priority: 3 },
  ],
  improvements: [
    { title: 'Scope 3 Supply Chain Tracking', description: 'Extend carbon accounting to include embodied emissions from hardware manufacturing and data center cooling', impact: 'High' },
    { title: 'Carbon Credit Marketplace', description: 'Integrate with voluntary carbon offset registries to automatically purchase offsets for residual emissions', impact: 'Medium' },
    { title: 'Energy-Aware Model Pruning', description: 'Suggest model compression techniques that reduce computational requirements and associated emissions', impact: 'Medium' },
  ],
  targetDomain: 'Green AI',
  estimatedWeeks: 12,
};

/** All preset blueprints for initial dashboard population */
export const ALL_PRESET_BLUEPRINTS: ReadonlyArray<BlueprintContract> = [
  PRESET_BLUEPRINT_HEALTHTECH,
  PRESET_BLUEPRINT_CYBERSECURITY,
  PRESET_BLUEPRINT_GREENAI,
];

/**
 * Generates a default 12-week roadmap for a given project blueprint.
 *
 * @param projectId - The blueprint ID to associate the roadmap with
 * @returns A fully populated RoadmapContract with 12 milestones across 4 phases
 */
export function generateDefaultRoadmap(projectId: string): RoadmapContract {
  const phases = [
    {
      label: PhaseLabel.Architecture,
      weekRange: 'Weeks 1–3',
      milestones: [
        { id: `${projectId}-m1`, title: 'Requirements Analysis', description: 'Gather and document functional and non-functional requirements with stakeholder interviews', weekNumber: 1, state: MilestoneState.Pending },
        { id: `${projectId}-m2`, title: 'System Architecture Design', description: 'Design high-level system architecture, define component boundaries, and select technology stack', weekNumber: 2, state: MilestoneState.Pending },
        { id: `${projectId}-m3`, title: 'Dataset Acquisition & Preprocessing', description: 'Identify, collect, clean, and partition datasets for training and validation', weekNumber: 3, state: MilestoneState.Pending },
      ],
    },
    {
      label: PhaseLabel.CoreMVP,
      weekRange: 'Weeks 4–7',
      milestones: [
        { id: `${projectId}-m4`, title: 'Backend API Scaffold', description: 'Implement core REST/gRPC endpoints, authentication middleware, and database schema migrations', weekNumber: 4, state: MilestoneState.Pending },
        { id: `${projectId}-m5`, title: 'ML Model Training Pipeline', description: 'Build training pipeline with data loaders, model definition, loss functions, and evaluation metrics', weekNumber: 5, state: MilestoneState.Pending },
        { id: `${projectId}-m6`, title: 'Frontend Core Interface', description: 'Develop primary dashboard views, component library, and state management integration', weekNumber: 6, state: MilestoneState.Pending },
        { id: `${projectId}-m7`, title: 'Integration & API Contracts', description: 'Connect frontend to backend APIs, implement error handling, and validate end-to-end data flow', weekNumber: 7, state: MilestoneState.Pending },
      ],
    },
    {
      label: PhaseLabel.StressTesting,
      weekRange: 'Weeks 8–10',
      milestones: [
        { id: `${projectId}-m8`, title: 'Unit & Integration Testing', description: 'Achieve 80%+ code coverage with unit tests and critical path integration tests', weekNumber: 8, state: MilestoneState.Pending },
        { id: `${projectId}-m9`, title: 'Performance Profiling', description: 'Load test APIs, optimize database queries, and benchmark ML inference latency', weekNumber: 9, state: MilestoneState.Pending },
        { id: `${projectId}-m10`, title: 'Security Audit & Hardening', description: 'Conduct OWASP Top 10 assessment, fix vulnerabilities, and implement rate limiting', weekNumber: 10, state: MilestoneState.Pending },
      ],
    },
    {
      label: PhaseLabel.VivaDefense,
      weekRange: 'Weeks 11–12',
      milestones: [
        { id: `${projectId}-m11`, title: 'Documentation & IEEE Synopsis', description: 'Author comprehensive project documentation, IEEE-format synopsis, and user manual', weekNumber: 11, state: MilestoneState.Pending },
        { id: `${projectId}-m12`, title: 'Viva Voce Preparation', description: 'Prepare defense presentation, practice Q&A responses, and rehearse live system demonstration', weekNumber: 12, state: MilestoneState.Pending },
      ],
    },
  ];

  return {
    projectId,
    phases,
    totalMilestones: 12,
    completedMilestones: 0,
  };
}

/**
 * Generates default viva voce defense questions for a project blueprint.
 *
 * @param blueprint - The project blueprint to generate questions for
 * @returns A DefenseContract with context-aware viva questions
 */
export function generateDefaultDefense(blueprint: BlueprintContract): DefenseContract {
  const questions = [
    {
      id: `${blueprint.id}-q1`,
      question: `What is the core problem that "${blueprint.title}" aims to solve, and why is it significant in the ${blueprint.targetDomain} domain?`,
      modelAnswer: `${blueprint.title} addresses a critical gap in ${blueprint.targetDomain} by ${blueprint.abstract.substring(0, 200)}. The significance lies in its potential to automate and optimize workflows that currently require extensive manual effort, reducing turnaround time while improving accuracy and consistency of outcomes.`,
      difficulty: QuestionDifficulty.Foundational,
      category: QuestionCategory.Methodology,
      scoringRubric: 'Clear problem articulation (3pts), domain significance (3pts), impact quantification (4pts)',
      isRevealed: false,
    },
    {
      id: `${blueprint.id}-q2`,
      question: 'Explain the system architecture you have designed. Why did you choose this specific combination of technologies over alternatives?',
      modelAnswer: `The architecture follows a multi-tier design with ${blueprint.techStack.map(t => t.name).join(', ')} organized across ${new Set(blueprint.techStack.map(t => t.tier)).size} layers. Each technology was selected based on specific requirements: ${blueprint.techStack.slice(0, 3).map(t => `${t.name} was chosen because ${t.rationale}`).join('; ')}. Alternatives like monolithic frameworks were rejected due to scalability constraints and the need for independent component evolution.`,
      difficulty: QuestionDifficulty.Intermediate,
      category: QuestionCategory.Architecture,
      scoringRubric: 'Architecture clarity (3pts), technology justification (4pts), alternative analysis (3pts)',
      isRevealed: false,
    },
    {
      id: `${blueprint.id}-q3`,
      question: 'What novel contribution does your project make compared to existing solutions? How do you validate this novelty?',
      modelAnswer: `The project introduces a ${blueprint.novelty.toLowerCase()} approach by combining ${blueprint.features[0].name} with ${blueprint.features[1].name}. Unlike existing solutions that treat these as separate concerns, our integrated approach enables ${blueprint.features[0].description.substring(0, 100)}. Novelty is validated through comparative benchmarking against state-of-the-art baselines, with our system achieving a feasibility score of ${blueprint.feasibilityScore}/100 while offering unique capabilities not present in current tools.`,
      difficulty: QuestionDifficulty.Advanced,
      category: QuestionCategory.Innovation,
      scoringRubric: 'Novelty articulation (4pts), comparative analysis (3pts), validation methodology (3pts)',
      isRevealed: false,
    },
    {
      id: `${blueprint.id}-q4`,
      question: 'How does your system handle scalability challenges and what testing strategies ensure reliability under load?',
      modelAnswer: `Scalability is addressed at multiple levels: the ${blueprint.techStack.find(t => t.tier === StackTier.Logic)?.name ?? 'backend'} layer supports horizontal scaling through stateless service design, while the ${blueprint.techStack.find(t => t.tier === StackTier.Storage)?.name ?? 'storage'} layer uses connection pooling and query optimization. Load testing with k6 simulates concurrent users at 10x expected peak traffic. Circuit breaker patterns prevent cascade failures, and graceful degradation ensures core functionality remains available even when auxiliary services are impaired. The system targets 99.5% uptime with p95 response latency under 200ms.`,
      difficulty: QuestionDifficulty.Advanced,
      category: QuestionCategory.Scalability,
      scoringRubric: 'Scalability strategy (3pts), testing methodology (4pts), failure handling (3pts)',
      isRevealed: false,
    },
    {
      id: `${blueprint.id}-q5`,
      question: 'What ethical considerations arise from your project, and how have you addressed them in your design?',
      modelAnswer: `Key ethical considerations include data privacy, algorithmic bias, and responsible AI deployment. We implement data minimization principles, collecting only necessary information and applying anonymization where possible. Model fairness is evaluated across demographic subgroups using equalized odds metrics, with bias mitigation through stratified training data sampling. All AI-driven decisions include confidence scores and explainability features so that end users can understand and challenge automated recommendations. The system includes audit logging for accountability and complies with relevant data protection regulations.`,
      difficulty: QuestionDifficulty.Intermediate,
      category: QuestionCategory.Ethics,
      scoringRubric: 'Ethical awareness (3pts), mitigation strategies (4pts), regulatory compliance (3pts)',
      isRevealed: false,
    },
    {
      id: `${blueprint.id}-q6`,
      question: 'Describe your testing strategy. What types of tests have you implemented and what coverage have you achieved?',
      modelAnswer: `Our testing strategy spans four levels: unit tests covering individual functions and components with >80% line coverage; integration tests validating API contracts and database interactions; end-to-end tests simulating complete user workflows; and specialized tests for ML model performance including accuracy, precision, recall, and F1 metrics against held-out validation sets. We use CI/CD pipelines to run the full test suite on every commit, with automated performance regression detection. Security testing includes OWASP ZAP scanning and dependency vulnerability audits via Snyk.`,
      difficulty: QuestionDifficulty.Foundational,
      category: QuestionCategory.Testing,
      scoringRubric: 'Test strategy breadth (3pts), coverage metrics (3pts), CI/CD integration (4pts)',
      isRevealed: false,
    },
  ];

  return {
    projectId: blueprint.id,
    questions,
    totalQuestions: questions.length,
  };
}
