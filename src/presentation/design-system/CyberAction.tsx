import React from 'react';
/**
 * @module CyberAction
 * @description Accessible tactile interactive button/chip component
 * with neon gradient effects and micro-animations.
 */

import { type CSSProperties, useState, useCallback, type ReactNode } from 'react';

/**
 * Visual variant for the CyberAction component.
 */
type CyberVariant = 'primary' | 'secondary' | 'ghost' | 'chip' | 'danger';

/**
 * Props for the CyberAction component.
 *
 * @property children - Button content (text, icons, etc.)
 * @property onClick - Click handler function
 * @property variant - Visual style variant
 * @property disabled - Whether the button is disabled
 * @property ariaLabel - Accessible label for the button
 * @property ariaExpanded - ARIA expanded state for toggle buttons
 * @property ariaControls - ID of the element this button controls
 * @property selected - Whether the chip is in a selected state
 * @property type - Button type attribute
 */
interface CyberActionProps {
  readonly children: ReactNode;
  readonly onClick?: () => void;
  readonly variant?: CyberVariant;
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly ariaExpanded?: boolean;
  readonly ariaControls?: string;
  readonly ariaPressed?: boolean;
  readonly selected?: boolean;
  readonly type?: 'button' | 'submit' | 'reset';
}

/**
 * Style configurations per variant.
 */
const VARIANT_STYLES: Record<CyberVariant, { base: CSSProperties; hover: CSSProperties }> = {
  primary: {
    base: {
      background: 'linear-gradient(135deg, #00F5A0, #00D9F5)',
      color: '#05070E',
      border: 'none',
      fontWeight: 700,
      boxShadow: '0 0 20px rgba(0, 245, 160, 0.2)',
    },
    hover: {
      boxShadow: '0 0 30px rgba(0, 245, 160, 0.5)',
      transform: 'translateY(-2px)',
    },
  },
  secondary: {
    base: {
      background: 'transparent',
      color: '#00D9F5',
      border: '1px solid #00D9F5',
      fontWeight: 600,
    },
    hover: {
      background: 'rgba(0, 217, 245, 0.1)',
      boxShadow: '0 0 20px rgba(0, 217, 245, 0.3)',
      transform: 'translateY(-1px)',
    },
  },
  ghost: {
    base: {
      background: 'transparent',
      color: '#CBD5E1',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      fontWeight: 500,
    },
    hover: {
      borderColor: 'rgba(255, 255, 255, 0.2)',
      background: 'rgba(255, 255, 255, 0.04)',
    },
  },
  chip: {
    base: {
      background: 'rgba(139, 92, 246, 0.15)',
      color: '#8B5CF6',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      fontWeight: 500,
      fontSize: '0.8125rem',
      padding: '0.375rem 0.875rem',
      borderRadius: '9999px',
    },
    hover: {
      background: 'rgba(139, 92, 246, 0.25)',
      borderColor: '#8B5CF6',
    },
  },
  danger: {
    base: {
      background: 'transparent',
      color: '#F59E0B',
      border: '1px solid #F59E0B',
      fontWeight: 600,
    },
    hover: {
      background: 'rgba(245, 158, 11, 0.1)',
      boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
    },
  },
};

/**
 * An accessible, tactile interactive button with neon gradient effects
 * and micro-animations. Supports multiple visual variants including
 * primary action, secondary, ghost, chip, and danger styles.
 *
 * @param props - CyberAction configuration
 * @returns The rendered button element
 */
export function CyberAction({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  ariaLabel,
  ariaExpanded,
  ariaControls,
  selected = false,
  type = 'button',
}: CyberActionProps): React.JSX.Element {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const variantConfig = VARIANT_STYLES[variant];

  const selectedOverride: CSSProperties =
    selected && variant === 'chip'
      ? {
          background: 'rgba(0, 245, 160, 0.2)',
          color: '#00F5A0',
          borderColor: '#00F5A0',
        }
      : {};

  const combinedStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.9375rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    ...variantConfig.base,
    ...(isHovered && !disabled ? variantConfig.hover : {}),
    ...selectedOverride,
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-pressed={variant === 'chip' ? selected : undefined}
      style={combinedStyle}
    >
      {children}
    </button>
  );
}
