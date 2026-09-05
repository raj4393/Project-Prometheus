import React from 'react';
/**
 * @module ArchitectureTopology
 * @description Tiered technical stack renderer that displays the project's
 * technology choices organized by architecture layer.
 */

import type { BlueprintContract, TechStackEntry } from '../../../domain/contracts/blueprint.contract';
import { StackTier } from '../../../domain/contracts/blueprint.contract';
import { SurfaceCard } from '../../design-system/SurfaceCard';

/**
 * Props for the ArchitectureTopology component.
 *
 * @property blueprint - The project blueprint containing the tech stack
 */
interface ArchitectureTopologyProps {
  readonly blueprint: BlueprintContract;
}

/**
 * Visual configuration per stack tier.
 */
const TIER_CONFIG: Record<StackTier, { icon: string; color: string; label: string }> = {
  [StackTier.Presentation]: { icon: '🖥️', color: '#00D9F5', label: 'Presentation Layer' },
  [StackTier.Logic]: { icon: '⚙️', color: '#00F5A0', label: 'Logic Layer' },
  [StackTier.AI]: { icon: '🧠', color: '#8B5CF6', label: 'AI/ML Layer' },
  [StackTier.Storage]: { icon: '💾', color: '#F59E0B', label: 'Storage Layer' },
  [StackTier.DevOps]: { icon: '🚀', color: '#EC4899', label: 'DevOps Layer' },
};

/**
 * Groups tech stack entries by their tier.
 *
 * @param stack - Array of tech stack entries
 * @returns Grouped entries by StackTier
 */
function groupByTier(stack: ReadonlyArray<TechStackEntry>): Record<string, TechStackEntry[]> {
  const groups: Record<string, TechStackEntry[]> = {};
  for (const entry of stack) {
    if (!groups[entry.tier]) {
      groups[entry.tier] = [];
    }
    groups[entry.tier].push(entry);
  }
  return groups;
}

/**
 * A tiered technical stack renderer that visualizes the project's
 * architecture as organized layers with technology cards.
 *
 * @param props - Component configuration
 * @returns The rendered architecture topology
 */
export function ArchitectureTopology({ blueprint }: ArchitectureTopologyProps): React.JSX.Element {
  const grouped = groupByTier(blueprint.techStack);
  const tiers = Object.values(StackTier);

  return (
    <SurfaceCard ariaLabel={`Architecture topology for ${blueprint.title}`} as="section">
      <h3 style={{ color: '#F0F4F8', fontSize: '1.125rem', fontWeight: 700, marginTop: 0, marginBottom: '1.25rem' }}>
        🏗️ System Architecture
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tiers.map((tier) => {
          const entries = grouped[tier];
          if (!entries || entries.length === 0) return null;
          const config = TIER_CONFIG[tier];

          return (
            <div
              key={tier}
              style={{
                background: `${config.color}08`,
                border: `1px solid ${config.color}25`,
                borderRadius: '12px',
                padding: '1rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Tier glow line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
                }}
                aria-hidden="true"
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span aria-hidden="true">{config.icon}</span>
                <span style={{ color: config.color, fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {config.label}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {entries.map((entry) => (
                  <div
                    key={entry.name}
                    style={{
                      background: 'rgba(5, 7, 14, 0.5)',
                      borderRadius: '8px',
                      padding: '0.625rem 0.875rem',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      flex: '1 1 200px',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#F0F4F8', marginBottom: '0.25rem' }}>
                      {entry.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>
                      {entry.rationale}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
