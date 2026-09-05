import React from 'react';
/**
 * @module DomainSelector
 * @description Dynamic domain selector with visual cards for selecting
 * capstone project domain pillars (HealthTech, Cyber-Physical, etc.)
 */

import { useCallback } from 'react';
import { DomainPillar } from '../../../domain/contracts/student.contract';
import { SurfaceCard } from '../../design-system/SurfaceCard';

/**
 * Domain metadata with icons and descriptions.
 */
const DOMAIN_META: ReadonlyArray<{ pillar: DomainPillar; icon: string; description: string }> = [
  { pillar: DomainPillar.HealthTech, icon: '🏥', description: 'AI-powered diagnostics, telemedicine, clinical decision support' },
  { pillar: DomainPillar.CyberPhysical, icon: '🤖', description: 'IoT systems, digital twins, autonomous control' },
  { pillar: DomainPillar.FinTech, icon: '💳', description: 'Algorithmic trading, fraud detection, decentralized finance' },
  { pillar: DomainPillar.GreenAI, icon: '🌱', description: 'Carbon-aware computing, sustainable ML, energy optimization' },
  { pillar: DomainPillar.EdTech, icon: '📚', description: 'Adaptive learning, AI tutoring, gamified assessment' },
  { pillar: DomainPillar.Cybersecurity, icon: '🛡️', description: 'Threat detection, zero-trust architecture, vulnerability scanning' },
  { pillar: DomainPillar.ComputerVision, icon: '👁️', description: 'Object detection, image segmentation, AR/VR' },
  { pillar: DomainPillar.NLP, icon: '💬', description: 'Summarization, sentiment analysis, conversational AI' },
  { pillar: DomainPillar.IoT, icon: '📡', description: 'Edge computing, smart agriculture, predictive maintenance' },
  { pillar: DomainPillar.Blockchain, icon: '⛓️', description: 'DeFi, DAOs, supply chain provenance, digital identity' },
];

/**
 * Props for the DomainSelector component.
 *
 * @property selectedDomains - Currently selected domain pillars
 * @property onDomainsChange - Callback when domain selection changes
 */
interface DomainSelectorProps {
  readonly selectedDomains: ReadonlyArray<DomainPillar>;
  readonly onDomainsChange: (domains: ReadonlyArray<DomainPillar>) => void;
}

/**
 * A dynamic domain selector showing visual cards for each domain pillar.
 * Students can select 1-3 domains that guide project synthesis direction.
 *
 * @param props - Component configuration
 * @returns The rendered domain selector interface
 */
export function DomainSelector({ selectedDomains, onDomainsChange }: DomainSelectorProps): React.JSX.Element {
  const isSelected = useCallback(
    (pillar: DomainPillar): boolean => selectedDomains.includes(pillar),
    [selectedDomains]
  );

  const handleToggle = useCallback(
    (pillar: DomainPillar) => {
      if (isSelected(pillar)) {
        onDomainsChange(selectedDomains.filter((d) => d !== pillar));
      } else if (selectedDomains.length < 3) {
        onDomainsChange([...selectedDomains, pillar]);
      }
    },
    [selectedDomains, onDomainsChange, isSelected]
  );

  return (
    <SurfaceCard ariaLabel="Domain pillar selector" as="section">
      <h3 style={{ color: '#F0F4F8', fontSize: '1.125rem', fontWeight: 700, marginTop: 0, marginBottom: '0.5rem' }}>
        🌐 Domain Pillars
      </h3>
      <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Select 1–3 domains that align with your interests. These guide the project theme.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {DOMAIN_META.map(({ pillar, icon, description }) => {
          const selected = isSelected(pillar);
          return (
            <button
              key={pillar}
              onClick={() => handleToggle(pillar)}
              aria-pressed={selected}
              aria-label={`${selected ? 'Deselect' : 'Select'} ${pillar} domain`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.375rem',
                padding: '1rem',
                borderRadius: '12px',
                border: selected
                  ? '1px solid #00F5A0'
                  : '1px solid rgba(255, 255, 255, 0.06)',
                background: selected
                  ? 'rgba(0, 245, 160, 0.08)'
                  : 'rgba(255, 255, 255, 0.02)',
                color: '#CBD5E1',
                cursor: selectedDomains.length >= 3 && !selected ? 'not-allowed' : 'pointer',
                opacity: selectedDomains.length >= 3 && !selected ? 0.4 : 1,
                textAlign: 'left',
                fontFamily: "'Inter', system-ui, sans-serif",
                transition: 'all 0.25s ease',
                boxShadow: selected ? '0 0 20px rgba(0, 245, 160, 0.15)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <span style={{ fontSize: '1.25rem' }} aria-hidden="true">{icon}</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: selected ? '#00F5A0' : '#F0F4F8' }}>
                  {pillar}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>
                {description}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDomains.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0, 245, 160, 0.05)', borderRadius: '10px', border: '1px solid rgba(0, 245, 160, 0.15)' }}>
          <span style={{ color: '#00F5A0', fontSize: '0.8125rem', fontWeight: 600 }}>
            ✓ {selectedDomains.length} domain{selectedDomains.length !== 1 ? 's' : ''} selected: {selectedDomains.join(', ')}
          </span>
        </div>
      )}
    </SurfaceCard>
  );
}
