/**
 * @module AccessibilityAriaSpec
 * @description Role querying, focus trapping, and screen-reader test suite
 * using React Testing Library.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SurfaceCard } from '../presentation/design-system/SurfaceCard';
import { CyberAction } from '../presentation/design-system/CyberAction';
import { MetricsBadge } from '../presentation/design-system/MetricsBadge';
import { FeasibilityGauge } from '../presentation/modules/synthesis/FeasibilityGauge';

describe('Accessibility — ARIA roles and attributes', () => {
  describe('CyberAction', () => {
    it('should be queryable by button role', () => {
      render(<CyberAction ariaLabel="Test action">Click Me</CyberAction>);
      const button = screen.getByRole('button', { name: 'Test action' });
      expect(button).toBeDefined();
    });

    it('should support aria-expanded for toggle buttons', () => {
      render(
        <CyberAction ariaLabel="Toggle panel" ariaExpanded={true} ariaControls="panel-1">
          Toggle
        </CyberAction>
      );
      const button = screen.getByRole('button', { name: 'Toggle panel' });
      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(button.getAttribute('aria-controls')).toBe('panel-1');
    });

    it('should support aria-pressed for chip variant', () => {
      render(
        <CyberAction variant="chip" selected={true} ariaLabel="Python skill">
          Python
        </CyberAction>
      );
      const button = screen.getByRole('button', { name: 'Python skill' });
      expect(button.getAttribute('aria-pressed')).toBe('true');
    });

    it('should set disabled attribute when disabled', () => {
      render(
        <CyberAction disabled ariaLabel="Disabled action">
          Disabled
        </CyberAction>
      );
      const button = screen.getByRole('button', { name: 'Disabled action' });
      expect(button).toHaveProperty('disabled', true);
    });
  });

  describe('MetricsBadge', () => {
    it('should have status role with accessible label', () => {
      render(<MetricsBadge label="Engine" status="online" value="Online" />);
      const badge = screen.getByRole('status');
      expect(badge).toBeDefined();
      expect(badge.getAttribute('aria-label')).toBe('Engine: Online');
    });
  });

  describe('FeasibilityGauge', () => {
    it('should have meter role with correct value attributes', () => {
      render(<FeasibilityGauge score={75} />);
      const meter = screen.getByRole('meter');
      expect(meter).toBeDefined();
      expect(meter.getAttribute('aria-valuenow')).toBe('75');
      expect(meter.getAttribute('aria-valuemin')).toBe('0');
      expect(meter.getAttribute('aria-valuemax')).toBe('100');
    });

    it('should clamp score to 0-100 range', () => {
      render(<FeasibilityGauge score={150} />);
      const meter = screen.getByRole('meter');
      expect(meter.getAttribute('aria-valuenow')).toBe('100');
    });
  });

  describe('SurfaceCard', () => {
    it('should render as an article element by default', () => {
      render(
        <SurfaceCard ariaLabel="Test card">
          <p>Card content</p>
        </SurfaceCard>
      );
      const article = screen.getByRole('article');
      expect(article).toBeDefined();
      expect(article.getAttribute('aria-label')).toBe('Test card');
    });

    it('should render as section element when specified', () => {
      render(
        <SurfaceCard as="section" ariaLabel="Section card">
          <p>Section content</p>
        </SurfaceCard>
      );
      // section elements with aria-label have region role
      const region = screen.getByRole('region');
      expect(region).toBeDefined();
    });
  });

  describe('Focus visibility', () => {
    it('should ensure buttons are focusable', () => {
      render(
        <div>
          <CyberAction ariaLabel="First button">First</CyberAction>
          <CyberAction ariaLabel="Second button">Second</CyberAction>
        </div>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(2);

      // All buttons should not have negative tabIndex
      buttons.forEach((button) => {
        expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
