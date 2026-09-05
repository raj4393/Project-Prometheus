import React from 'react';
/**
 * @module FeasibilityGauge
 * @description SVG circular mathematical score indicator (0-100%)
 * with animated fill, gradient colors, and dynamic scoring.
 */

import { useMemo } from 'react';

/**
 * Props for the FeasibilityGauge component.
 *
 * @property score - Feasibility score from 0 to 100
 * @property size - Diameter of the gauge in pixels (default: 160)
 * @property label - Accessible label for the gauge
 */
interface FeasibilityGaugeProps {
  readonly score: number;
  readonly size?: number;
  readonly label?: string;
}

/**
 * Determines the score category and associated color.
 *
 * @param score - Score from 0-100
 * @returns Color and label for the score range
 */
function getScoreCategory(score: number): { color: string; label: string } {
  if (score >= 80) return { color: '#00F5A0', label: 'Excellent' };
  if (score >= 60) return { color: '#00D9F5', label: 'Good' };
  if (score >= 40) return { color: '#F59E0B', label: 'Moderate' };
  return { color: '#EF4444', label: 'Challenging' };
}

/**
 * An SVG circular gauge that visualizes feasibility scores with
 * animated fill, gradient stroke, and category labels.
 *
 * @param props - Component configuration
 * @returns The rendered SVG gauge
 */
export function FeasibilityGauge({
  score,
  size = 160,
  label = 'Feasibility Score',
}: FeasibilityGaugeProps): React.JSX.Element {
  const clampedScore = Math.max(0, Math.min(100, score));
  const { color, label: categoryLabel } = useMemo(() => getScoreCategory(clampedScore), [clampedScore]);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;
  const center = size / 2;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}
      role="meter"
      aria-label={label}
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth={strokeWidth}
        />

        {/* Score arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
            filter: `drop-shadow(0 0 8px ${color}60)`,
          }}
        />

        {/* Center text (rotated back to normal) */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#F0F4F8"
          fontSize={size * 0.2}
          fontWeight="700"
          fontFamily="'Inter', system-ui, sans-serif"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${center}px ${center}px` }}
        >
          {clampedScore}
        </text>
        <text
          x={center}
          y={center + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#64748B"
          fontSize={size * 0.08}
          fontFamily="'Inter', system-ui, sans-serif"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${center}px ${center}px` }}
        >
          / 100
        </text>
      </svg>
      <span style={{ color, fontSize: '0.8125rem', fontWeight: 600 }}>
        {categoryLabel}
      </span>
      <span style={{ color: '#64748B', fontSize: '0.75rem' }}>
        {label}
      </span>
    </div>
  );
}
