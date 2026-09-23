import React from 'react';
/**
 * @module SprintChecklist
 * @description Checkable 12-week sprint checklist with dynamic completion math,
 * progress bar, and phase-based grouping. Milestone states persist to localStorage.
 */

import { useCallback, useState } from 'react';
import type { RoadmapContract } from '../../../domain/contracts/roadmap.contract';
import { MilestoneState, computeCompletionPercentage } from '../../../domain/contracts/roadmap.contract';
import { SurfaceCard } from '../../design-system/SurfaceCard';

/**
 * Props for the SprintChecklist component.
 *
 * @property roadmap - The roadmap contract with phases and milestones
 * @property onToggleMilestone - Callback when a milestone checkbox is toggled
 */
interface SprintChecklistProps {
  readonly roadmap: RoadmapContract;
  readonly onToggleMilestone: (milestoneId: string) => void;
}

/**
 * Phase color configuration for visual differentiation.
 */
const PHASE_COLORS: ReadonlyArray<string> = ['#00D9F5', '#00F5A0', '#F59E0B', '#8B5CF6'];

/**
 * A checkable 12-week sprint checklist organized by phase.
 * Toggling milestones immediately updates the progress bar
 * and persists state to localStorage.
 *
 * @param props - Component configuration
 * @returns The rendered sprint checklist with progress bar
 */
export function SprintChecklist({ roadmap, onToggleMilestone }: SprintChecklistProps): React.JSX.Element {
  const percentage = computeCompletionPercentage(
    roadmap.completedMilestones,
    roadmap.totalMilestones
  );

  const handleToggle = useCallback(
    (milestoneId: string) => {
      onToggleMilestone(milestoneId);
    },
    [onToggleMilestone]
  );

  const [viewMode, setViewMode] = useState<'checklist' | 'gantt'>('checklist');

  return (
    <SurfaceCard ariaLabel="12-week sprint checklist" as="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: '#F0F4F8', fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
          📋 12-Week Development Roadmap
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setViewMode('checklist')}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', background: viewMode === 'checklist' ? 'rgba(0, 217, 245, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: viewMode === 'checklist' ? '#00D9F5' : '#94A3B8', border: 'none', cursor: 'pointer' }}>
            Checklist
          </button>
          <button 
            onClick={() => setViewMode('gantt')}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', background: viewMode === 'gantt' ? 'rgba(0, 217, 245, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: viewMode === 'gantt' ? '#00D9F5' : '#94A3B8', border: 'none', cursor: 'pointer' }}>
            Gantt Timeline
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>Overall Progress</span>
          <span style={{ color: '#00F5A0', fontWeight: 700, fontSize: '0.9375rem', fontVariantNumeric: 'tabular-nums' }}>
            {percentage}%
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Roadmap progress: ${percentage}%`}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00F5A0, #00D9F5)',
              borderRadius: '4px',
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: percentage > 0 ? '0 0 12px rgba(0, 245, 160, 0.4)' : 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
          <span style={{ color: '#64748B', fontSize: '0.75rem' }}>
            {roadmap.completedMilestones} of {roadmap.totalMilestones} milestones
          </span>
        </div>
      </div>

      {/* Phase checklist or Gantt */}
      {viewMode === 'checklist' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {roadmap.phases.map((phase, phaseIndex) => {
          const phaseColor = PHASE_COLORS[phaseIndex] ?? '#CBD5E1';
          const phaseCompleted = phase.milestones.filter(
            (m) => m.state === MilestoneState.Completed
          ).length;

          return (
            <div key={phase.label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '4px',
                    height: '20px',
                    borderRadius: '2px',
                    background: phaseColor,
                    boxShadow: `0 0 8px ${phaseColor}40`,
                  }}
                  aria-hidden="true"
                />
                <div>
                  <h4 style={{ color: phaseColor, fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                    {phase.label}
                  </h4>
                  <span style={{ color: '#64748B', fontSize: '0.6875rem' }}>
                    {phase.weekRange} · {phaseCompleted}/{phase.milestones.length} done
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem' }}>
                {phase.milestones.map((milestone) => {
                  const isCompleted = milestone.state === MilestoneState.Completed;
                  return (
                    <label
                      key={milestone.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        background: isCompleted ? 'rgba(0, 245, 160, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                        border: isCompleted
                          ? '1px solid rgba(0, 245, 160, 0.15)'
                          : '1px solid rgba(255, 255, 255, 0.04)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleToggle(milestone.id)}
                        aria-label={`Mark "${milestone.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
                        style={{
                          width: '18px',
                          height: '18px',
                          marginTop: '2px',
                          accentColor: '#00F5A0',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: isCompleted ? '#00F5A0' : '#F0F4F8',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          opacity: isCompleted ? 0.8 : 1,
                        }}>
                          <span style={{ color: '#64748B', fontWeight: 400, marginRight: '0.5rem' }}>
                            Week {milestone.weekNumber}
                          </span>
                          {milestone.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem', lineHeight: 1.4 }}>
                          {milestone.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {roadmap.phases.map((phase, phaseIndex) => {
            const phaseColor = PHASE_COLORS[phaseIndex] ?? '#CBD5E1';
            return (
              <div key={phase.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ color: phaseColor, margin: 0, fontSize: '0.875rem' }}>{phase.label}</h4>
                <div style={{ display: 'flex', gap: '1rem', minWidth: 'max-content' }}>
                  {phase.milestones.map(milestone => {
                    const isCompleted = milestone.state === MilestoneState.Completed;
                    return (
                      <div key={milestone.id} onClick={() => handleToggle(milestone.id)} style={{
                        width: '200px', padding: '1rem', background: isCompleted ? 'rgba(0, 245, 160, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        borderLeft: `4px solid ${isCompleted ? '#00F5A0' : phaseColor}`, borderRadius: '4px', cursor: 'pointer',
                        opacity: isCompleted ? 0.7 : 1
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.25rem' }}>Week {milestone.weekNumber}</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: isCompleted ? '#00F5A0' : '#F0F4F8' }}>{milestone.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SurfaceCard>
  );
}
