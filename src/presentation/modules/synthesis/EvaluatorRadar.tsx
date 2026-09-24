import React, { useMemo, useState } from 'react';
import type { BlueprintContract } from '../../../domain/contracts/blueprint.contract';
import type { DefenseContract } from '../../../domain/contracts/defense.contract';

interface EvaluatorRadarProps {
  readonly blueprint: BlueprintContract;
  readonly defense: DefenseContract | null;
}

const AXES = ['Novelty', 'Feasibility', 'Scalability', 'Defense Readiness', 'Architecture', 'Polish'];

function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function EvaluatorRadar({ blueprint, defense }: EvaluatorRadarProps): React.JSX.Element {
  const scores = useMemo(() => {
    const noveltyScore = blueprint.novelty === 'Pioneering' ? 95 : blueprint.novelty === 'Novel' ? 75 : 50;
    const baseHash = deterministicHash(blueprint.id + blueprint.targetDomain + blueprint.techStack.map(t => t.name).join(''));
    
    const scalability = 40 + (baseHash % 56);
    
    // Calculate Defense Readiness based on actual questions revealed
    let defenseReadiness = 30; // base floor
    if (defense && defense.questions.length > 0) {
      const revealed = defense.questions.filter(q => q.isRevealed).length;
      defenseReadiness = Math.round((revealed / defense.questions.length) * 100);
    }

    const architecture = 50 + ((baseHash >> 2) % 45);
    const polish = 60 + ((baseHash >> 4) % 35);

    return [
      noveltyScore,
      blueprint.feasibilityScore,
      scalability,
      defenseReadiness,
      architecture,
      polish
    ];
  }, [blueprint, defense]);

  const size = 300;
  const center = size / 2;
  const radius = 100;
  const numAxes = 6;

  const getPoint = (value: number, index: number, max = 100) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const r = (value / max) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const dataPolygon = scores.map((val, i) => {
    const p = getPoint(val, i);
    return `${p.x},${p.y}`;
  }).join(' ');

  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 style={{ color: '#F0F4F8', fontSize: '1.125rem', margin: '0 0 1.5rem 0', fontWeight: 700 }}>Metrics Radar</h3>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Draw background webs */}
        {[20, 40, 60, 80, 100].map(level => (
          <polygon
            key={`web-${level}`}
            points={AXES.map((_, i) => `${getPoint(level, i).x},${getPoint(level, i).y}`).join(' ')}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Draw axes */}
        {AXES.map((_, i) => {
          const end = getPoint(100, i);
          return (
            <line key={`axis-${i}`} x1={center} y1={center} x2={end.x} y2={end.y} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          );
        })}

        {/* Draw data polygon */}
        <polygon
          points={dataPolygon}
          fill="rgba(0, 245, 160, 0.2)"
          stroke="#00F5A0"
          strokeWidth="2"
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Draw points & interactions */}
        {scores.map((val, i) => {
          const p = getPoint(val, i);
          const isHovered = hoveredAxis === i;
          return (
            <g key={`point-${i}`} onMouseEnter={() => setHoveredAxis(i)} onMouseLeave={() => setHoveredAxis(null)}>
              <circle cx={p.x} cy={p.y} r={isHovered ? 6 : 4} fill={isHovered ? '#00D9F5' : '#00F5A0'} style={{ cursor: 'pointer', transition: 'all 0.2s' }} />
              {isHovered && (
                <text x={p.x} y={p.y - 12} fill="#FFF" fontSize="12" textAnchor="middle" fontWeight="bold">
                  {val}%
                </text>
              )}
            </g>
          );
        })}

        {/* Draw labels */}
        {AXES.map((label, i) => {
          const p = getPoint(125, i);
          return (
            <text key={`label-${i}`} x={p.x} y={p.y} fill="#94A3B8" fontSize="11" textAnchor="middle" dominantBaseline="middle" fontWeight="600">
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
