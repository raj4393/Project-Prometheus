/**
 * @module ProjectReducer
 * @description Pure reducer managing the active student profile, generated blueprint,
 * roadmap milestone checkmarks, defense question reveals, and engine status.
 * All state transitions are immutable and deterministic.
 */

import type { StudentProfile } from '../../domain/contracts/student.contract';
import type { BlueprintContract } from '../../domain/contracts/blueprint.contract';
import type { RoadmapContract } from '../../domain/contracts/roadmap.contract';
import type { DefenseContract } from '../../domain/contracts/defense.contract';
import { MilestoneState, computeCompletionPercentage } from '../../domain/contracts/roadmap.contract';

/**
 * Engine connection status for the AI synthesis service.
 */
export enum EngineStatus {
  Idle = 'Idle',
  Connecting = 'Connecting',
  Online = 'Online',
  Fallback = 'Fallback',
  Error = 'Error',
}

/**
 * Active navigation tab in the main interface.
 */
export type ActiveTab = 'intake' | 'blueprint' | 'roadmap' | 'defense';

/**
 * Complete application state contract.
 *
 * @property profile - The current student profile (null if not yet submitted)
 * @property blueprint - The active project blueprint (null if not yet generated)
 * @property roadmap - The active roadmap (null if not yet generated)
 * @property defense - The active defense simulation (null if not yet generated)
 * @property engineStatus - Current AI engine connection status
 * @property activeTab - Currently displayed navigation tab
 * @property isGenerating - Whether a project generation is in progress
 * @property presetBlueprints - Pre-loaded blueprint collection for dashboard display
 */
export interface AppState {
  readonly profile: StudentProfile | null;
  readonly blueprint: BlueprintContract | null;
  readonly roadmap: RoadmapContract | null;
  readonly defense: DefenseContract | null;
  readonly engineStatus: EngineStatus;
  readonly activeTab: ActiveTab;
  readonly isGenerating: boolean;
  readonly isAudioEnabled: boolean;
  readonly presetBlueprints: ReadonlyArray<BlueprintContract>;
}

/**
 * Discriminated union of all actions supported by the project reducer.
 */
export type AppAction =
  | { readonly type: 'SET_PROFILE'; readonly payload: StudentProfile }
  | { readonly type: 'SET_BLUEPRINT'; readonly payload: BlueprintContract }
  | { readonly type: 'SET_ROADMAP'; readonly payload: RoadmapContract }
  | { readonly type: 'SET_DEFENSE'; readonly payload: DefenseContract }
  | { readonly type: 'TOGGLE_MILESTONE'; readonly payload: string }
  | { readonly type: 'TOGGLE_QUESTION_REVEAL'; readonly payload: string }
  | { readonly type: 'SET_ENGINE_STATUS'; readonly payload: EngineStatus }
  | { readonly type: 'SET_ACTIVE_TAB'; readonly payload: ActiveTab }
  | { readonly type: 'SET_GENERATING'; readonly payload: boolean }
  | { readonly type: 'LOAD_PRESETS'; readonly payload: ReadonlyArray<BlueprintContract> }
  | { readonly type: 'SELECT_PRESET'; readonly payload: BlueprintContract }
  | { readonly type: 'TOGGLE_AUDIO' }
  | { readonly type: 'RESET' };

/**
 * localStorage key for persisting roadmap milestone states.
 */
const ROADMAP_STORAGE_KEY = 'prometheus_roadmap_state';

/**
 * Persists roadmap milestone completion states to localStorage.
 *
 * @param roadmap - The roadmap to persist
 */
function persistRoadmap(roadmap: RoadmapContract): void {
  try {
    const milestoneStates: Record<string, MilestoneState> = {};
    for (const phase of roadmap.phases) {
      for (const milestone of phase.milestones) {
        milestoneStates[milestone.id] = milestone.state;
      }
    }
    localStorage.setItem(
      `${ROADMAP_STORAGE_KEY}_${roadmap.projectId}`,
      JSON.stringify(milestoneStates)
    );
  } catch {
    // localStorage unavailable in test environments — silently continue
  }
}

/**
 * Loads persisted milestone states from localStorage.
 *
 * @param projectId - The project ID to load milestone states for
 * @returns Record of milestone ID to state, or null if not found
 */
export function loadPersistedMilestones(projectId: string): Record<string, MilestoneState> | null {
  try {
    const stored = localStorage.getItem(`${ROADMAP_STORAGE_KEY}_${projectId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, MilestoneState>;
      }
    }
  } catch {
    // localStorage unavailable — return null
  }
  return null;
}

/**
 * Pure reducer function managing all application state transitions.
 * Handles profile updates, blueprint generation, milestone toggling,
 * question reveals, and engine status changes.
 *
 * @param state - The current application state
 * @param action - The dispatched action
 * @returns The new application state after applying the action
 * @throws Never — unrecognized actions return current state unchanged
 */
export function projectReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };

    case 'SET_BLUEPRINT':
      return { ...state, blueprint: action.payload };

    case 'SET_ROADMAP':
      return { ...state, roadmap: action.payload };

    case 'SET_DEFENSE':
      return { ...state, defense: action.payload };

    case 'TOGGLE_MILESTONE': {
      if (!state.roadmap) return state;
      const milestoneId = action.payload;
      let completedCount = 0;
      const updatedPhases = state.roadmap.phases.map((phase) => ({
        ...phase,
        milestones: phase.milestones.map((m) => {
          const newState =
            m.id === milestoneId
              ? m.state === MilestoneState.Completed
                ? MilestoneState.Pending
                : MilestoneState.Completed
              : m.state;
          if (newState === MilestoneState.Completed) {
            completedCount++;
          }
          return { ...m, state: newState };
        }),
      }));

      const newRoadmap: RoadmapContract = {
        ...state.roadmap,
        phases: updatedPhases,
        completedMilestones: completedCount,
      };
      persistRoadmap(newRoadmap);
      return { ...state, roadmap: newRoadmap };
    }

    case 'TOGGLE_QUESTION_REVEAL': {
      if (!state.defense) return state;
      const questionId = action.payload;
      return {
        ...state,
        defense: {
          ...state.defense,
          questions: state.defense.questions.map((q) =>
            q.id === questionId ? { ...q, isRevealed: !q.isRevealed } : q
          ),
        },
      };
    }

    case 'SET_ENGINE_STATUS':
      return { ...state, engineStatus: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };

    case 'LOAD_PRESETS':
      return { ...state, presetBlueprints: action.payload };

    case 'SELECT_PRESET':
      return { ...state, blueprint: action.payload, activeTab: 'blueprint' };

    case 'TOGGLE_AUDIO':
      return { ...state, isAudioEnabled: !state.isAudioEnabled };

    case 'RESET':
      return {
        ...state,
        profile: null,
        blueprint: null,
        roadmap: null,
        defense: null,
        activeTab: 'intake',
        isGenerating: false,
        isAudioEnabled: false,
      };

    default:
      return state;
  }
}

/**
 * Computes the overall completion percentage from the current roadmap.
 *
 * @param roadmap - The roadmap to compute completion for
 * @returns Percentage between 0 and 100, or 0 if no roadmap exists
 */
export function getCompletionPercentage(roadmap: RoadmapContract | null): number {
  if (!roadmap) return 0;
  return computeCompletionPercentage(roadmap.completedMilestones, roadmap.totalMilestones);
}
