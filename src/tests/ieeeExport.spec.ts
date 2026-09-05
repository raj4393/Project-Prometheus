/**
 * @module IEEEExportSpec
 * @description Blob generation, formatting, and markdown structure tests
 * for the IEEE Synopsis exporter.
 */

import { describe, it, expect } from 'vitest';
import { generateIEEEMarkdown } from '../infrastructure/serialization/ieeeMarkdownExporter';
import { NoveltyFactor, StackTier } from '../domain/contracts/blueprint.contract';
import type { BlueprintContract } from '../domain/contracts/blueprint.contract';
import type { RoadmapContract } from '../domain/contracts/roadmap.contract';
import { MilestoneState, PhaseLabel } from '../domain/contracts/roadmap.contract';

/** Test blueprint fixture */
const TEST_BLUEPRINT: BlueprintContract = {
  id: 'test-001',
  slug: 'test-project',
  title: 'Test Capstone Project',
  abstract: 'This is a comprehensive test abstract for validating the IEEE markdown export format. It should appear correctly in the generated document.',
  novelty: NoveltyFactor.Novel,
  feasibilityScore: 85,
  techStack: [
    { tier: StackTier.Presentation, name: 'React', rationale: 'Component-based UI' },
    { tier: StackTier.Logic, name: 'FastAPI', rationale: 'Async Python backend' },
    { tier: StackTier.AI, name: 'PyTorch', rationale: 'Deep learning framework' },
    { tier: StackTier.Storage, name: 'PostgreSQL', rationale: 'Relational database' },
  ],
  features: [
    { name: 'Feature Alpha', description: 'First feature description', priority: 1 },
    { name: 'Feature Beta', description: 'Second feature description', priority: 2 },
  ],
  improvements: [
    { title: 'Improvement One', description: 'First improvement', impact: 'High' },
  ],
  targetDomain: 'EdTech',
  estimatedWeeks: 12,
};

/** Test roadmap fixture */
const TEST_ROADMAP: RoadmapContract = {
  projectId: 'test-001',
  phases: [
    {
      label: PhaseLabel.Architecture,
      weekRange: 'Weeks 1-3',
      milestones: [
        { id: 'm1', title: 'Requirements', description: 'Gather requirements', weekNumber: 1, state: MilestoneState.Completed },
        { id: 'm2', title: 'Design', description: 'System design', weekNumber: 2, state: MilestoneState.Pending },
      ],
    },
  ],
  totalMilestones: 2,
  completedMilestones: 1,
};

describe('generateIEEEMarkdown', () => {
  it('should include the project title as H1 heading', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, null, 'Test Student');
    expect(markdown).toContain('# Test Capstone Project');
  });

  it('should include the Abstract section with H1 heading', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, null, 'Test Student');
    expect(markdown).toContain('# Abstract');
    expect(markdown).toContain(TEST_BLUEPRINT.abstract);
  });

  it('should include the System Architecture section with H2 heading', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, null, 'Test Student');
    expect(markdown).toContain('## System Architecture');
  });

  it('should include the Core Features section with H2 heading', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, null, 'Test Student');
    expect(markdown).toContain('## Core Features');
  });

  it('should include the Future Improvements section with H2 heading', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, null, 'Test Student');
    expect(markdown).toContain('## Future Improvements');
  });

  it('should include the author name', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, null, 'Jane Doe');
    expect(markdown).toContain('**Author:** Jane Doe');
  });

  it('should include feasibility score and novelty factor', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, null, 'Student');
    expect(markdown).toContain('**Feasibility Score:** 85/100');
    expect(markdown).toContain('**Novelty Factor:** Novel');
  });

  it('should render tech stack as a table', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, null, 'Student');
    expect(markdown).toContain('| Tier | Technology | Rationale |');
    expect(markdown).toContain('| Presentation | React | Component-based UI |');
    expect(markdown).toContain('| Logic | FastAPI | Async Python backend |');
  });

  it('should include all features with their descriptions', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, null, 'Student');
    expect(markdown).toContain('Feature Alpha');
    expect(markdown).toContain('First feature description');
    expect(markdown).toContain('Feature Beta');
    expect(markdown).toContain('Second feature description');
  });

  it('should include roadmap progress when roadmap is provided', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, TEST_ROADMAP, 'Student');
    expect(markdown).toContain('## Development Progress');
    expect(markdown).toContain('1/2 milestones');
    expect(markdown).toContain('✅');
    expect(markdown).toContain('⬜');
  });

  it('should omit roadmap section when roadmap is null', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, null, 'Student');
    expect(markdown).not.toContain('## Development Progress');
  });

  it('should include the footer signature', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, null, 'Student');
    expect(markdown).toContain('Project Prometheus');
  });

  it('should use "Student" as default author when name is empty', () => {
    const markdown = generateIEEEMarkdown(TEST_BLUEPRINT, null, '');
    expect(markdown).toContain('**Author:** Student');
  });
});
