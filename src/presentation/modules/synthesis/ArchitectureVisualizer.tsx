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
  const [simulatedFailure, setSimulatedFailure] = useState<string | null>(null);

  const getMockDetails = (node: TechStackEntry) => ({
    protocol: node.tier === StackTier.Presentation ? 'HTTPS / WebSocket' : node.tier === StackTier.Logic ? 'gRPC / REST' : 'TCP / Binary',
    sla: node.tier === StackTier.Presentation ? '99.9%' : '99.99%',
    contracts: 'JSON / Protobuf',
    mitigation: 'Implement Circuit Breaker, enable retries, and fallback to degraded functionality.'
  });

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
          <style>{`
            @keyframes pulse-red {
              0% { stroke-width: 2; opacity: 1; }
              50% { stroke-width: 6; stroke: #EF4444; opacity: 0.6; }
              100% { stroke-width: 2; opacity: 1; }
            }
            .pulse-anim { animation: pulse-red 1.2s infinite; }
          `}</style>
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
                const isFailed = simulatedFailure === node.name;
                const color = isFailed ? '#EF4444' : TIER_COLORS[tier];
                
                return (
                  <g key={node.name} style={{ cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={() => setActiveNode(node)} onClick={() => setActiveNode(node)}>
                    <circle cx={cx} cy={cy} r={isHovered ? nodeRadius + 5 : nodeRadius} fill="rgba(5,7,14,0.8)" stroke={color} strokeWidth={isHovered ? 3 : 2} className={isFailed ? 'pulse-anim' : ''} strokeDasharray={isFailed ? '4 4' : '0'} />
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

        {/* Info Panel Drawer */}
        <div style={{ flex: '0 0 280px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          {activeNode ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '4px', background: `${TIER_COLORS[activeNode.tier]}20`, color: TIER_COLORS[activeNode.tier] }}>
                  {activeNode.tier}
                </span>
                <button 
                  onClick={() => setSimulatedFailure(simulatedFailure === activeNode.name ? null : activeNode.name)}
                  style={{ background: simulatedFailure === activeNode.name ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)', color: simulatedFailure === activeNode.name ? '#EF4444' : '#CBD5E1', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.6875rem', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {simulatedFailure === activeNode.name ? 'Stop Sim' : '⚡ Simulate Failure'}
                </button>
              </div>
              <h4 style={{ color: '#F0F4F8', fontSize: '1.125rem', marginTop: '0.75rem', marginBottom: '0.5rem' }}>{activeNode.name}</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>{activeNode.rationale}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontSize: '0.625rem', color: '#64748B', textTransform: 'uppercase' }}>Protocol</div>
                  <div style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: 600 }}>{getMockDetails(activeNode).protocol}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.625rem', color: '#64748B', textTransform: 'uppercase' }}>Target SLA</div>
                  <div style={{ fontSize: '0.75rem', color: '#00F5A0', fontWeight: 600 }}>{getMockDetails(activeNode).sla}</div>
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.625rem', color: '#64748B', textTransform: 'uppercase' }}>Data Contracts</div>
                  <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>{getMockDetails(activeNode).contracts}</div>
                </div>
              </div>

              {simulatedFailure === activeNode.name && (
                <div style={{ padding: '0.75rem', border: '1px solid #EF4444', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', animation: 'pulse-red 2s infinite' }}>
                  <h5 style={{ color: '#EF4444', margin: '0 0 0.5rem 0', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    🚨 504 Timeout / Eviction
                  </h5>
                  <p style={{ color: '#F87171', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>
                    <strong>Mitigation:</strong> {getMockDetails(activeNode).mitigation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
              Tap on any node to inspect technical specs or run chaos simulations.
            </div>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}
