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
  { id: 'intake', label: 'Profile', icon: '🧑‍🎓' },
  { id: 'blueprint', label: 'Blueprint', icon: '📐' },
  { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
  { id: 'defense', label: 'Defense', icon: '🎤' },
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
export function Navbar({ activeTab, onTabChange, engineStatus, isAudioEnabled, onToggleAudio }: NavbarProps): React.JSX.Element {
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
      {/* Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.375rem' }} aria-hidden="true">🔥</span>
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
            CAPSTONE COMPILER
          </span>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: '0.25rem' }} role="tablist" aria-label="Application sections">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => handleTabClick(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: activeTab === tab.id ? '#00F5A0' : '#64748B',
              background: activeTab === tab.id
                ? 'rgba(0, 245, 160, 0.08)'
                : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleAudio}
          aria-label={isAudioEnabled ? "Mute sounds" : "Unmute sounds"}
          title={isAudioEnabled ? "Mute sounds" : "Unmute sounds"}
          style={{
            background: 'transparent',
            border: 'none',
            color: isAudioEnabled ? '#00D9F5' : '#64748B',
            cursor: 'pointer',
            fontSize: '1.25rem',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s ease',
          }}
        >
          {isAudioEnabled ? '🔊' : '🔇'}
        </button>
        <MetricsBadge
          label="Engine"
          status={mapEngineStatusToBadge(engineStatus)}
          value={engineStatus}
        />
      </div>
    </nav>
  );
}
