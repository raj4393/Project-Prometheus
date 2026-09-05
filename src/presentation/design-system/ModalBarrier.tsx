import React from 'react';
/**
 * @module ModalBarrier
 * @description Accessible focus-trapped portal dialog with backdrop overlay.
 * Implements WCAG 2.1 focus management, keyboard navigation,
 * and screen reader announcements.
 */

import { useEffect, useRef, useCallback, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

/**
 * Props for the ModalBarrier component.
 *
 * @property isOpen - Whether the modal is visible
 * @property onClose - Callback to close the modal
 * @property title - Accessible title for the modal dialog
 * @property children - Modal content
 * @property ariaLabel - Accessible label for the dialog
 */
interface ModalBarrierProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly ariaLabel?: string;
}

/**
 * An accessible modal dialog rendered via React Portal.
 * Implements focus trapping, escape key dismissal, backdrop click,
 * and proper ARIA attributes for screen reader compatibility.
 *
 * @param props - ModalBarrier configuration
 * @returns The rendered modal portal, or null if closed
 */
export function ModalBarrier({
  isOpen,
  onClose,
  title,
  children,
  ariaLabel,
}: ModalBarrierProps): React.JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /**
   * Handles keyboard events for focus trapping and escape dismissal.
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        } else if (!event.shiftKey && document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Focus the dialog on open
      requestAnimationFrame(() => {
        const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      });

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const backdropStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(5, 7, 14, 0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-out',
    padding: '1rem',
  };

  const dialogStyle: CSSProperties = {
    background: '#0B1220',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    padding: '2rem',
    maxWidth: '560px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto',
    animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    color: '#CBD5E1',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  };

  const titleStyle: CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#F0F4F8',
    margin: 0,
  };

  const closeButtonStyle: CSSProperties = {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#CBD5E1',
    cursor: 'pointer',
    padding: '0.375rem 0.625rem',
    fontSize: '1rem',
    lineHeight: 1,
    transition: 'all 0.2s ease',
  };

  return createPortal(
    <div
      style={backdropStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        style={dialogStyle}
      >
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={closeButtonStyle}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
