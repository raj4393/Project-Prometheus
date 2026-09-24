import React from 'react';
/**
 * @module Navbar
 * @description Navigation bar with live engine status indicator
 * and tab navigation for the main application sections.
 */

import { useCallback } from 'react';
import type { ActiveTab } from '../../core/state/projectReducer';
import { EngineStatus } from '../../core/state/projectReducer';
import { MetricsBadge } from '../design-system/MetricsBadge';

/**
 * Navigation tab configuration.
 */
const NAV_TABS: ReadonlyArray<{ id: ActiveTab; label: string; icon: string }> = [
  { id: 'intake', label: 'Synopsis & Lit', icon: '📝' },
  { id: 'blueprint', label: 'Architecture', icon: '🏗️' },
  { id: 'roadmap', label: 'Roadmap & Sprints', icon: '🗺️' },
  { id: 'defense', label: 'Viva Voce', icon: '🎤' },
  { id: 'assessment', label: 'Faculty Audit', icon: '📋' },
];

/**
 * Props for the Navbar component.
 *
 * @property activeTab - Currently active navigation tab
 * @property onTabChange - Callback when a tab is selected
 * @property engineStatus - Current AI engine connection status
 */
interface NavbarProps {
  readonly activeTab: ActiveTab;
  readonly onTabChange: (tab: ActiveTab) => void;
  readonly engineStatus: EngineStatus;
  readonly isAudioEnabled: boolean;
  readonly onToggleAudio: () => void;
  readonly onLoadDemo: () => void;
  readonly onExportProject: () => void;
  readonly onImportProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly readinessScore: number;
}

/**
 * Maps engine status to badge status for MetricsBadge.
 *
 * @param status - Engine status
 * @returns Badge status string
 */
function mapEngineStatusToBadge(status: EngineStatus): 'online' | 'offline' | 'warning' | 'processing' {
  switch (status) {
    case EngineStatus.Online: return 'online';
    case EngineStatus.Connecting: return 'processing';
    case EngineStatus.Fallback: return 'warning';
    case EngineStatus.Error: return 'offline';
    default: return 'offline';
  }
}

/**
 * Navigation bar with live engine status and tab navigation.
 * Shows the Project Prometheus branding, navigation tabs,
 * and real-time AI engine connection indicator.
 *
 * @param props - Component configuration
 * @returns The rendered navigation bar
 */
export function Navbar({ activeTab, onTabChange, engineStatus, isAudioEnabled, onToggleAudio, onLoadDemo, onExportProject, onImportProject, readinessScore }: NavbarProps): React.JSX.Element {
  const handleTabClick = useCallback(
    (tab: ActiveTab) => {
      onTabChange(tab);
    },
    [onTabChange]
  );

  return (
    <nav
      aria-label="Main navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        background: 'rgba(11, 18, 32, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Top Tier */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem' }}>
          {/* Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.375rem', animation: 'pulse-dot 2s infinite' }} aria-hidden="true">🔥</span>
            <div>
              <h1 style={{
                fontSize: '1rem',
                fontWeight: 800,
                margin: 0,
                background: 'linear-gradient(135deg, #00F5A0, #00D9F5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em',
              }}>
                PROMETHEUS
              </h1>
              <span style={{ color: '#64748B', fontSize: '0.625rem', fontWeight: 500, letterSpacing: '0.06em' }}>
                CAPSTONE OS
              </span>
            </div>
          </div>

          {/* Readiness Meter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem 1rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.5rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Readiness</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: readinessScore >= 80 ? '#10B981' : readinessScore >= 50 ? '#3B82F6' : '#F59E0B' }}>
                {readinessScore}%
              </span>
            </div>
            <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${readinessScore}%`, height: '100%', background: readinessScore >= 80 ? '#10B981' : readinessScore >= 50 ? '#3B82F6' : '#F59E0B', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={onLoadDemo} title="Load Demo Data" style={{ background: 'transparent', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#8B5CF6', borderRadius: '8px', padding: '0.375rem', cursor: 'pointer' }}>🚀</button>
            <button onClick={onExportProject} title="Export Backup" style={{ background: 'transparent', border: '1px solid rgba(0, 245, 160, 0.3)', color: '#00F5A0', borderRadius: '8px', padding: '0.375rem', cursor: 'pointer' }}>⬇️</button>
            <label title="Import JSON" style={{ background: 'transparent', border: '1px solid rgba(0, 217, 245, 0.3)', color: '#00D9F5', borderRadius: '8px', padding: '0.375rem', cursor: 'pointer', display: 'flex' }}>
              ⬆️<input type="file" accept=".json" onChange={onImportProject} style={{ display: 'none' }} />
            </label>
            <button onClick={onToggleAudio} title="Toggle Audio" style={{ background: 'transparent', border: 'none', color: isAudioEnabled ? '#00D9F5' : '#64748B', cursor: 'pointer', padding: '0.375rem' }}>
              {isAudioEnabled ? '🔊' : '🔇'}
            </button>
            <MetricsBadge label="Engine" status={mapEngineStatusToBadge(engineStatus)} value={engineStatus} />
          </div>
        </div>

        {/* Bottom Tier (Stepper) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }} role="tablist">
          {NAV_TABS.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const isPassed = NAV_TABS.findIndex(t => t.id === activeTab) > index;
            return (
              <React.Fragment key={tab.id}>
                <button
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabClick(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    border: isActive ? '1px solid rgba(0, 217, 245, 0.5)' : '1px solid transparent',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#00D9F5' : isPassed ? '#10B981' : '#64748B',
                    background: isActive ? 'rgba(0, 217, 245, 0.05)' : 'transparent',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: isActive ? '0 0 10px rgba(0, 217, 245, 0.2)' : 'none',
                  }}
                >
                  <span style={{ 
                    width: '20px', height: '20px', borderRadius: '50%', 
                    background: isPassed ? '#10B981' : isActive ? '#00D9F5' : 'rgba(255,255,255,0.1)', 
                    color: isPassed || isActive ? '#000' : '#FFF', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' 
                  }}>
                    {isPassed ? '✓' : index + 1}
                  </span>
                  <span className="hide-on-mobile">{tab.label}</span>
                </button>
                {index < NAV_TABS.length - 1 && (
                  <div style={{ width: '40px', height: '2px', background: isPassed ? '#10B981' : 'rgba(255,255,255,0.1)' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
