import React from 'react';
/**
 * @module MetricsBadge
 * @description Animated live-ping status badge component with pulsing
 * indicator dot and configurable status colors.
 */

import type { CSSProperties } from 'react';

/**
 * Status variants for the badge indicator.
 */
type BadgeStatus = 'online' | 'offline' | 'warning' | 'processing';

/**
 * Props for the MetricsBadge component.
 *
 * @property label - Display text for the badge
 * @property status - The current status determining color
 * @property value - Optional numeric or text value to display
 */
interface MetricsBadgeProps {
  readonly label: string;
  readonly status: BadgeStatus;
  readonly value?: string | number;
}

/**
 * Color map for each badge status.
 */
const STATUS_COLORS: Record<BadgeStatus, string> = {
  online: '#00F5A0',
  offline: '#64748B',
  warning: '#F59E0B',
  processing: '#00D9F5',
};

/**
 * An animated status badge with a pulsing indicator dot.
 * Shows real-time system state with color-coded status.
 *
 * @param props - MetricsBadge configuration
 * @returns The rendered badge element
 */
export function MetricsBadge({ label, status, value }: MetricsBadgeProps): React.JSX.Element {
  const color = STATUS_COLORS[status];

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0.875rem',
    borderRadius: '9999px',
    background: 'rgba(11, 18, 32, 0.8)',
    border: `1px solid ${color}33`,
    fontSize: '0.75rem',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#CBD5E1',
    letterSpacing: '0.02em',
  };

  const dotStyle: CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color,
    boxShadow: `0 0 8px ${color}80`,
    animation: status === 'processing' ? 'pulse-dot 1.5s ease-in-out infinite' : status === 'online' ? 'pulse-dot 2s ease-in-out infinite' : 'none',
  };

  const valueStyle: CSSProperties = {
    color,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  };

  return (
    <span style={containerStyle} role="status" aria-label={`${label}: ${value ?? status}`}>
      <span style={dotStyle} aria-hidden="true" />
      <span>{label}</span>
      {value !== undefined && <span style={valueStyle}>{value}</span>}
    </span>
  );
}
