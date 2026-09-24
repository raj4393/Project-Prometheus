import React from 'react';
import type { BlueprintContract } from '../../../domain/contracts/blueprint.contract';
import type { RoadmapContract } from '../../../domain/contracts/roadmap.contract';
import type { DefenseContract } from '../../../domain/contracts/defense.contract';
import { MilestoneState } from '../../../domain/contracts/roadmap.contract';

interface AcademicRubricProps {
  readonly blueprint: BlueprintContract;
  readonly roadmap: RoadmapContract | null;
  readonly defense: DefenseContract | null;
}

export function AcademicRubric({ blueprint, roadmap, defense }: AcademicRubricProps): React.JSX.Element {
  // Review 0: Ideation & Feasibility
  let review0Score = blueprint.feasibilityScore;
  if (blueprint.novelty === 'Pioneering') review0Score += 10;
  if (blueprint.novelty === 'Novel') review0Score += 5;
  review0Score = Math.min(100, Math.max(0, review0Score));

  // Review 1: Architecture & Roadmap
  let review1Score = 0;
  if (roadmap) {
    const totalMilestones = roadmap.totalMilestones || 1;
    const completedMilestones = roadmap.completedMilestones || 0;
    review1Score = Math.round((completedMilestones / totalMilestones) * 100);
  }

  // Final Viva: Defense Readiness
  let vivaScore = 0;
  if (defense) {
    const totalQuestions = defense.questions.length || 1;
    const revealedQuestions = defense.questions.filter(q => q.isRevealed).length;
    vivaScore = Math.round((revealedQuestions / totalQuestions) * 100);
  }

  const overallReadiness = Math.round((review0Score + review1Score + vivaScore) / 3);

  const getStatusColor = (score: number) => {
    if (score >= 80) return '#00F5A0';
    if (score >= 50) return '#00D9F5';
    return '#F59E0B';
  };

  return (
    <div style={{ background: 'rgba(5, 7, 14, 0.6)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <h3 style={{ color: '#F0F4F8', fontSize: '1rem', margin: '0 0 1rem 0' }}>🎓 Academic Evaluation Rubric</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
            <span style={{ color: '#94A3B8' }}>Review 0 (Ideation)</span>
            <span style={{ color: getStatusColor(review0Score), fontWeight: 'bold' }}>{review0Score}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${review0Score}%`, height: '100%', background: getStatusColor(review0Score), transition: 'width 0.5s ease' }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
            <span style={{ color: '#94A3B8' }}>Review 1 (Execution)</span>
            <span style={{ color: getStatusColor(review1Score), fontWeight: 'bold' }}>{review1Score}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${review1Score}%`, height: '100%', background: getStatusColor(review1Score), transition: 'width 0.5s ease' }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
            <span style={{ color: '#94A3B8' }}>Final Viva (Defense)</span>
            <span style={{ color: getStatusColor(vivaScore), fontWeight: 'bold' }}>{vivaScore}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${vivaScore}%`, height: '100%', background: getStatusColor(vivaScore), transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
        <div style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Readiness</div>
        <div style={{ color: getStatusColor(overallReadiness), fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
          {overallReadiness}%
        </div>
      </div>
    </div>
  );
}
