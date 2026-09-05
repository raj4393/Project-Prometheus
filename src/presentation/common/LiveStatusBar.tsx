import React from 'react';
/**
 * @module LiveStatusBar
 * @description System telemetry and API connection indicator bar
 * showing synthesis latency, cache status, and connection health.
 */

import { MetricsBadge } from '../design-system/MetricsBadge';
import { EngineStatus } from '../../core/state/projectReducer';

/**
 * Props for the LiveStatusBar component.
 *
 * @property engineStatus - Current AI engine connection status
 * @property synthesisLatency - Last synthesis duration in milliseconds
 * @property blueprintCount - Number of generated blueprints
 */
interface LiveStatusBarProps {
  readonly engineStatus: EngineStatus;
  readonly synthesisLatency: number | null;
  readonly blueprintCount: number;
}

/**
 * A telemetry status bar showing real-time system health metrics.
 * Displays engine status, synthesis latency, and blueprint count.
 *
 * @param props - Component configuration
 * @returns The rendered status bar
 */
export function LiveStatusBar({
  engineStatus,
  synthesisLatency,
  blueprintCount,
}: LiveStatusBarProps): React.JSX.Element {
  const statusMap: Record<EngineStatus, 'online' | 'offline' | 'warning' | 'processing'> = {
    [EngineStatus.Online]: 'online',
    [EngineStatus.Connecting]: 'processing',
    [EngineStatus.Fallback]: 'warning',
    [EngineStatus.Error]: 'offline',
    [EngineStatus.Idle]: 'offline',
  };

  return (
    <footer
      aria-label="System telemetry"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '0.625rem 1.5rem',
        background: 'rgba(5, 7, 14, 0.95)',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        flexWrap: 'wrap',
      }}
    >
      <MetricsBadge
        label="API"
        status={statusMap[engineStatus]}
        value={engineStatus}
      />
      <MetricsBadge
        label="Latency"
        status={synthesisLatency !== null ? (synthesisLatency < 1000 ? 'online' : 'warning') : 'offline'}
        value={synthesisLatency !== null ? `${Math.round(synthesisLatency)}ms` : '—'}
      />
      <MetricsBadge
        label="Blueprints"
        status={blueprintCount > 0 ? 'online' : 'offline'}
        value={blueprintCount}
      />
    </footer>
  );
}
