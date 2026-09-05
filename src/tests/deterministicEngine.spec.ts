/**
 * @module DeterministicEngineSpec
 * @description Pure functional synthesis and edge-case unit tests
 * for the deterministic fallback engine.
 */

import { describe, it, expect } from 'vitest';
import { synthesizeProject } from '../infrastructure/ai/deterministicFallback';
import { SkillTag, ProficiencyLevel, DomainPillar, TimeFrame, AmbitionLevel } from '../domain/contracts/student.contract';
import type { StudentProfile } from '../domain/contracts/student.contract';

describe('synthesizeProject', () => {
  it('should produce a valid blueprint with all required fields', () => {
    const profile: StudentProfile = {
      studentName: 'Alice',
      skills: [
        { tag: SkillTag.Python, proficiency: ProficiencyLevel.Advanced },
        { tag: SkillTag.PyTorch, proficiency: ProficiencyLevel.Intermediate },
        { tag: SkillTag.React, proficiency: ProficiencyLevel.Intermediate },
      ],
      domains: [DomainPillar.HealthTech],
      timeFrame: TimeFrame.TwelveWeeks,
      ambition: AmbitionLevel.Ambitious,
      teamSize: 2,
    };

    const blueprint = synthesizeProject(profile);

    expect(blueprint).toBeDefined();
    expect(blueprint.id).toBeTruthy();
    expect(blueprint.slug).toBeTruthy();
    expect(blueprint.title).toBeTruthy();
    expect(blueprint.abstract).toBeTruthy();
    expect(blueprint.abstract.length).toBeGreaterThan(50);
    expect(blueprint.techStack.length).toBeGreaterThanOrEqual(4);
    expect(blueprint.features.length).toBeGreaterThanOrEqual(3);
    expect(blueprint.improvements.length).toBeGreaterThanOrEqual(1);
    expect(blueprint.targetDomain).toBe('HealthTech');
    expect(blueprint.estimatedWeeks).toBe(12);
  });

  it('should produce a feasibility score between 0 and 100', () => {
    const profile: StudentProfile = {
      studentName: 'Bob',
      skills: [
        { tag: SkillTag.JavaScript, proficiency: ProficiencyLevel.Expert },
        { tag: SkillTag.Docker, proficiency: ProficiencyLevel.Advanced },
      ],
      domains: [DomainPillar.Cybersecurity],
      timeFrame: TimeFrame.EightWeeks,
      ambition: AmbitionLevel.Practical,
      teamSize: 1,
    };

    const blueprint = synthesizeProject(profile);

    expect(blueprint.feasibilityScore).toBeGreaterThanOrEqual(0);
    expect(blueprint.feasibilityScore).toBeLessThanOrEqual(100);
    expect(Number.isInteger(blueprint.feasibilityScore)).toBe(true);
  });

  it('should gracefully handle an empty skill set', () => {
    const profile: StudentProfile = {
      studentName: 'Charlie',
      skills: [],
      domains: [DomainPillar.GreenAI],
      timeFrame: TimeFrame.FourWeeks,
      ambition: AmbitionLevel.Practical,
      teamSize: 1,
    };

    const blueprint = synthesizeProject(profile);

    expect(blueprint).toBeDefined();
    expect(blueprint.title).toBeTruthy();
    expect(blueprint.abstract).toBeTruthy();
    expect(blueprint.feasibilityScore).toBeGreaterThanOrEqual(0);
    expect(blueprint.feasibilityScore).toBeLessThanOrEqual(100);
    // Should still have a tech stack with default entries
    expect(blueprint.techStack.length).toBeGreaterThanOrEqual(3);
  });

  it('should produce different titles for different domains', () => {
    const baseProfile: Omit<StudentProfile, 'domains'> = {
      studentName: 'Diana',
      skills: [{ tag: SkillTag.Python, proficiency: ProficiencyLevel.Intermediate }],
      timeFrame: TimeFrame.TwelveWeeks,
      ambition: AmbitionLevel.Ambitious,
      teamSize: 1,
    };

    const healthBlueprint = synthesizeProject({
      ...baseProfile,
      domains: [DomainPillar.HealthTech],
    });

    const cyberBlueprint = synthesizeProject({
      ...baseProfile,
      domains: [DomainPillar.Cybersecurity],
    });

    expect(healthBlueprint.title).not.toBe(cyberBlueprint.title);
    expect(healthBlueprint.targetDomain).toBe('HealthTech');
    expect(cyberBlueprint.targetDomain).toBe('Cybersecurity');
  });

  it('should assign higher feasibility for Expert-level skills', () => {
    const expertProfile: StudentProfile = {
      studentName: 'Expert Eve',
      skills: [
        { tag: SkillTag.Python, proficiency: ProficiencyLevel.Expert },
        { tag: SkillTag.React, proficiency: ProficiencyLevel.Expert },
        { tag: SkillTag.Docker, proficiency: ProficiencyLevel.Expert },
      ],
      domains: [DomainPillar.EdTech],
      timeFrame: TimeFrame.TwelveWeeks,
      ambition: AmbitionLevel.Practical,
      teamSize: 3,
    };

    const beginnerProfile: StudentProfile = {
      studentName: 'Beginner Ben',
      skills: [
        { tag: SkillTag.Python, proficiency: ProficiencyLevel.Beginner },
      ],
      domains: [DomainPillar.EdTech],
      timeFrame: TimeFrame.TwelveWeeks,
      ambition: AmbitionLevel.Moonshot,
      teamSize: 1,
    };

    const expertBlueprint = synthesizeProject(expertProfile);
    const beginnerBlueprint = synthesizeProject(beginnerProfile);

    expect(expertBlueprint.feasibilityScore).toBeGreaterThan(beginnerBlueprint.feasibilityScore);
  });

  it('should generate valid slug from the title', () => {
    const profile: StudentProfile = {
      studentName: 'Frank',
      skills: [{ tag: SkillTag.TypeScript, proficiency: ProficiencyLevel.Advanced }],
      domains: [DomainPillar.FinTech],
      timeFrame: TimeFrame.TwelveWeeks,
      ambition: AmbitionLevel.Ambitious,
      teamSize: 1,
    };

    const blueprint = synthesizeProject(profile);

    expect(blueprint.slug).toMatch(/^[a-z0-9-]+$/);
    expect(blueprint.slug.length).toBeGreaterThan(0);
    expect(blueprint.slug.length).toBeLessThanOrEqual(60);
  });

  it('should set novelty based on ambition level', () => {
    const moonshot: StudentProfile = {
      studentName: 'Grace',
      skills: [{ tag: SkillTag.Rust, proficiency: ProficiencyLevel.Advanced }],
      domains: [DomainPillar.CyberPhysical],
      timeFrame: TimeFrame.SixteenWeeks,
      ambition: AmbitionLevel.Moonshot,
      teamSize: 2,
    };

    const practical: StudentProfile = {
      ...moonshot,
      ambition: AmbitionLevel.Practical,
    };

    expect(synthesizeProject(moonshot).novelty).toBe('Pioneering');
    expect(synthesizeProject(practical).novelty).toBe('Incremental');
  });
});
