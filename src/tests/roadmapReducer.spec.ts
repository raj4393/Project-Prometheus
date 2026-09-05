/**
 * @module RoadmapReducerSpec
 * @description Milestone state transitions & completion arithmetic tests
 * for the project reducer's roadmap management.
 */

import { describe, it, expect } from 'vitest';
import { projectReducer, type AppState, EngineStatus } from '../core/state/projectReducer';
import { computeCompletionPercentage, MilestoneState, PhaseLabel } from '../domain/contracts/roadmap.contract';
import type { RoadmapContract } from '../domain/contracts/roadmap.contract';

/** Helper to create a test roadmap with n milestones */
function createTestRoadmap(totalMilestones: number, completedCount: number = 0): RoadmapContract {
  const milestones = Array.from({ length: totalMilestones }, (_, i) => ({
    id: `test-m${i + 1}`,
    title: `Milestone ${i + 1}`,
    description: `Description for milestone ${i + 1}`,
    weekNumber: i + 1,
    state: i < completedCount ? MilestoneState.Completed : MilestoneState.Pending,
  }));

  return {
    projectId: 'test-project',
    phases: [
      {
        label: PhaseLabel.Architecture,
        weekRange: 'Weeks 1-3',
        milestones: milestones.slice(0, Math.min(3, totalMilestones)),
      },
      {
        label: PhaseLabel.CoreMVP,
        weekRange: 'Weeks 4-7',
        milestones: milestones.slice(3, Math.min(7, totalMilestones)),
      },
      {
        label: PhaseLabel.StressTesting,
        weekRange: 'Weeks 8-10',
        milestones: milestones.slice(7, Math.min(10, totalMilestones)),
      },
      {
        label: PhaseLabel.VivaDefense,
        weekRange: 'Weeks 11-12',
        milestones: milestones.slice(10, totalMilestones),
      },
    ].filter((p) => p.milestones.length > 0),
    totalMilestones,
    completedMilestones: completedCount,
  };
}

/** Create a base AppState for testing */
function createBaseState(roadmap: RoadmapContract | null = null): AppState {
  return {
    profile: null,
    blueprint: null,
    roadmap,
    defense: null,
    engineStatus: EngineStatus.Idle,
    activeTab: 'roadmap',
    isGenerating: false,
    isAudioEnabled: false,
    presetBlueprints: [],
  };
}

describe('computeCompletionPercentage', () => {
  it('should return 0% when 0 of 12 milestones are completed', () => {
    expect(computeCompletionPercentage(0, 12)).toBe(0);
  });

  it('should return 50% when 6 of 12 milestones are completed', () => {
    expect(computeCompletionPercentage(6, 12)).toBe(50);
  });

  it('should return 100% when 12 of 12 milestones are completed', () => {
    expect(computeCompletionPercentage(12, 12)).toBe(100);
  });

  it('should return 0% when total is 0 (edge case)', () => {
    expect(computeCompletionPercentage(0, 0)).toBe(0);
  });

  it('should return 0% when total is negative (edge case)', () => {
    expect(computeCompletionPercentage(5, -1)).toBe(0);
  });

  it('should handle fractional percentages with one decimal', () => {
    // 1/3 = 33.333...% → rounds to 33.3
    expect(computeCompletionPercentage(1, 3)).toBe(33.3);
  });

  it('should handle 1 of 12 milestones', () => {
    // 1/12 = 8.333...% → rounds to 8.3
    expect(computeCompletionPercentage(1, 12)).toBe(8.3);
  });
});

describe('projectReducer — TOGGLE_MILESTONE', () => {
  it('should toggle a pending milestone to completed', () => {
    const roadmap = createTestRoadmap(12, 0);
    const state = createBaseState(roadmap);

    const newState = projectReducer(state, {
      type: 'TOGGLE_MILESTONE',
      payload: 'test-m1',
    });

    expect(newState.roadmap).not.toBeNull();
    const milestone = newState.roadmap!.phases[0]!.milestones.find((m) => m.id === 'test-m1');
    expect(milestone?.state).toBe(MilestoneState.Completed);
    expect(newState.roadmap!.completedMilestones).toBe(1);
  });

  it('should toggle a completed milestone back to pending', () => {
    const roadmap = createTestRoadmap(12, 1);
    const state = createBaseState(roadmap);

    const newState = projectReducer(state, {
      type: 'TOGGLE_MILESTONE',
      payload: 'test-m1',
    });

    const milestone = newState.roadmap!.phases[0]!.milestones.find((m) => m.id === 'test-m1');
    expect(milestone?.state).toBe(MilestoneState.Pending);
    expect(newState.roadmap!.completedMilestones).toBe(0);
  });

  it('should correctly count completed milestones after multiple toggles', () => {
    const roadmap = createTestRoadmap(12, 0);
    let state = createBaseState(roadmap);

    // Toggle 3 milestones to completed
    state = projectReducer(state, { type: 'TOGGLE_MILESTONE', payload: 'test-m1' });
    state = projectReducer(state, { type: 'TOGGLE_MILESTONE', payload: 'test-m2' });
    state = projectReducer(state, { type: 'TOGGLE_MILESTONE', payload: 'test-m3' });

    expect(state.roadmap!.completedMilestones).toBe(3);

    // Toggle one back
    state = projectReducer(state, { type: 'TOGGLE_MILESTONE', payload: 'test-m2' });
    expect(state.roadmap!.completedMilestones).toBe(2);
  });

  it('should return unchanged state when roadmap is null', () => {
    const state = createBaseState(null);
    const newState = projectReducer(state, {
      type: 'TOGGLE_MILESTONE',
      payload: 'nonexistent',
    });

    expect(newState).toBe(state);
  });
});
