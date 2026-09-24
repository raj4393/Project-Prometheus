import React, { useState } from 'react';
import type { BlueprintContract, TechStackEntry } from '../../../domain/contracts/blueprint.contract';
import { StackTier } from '../../../domain/contracts/blueprint.contract';
import { SurfaceCard } from '../../design-system/SurfaceCard';

interface ArchitectureVisualizerProps {
  readonly blueprint: BlueprintContract;
}

const TIER_ORDER = [StackTier.Presentation, StackTier.Logic, StackTier.Storage, StackTier.AI, StackTier.DevOps];
const TIER_COLORS: Record<string, string> = {
  [StackTier.Presentation]: '#00D9F5',
  [StackTier.Logic]: '#00F5A0',
  [StackTier.Storage]: '#F59E0B',
  [StackTier.AI]: '#8B5CF6',
  [StackTier.DevOps]: '#EC4899',
};

export function ArchitectureVisualizer({ blueprint }: ArchitectureVisualizerProps): React.JSX.Element {
  const [activeNode, setActiveNode] = useState<TechStackEntry | null>(null);

  // Group tech stack by tier
  const tiers: Record<string, TechStackEntry[]> = {};
  for (const t of TIER_ORDER) tiers[t] = [];
  for (const item of blueprint.techStack) {
    if (tiers[item.tier]) {
      tiers[item.tier].push(item);
    }
  }

  // Layout parameters
  const width = 800;
  const height = 500;
  const tierWidth = width / 5;
  const nodeRadius = 30;

  const renderBezier = (x1: number, y1: number, x2: number, y2: number, color: string) => {
    const cp1x = x1 + (x2 - x1) / 2;
    return (
      <path
        d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp1x} ${y2}, ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      />
    );
  };

  return (
    <SurfaceCard ariaLabel={`Interactive Architecture for ${blueprint.title}`} as="section">
      <h3 style={{ color: '#F0F4F8', fontSize: '1.25rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>
        🌌 Dynamic System Visualizer
      </h3>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* SVG Canvas */}
        <div style={{ flex: 1, minWidth: '600px', background: 'rgba(5,7,14,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', overflowX: 'auto' }}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Draw connections first */}
            {tiers[StackTier.Presentation].map((n1, i1) => {
              const y1 = (height / (tiers[StackTier.Presentation].length + 1)) * (i1 + 1);
              return tiers[StackTier.Logic].map((n2, i2) => {
                const y2 = (height / (tiers[StackTier.Logic].length + 1)) * (i2 + 1);
                return <React.Fragment key={`edge-1-${i1}-${i2}`}>{renderBezier(tierWidth / 2, y1, tierWidth * 1.5, y2, '#00D9F5')}</React.Fragment>;
              });
            })}
            {tiers[StackTier.Logic].map((n1, i1) => {
              const y1 = (height / (tiers[StackTier.Logic].length + 1)) * (i1 + 1);
              return tiers[StackTier.Storage].map((n2, i2) => {
                const y2 = (height / (tiers[StackTier.Storage].length + 1)) * (i2 + 1);
                return <React.Fragment key={`edge-2-${i1}-${i2}`}>{renderBezier(tierWidth * 1.5, y1, tierWidth * 2.5, y2, '#00F5A0')}</React.Fragment>;
              });
            })}
            {tiers[StackTier.Logic].map((n1, i1) => {
              const y1 = (height / (tiers[StackTier.Logic].length + 1)) * (i1 + 1);
              return tiers[StackTier.AI].map((n2, i2) => {
                const y2 = (height / (tiers[StackTier.AI].length + 1)) * (i2 + 1);
                return <React.Fragment key={`edge-3-${i1}-${i2}`}>{renderBezier(tierWidth * 1.5, y1, tierWidth * 3.5, y2, '#8B5CF6')}</React.Fragment>;
              });
            })}
            {/* DevOps connects to everything conceptually, let's draw faint lines to logic */}
            {tiers[StackTier.DevOps].map((n1, i1) => {
              const y1 = (height / (tiers[StackTier.DevOps].length + 1)) * (i1 + 1);
              return tiers[StackTier.Logic].map((n2, i2) => {
                const y2 = (height / (tiers[StackTier.Logic].length + 1)) * (i2 + 1);
                return <React.Fragment key={`edge-4-${i1}-${i2}`}>{renderBezier(tierWidth * 4.5, y1, tierWidth * 1.5, y2, '#EC4899')}</React.Fragment>;
              });
            })}

            {/* Draw nodes */}
            {TIER_ORDER.map((tier, colIndex) => {
              const nodes = tiers[tier];
              const cx = tierWidth * colIndex + (tierWidth / 2);
              return nodes.map((node, rowIndex) => {
                const cy = (height / (nodes.length + 1)) * (rowIndex + 1);
                const isHovered = activeNode?.name === node.name;
                const color = TIER_COLORS[tier];
                
                return (
                  <g key={node.name} style={{ cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={() => setActiveNode(node)} onClick={() => setActiveNode(node)}>
                    <circle cx={cx} cy={cy} r={isHovered ? nodeRadius + 5 : nodeRadius} fill="rgba(5,7,14,0.8)" stroke={color} strokeWidth={isHovered ? 3 : 2} />
                    <text x={cx} y={cy - 45} fill="#F0F4F8" fontSize="12" textAnchor="middle" fontWeight={isHovered ? 'bold' : 'normal'}>
                      {node.name.length > 15 ? node.name.substring(0, 12) + '...' : node.name}
                    </text>
                    <text x={cx} y={cy} fill={color} fontSize="20" textAnchor="middle" dominantBaseline="middle">
                      {tier === StackTier.Presentation ? '🖥️' : tier === StackTier.Logic ? '⚙️' : tier === StackTier.Storage ? '💾' : tier === StackTier.AI ? '🧠' : '🚀'}
                    </text>
                  </g>
                );
              });
            })}

            {/* Draw Column Headers */}
            {TIER_ORDER.map((tier, colIndex) => (
              <text key={`header-${tier}`} x={tierWidth * colIndex + (tierWidth / 2)} y={25} fill="#64748B" fontSize="12" textAnchor="middle" fontWeight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {tier}
              </text>
            ))}
          </svg>
        </div>

        {/* Info Panel */}
        <div style={{ flex: '0 0 250px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          {activeNode ? (
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '4px', background: `${TIER_COLORS[activeNode.tier]}20`, color: TIER_COLORS[activeNode.tier] }}>
                {activeNode.tier}
              </span>
              <h4 style={{ color: '#F0F4F8', fontSize: '1.125rem', marginTop: '0.75rem', marginBottom: '0.5rem' }}>{activeNode.name}</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.6 }}>{activeNode.rationale}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
              Hover or tap on a node to inspect technical rationale.
            </div>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}
