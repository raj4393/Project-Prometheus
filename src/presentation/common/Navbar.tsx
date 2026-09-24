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
        height: '3.5rem', /* h-14 */
        padding: '0 1.5rem', /* px-6 */
        background: '#090a0f',
        borderBottom: '1px solid #1e2230',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Left: Minimalist logo & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1rem', color: '#f3f4f6' }} aria-hidden="true">◆</span>
        <h1 style={{
          fontSize: '0.875rem', /* text-sm */
          fontWeight: 600,
          margin: 0,
          color: '#f3f4f6',
          letterSpacing: '0.05em', /* tracking-wider */
        }}>
          PROMETHEUS
        </h1>
        <span style={{ 
          color: '#94a3b8', 
          fontSize: '0.625rem', 
          fontWeight: 500, 
          padding: '0.125rem 0.375rem', 
          borderRadius: '4px',
          background: '#11131a',
          border: '1px solid #1e2230'
        }}>
          v1.0 Capstone OS
        </span>
      </div>

      {/* Center: Segmented Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} role="tablist">
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
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? '#06b6d4' : isPassed ? '#94a3b8' : '#64748b',
                  background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  transition: 'all 0.2s ease',
                  borderBottom: isActive ? '2px solid #06b6d4' : '2px solid transparent',
                  borderBottomLeftRadius: isActive ? '0' : '6px',
                  borderBottomRightRadius: isActive ? '0' : '6px',
                }}
              >
                <span style={{ color: isPassed ? '#10b981' : 'inherit' }}>
                  {isPassed ? '✓' : `${index + 1}.`}
                </span>
                <span className="hide-on-mobile">{tab.label}</span>
              </button>
              {index < NAV_TABS.length - 1 && (
                <span style={{ color: '#1e2230', fontSize: '0.75rem' }}>›</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right: Action Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Readiness Badge */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '0.375rem', 
          background: '#11131a', border: '1px solid #1e2230', 
          padding: '0.25rem 0.5rem', borderRadius: '9999px',
          fontSize: '0.75rem', color: '#f3f4f6'
        }}>
          <div style={{ 
            width: '8px', height: '8px', borderRadius: '50%', 
            background: readinessScore >= 80 ? '#10b981' : readinessScore >= 50 ? '#06b6d4' : '#F59E0B' 
          }} />
          <span>Readiness: {readinessScore}%</span>
        </div>

        {/* Ghost Buttons */}
        <label style={{ color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
          Import
          <input type="file" accept=".json" onChange={onImportProject} style={{ display: 'none' }} />
        </label>
        <button onClick={onExportProject} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', transition: 'all 0.2s' }}>
          Export JSON
        </button>
        <button onClick={onLoadDemo} style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#06b6d4', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', padding: '0.25rem 0.75rem', borderRadius: '4px', transition: 'all 0.2s' }}>
          Load Demo
        </button>
        
        {/* Helper Badge */}
        <kbd style={{ background: '#11131a', border: '1px solid #1e2230', padding: '2px 6px', borderRadius: '4px', fontSize: '0.625rem', color: '#64748b' }}>
          P Preview
        </kbd>

        <button
          onClick={onToggleAudio}
          aria-label={isAudioEnabled ? "Mute sounds" : "Unmute sounds"}
          title={isAudioEnabled ? "Mute sounds" : "Unmute sounds"}
          style={{
            background: 'transparent',
            border: 'none',
            color: isAudioEnabled ? '#94a3b8' : '#64748b',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isAudioEnabled ? '🔊' : '🔇'}
        </button>
      </div>
    </nav>
  );
}
