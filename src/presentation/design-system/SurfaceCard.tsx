import React from 'react';
/**
 * @module SurfaceCard
 * @description Frosted multi-layer backdrop-blur container component
 * with aerospace design tokens and glassmorphism effects.
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Props for the SurfaceCard component.
 *
 * @property children - Content to render inside the card
 * @property className - Optional additional CSS class names
 * @property style - Optional inline style overrides
 * @property as - Semantic HTML element to render (default: 'article')
 * @property ariaLabel - Accessible label for the card region
 */
interface SurfaceCardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly as?: 'article' | 'section' | 'div' | 'aside';
  readonly ariaLabel?: string;
}

/**
 * A frosted glass card with aerospace design tokens.
 * Uses backdrop-filter blur, semi-transparent backgrounds,
 * and subtle border effects for a premium glassmorphism look.
 *
 * @param props - SurfaceCard configuration
 * @returns The rendered card element
 */
export function SurfaceCard({
  children,
  className = '',
  style,
  as = 'article',
  ariaLabel,
}: SurfaceCardProps): React.JSX.Element {
  const Tag = as;

  const baseStyle: CSSProperties = {
    background: 'rgba(11, 18, 32, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    padding: '1.5rem',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    ...style,
  };

  return (
    <Tag
      className={`surface-card ${className}`.trim()}
      style={baseStyle}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}
