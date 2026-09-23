import React from 'react';
import type { BlueprintContract } from '../../../domain/contracts/blueprint.contract';
import { SurfaceCard } from '../../design-system/SurfaceCard';
import { CyberAction } from '../../design-system/CyberAction';
import { useStore } from '../../../core/state/StoreContext';

export function ComparisonMatrix(): React.JSX.Element | null {
  const { state, dispatch } = useStore();
  const { savedBlueprints } = state;

  if (savedBlueprints.length === 0) return null;

  return (
    <SurfaceCard ariaLabel="Comparison Matrix" as="section">
      <h3 style={{ color: '#F0F4F8', fontSize: '1.125rem', fontWeight: 700, marginTop: 0, marginBottom: '1rem' }}>
        📊 Comparison Matrix
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${savedBlueprints.length}, minmax(250px, 1fr))`, gap: '1rem', overflowX: 'auto' }}>
        {savedBlueprints.map((bp: BlueprintContract) => (
          <div key={bp.slug} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4 style={{ color: '#00D9F5', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{bp.title}</h4>
              <button 
                onClick={() => dispatch({ type: 'REMOVE_SAVED_BLUEPRINT', payload: bp.slug })}
                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '1.25rem' }}
                aria-label={`Remove ${bp.title}`}
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '1rem' }}>{bp.targetDomain}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Feasibility:</span>
              <span style={{ color: '#00F5A0', fontWeight: 'bold' }}>{bp.feasibilityScore}/100</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Novelty:</span>
              <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>{bp.novelty}</span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h5 style={{ color: '#F0F4F8', fontSize: '0.8125rem', margin: '0 0 0.5rem 0' }}>Architecture</h5>
              {bp.techStack.map(ts => (
                <div key={ts.name} style={{ fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#8B5CF6' }}>[{ts.tier}]</span> {ts.name}
                </div>
              ))}
            </div>

            <div style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem', textAlign: 'center' }}>
              <CyberAction 
                variant="secondary" 
                onClick={() => dispatch({ type: 'SET_BLUEPRINT', payload: bp })}
                ariaLabel={`Load ${bp.title}`}
              >
                Load Blueprint
              </CyberAction>
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
