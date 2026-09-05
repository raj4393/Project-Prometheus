import React from 'react';
/**
 * @module SkillMatrixInput
 * @description Multi-tier skill chip selector allowing students to select
 * their technical skills with proficiency levels.
 */

import { useState, useCallback } from 'react';
import { SkillTag, ProficiencyLevel, type SkillEntry } from '../../../domain/contracts/student.contract';
import { CyberAction } from '../../design-system/CyberAction';
import { SurfaceCard } from '../../design-system/SurfaceCard';

/**
 * All available skill tags grouped by category.
 */
const SKILL_GROUPS: ReadonlyArray<{ category: string; skills: ReadonlyArray<SkillTag> }> = [
  { category: 'Languages', skills: [SkillTag.Python, SkillTag.JavaScript, SkillTag.TypeScript, SkillTag.Rust, SkillTag.Go, SkillTag.Swift, SkillTag.Solidity] },
  { category: 'Frameworks', skills: [SkillTag.React, SkillTag.NextJS, SkillTag.NodeJS, SkillTag.Flutter] },
  { category: 'AI / ML', skills: [SkillTag.PyTorch, SkillTag.TensorFlow, SkillTag.OpenCV, SkillTag.LangChain] },
  { category: 'Data / Infra', skills: [SkillTag.PostgreSQL, SkillTag.MongoDB, SkillTag.Redis, SkillTag.GraphQL, SkillTag.Docker, SkillTag.Kubernetes, SkillTag.AWS, SkillTag.GCP, SkillTag.ROS] },
];

/**
 * Props for the SkillMatrixInput component.
 *
 * @property selectedSkills - Currently selected skill entries
 * @property onSkillsChange - Callback when skills selection changes
 */
interface SkillMatrixInputProps {
  readonly selectedSkills: ReadonlyArray<SkillEntry>;
  readonly onSkillsChange: (skills: ReadonlyArray<SkillEntry>) => void;
}

/**
 * A multi-tier skill chip selector that lets students pick technologies
 * and set proficiency levels. Skills are grouped by category for easy discovery.
 *
 * @param props - Component configuration
 * @returns The rendered skill matrix interface
 */
export function SkillMatrixInput({ selectedSkills, onSkillsChange }: SkillMatrixInputProps): React.JSX.Element {
  const [activeProficiency, setActiveProficiency] = useState<SkillTag | null>(null);

  const isSelected = useCallback(
    (tag: SkillTag): boolean => selectedSkills.some((s) => s.tag === tag),
    [selectedSkills]
  );

  const handleSkillToggle = useCallback(
    (tag: SkillTag) => {
      if (isSelected(tag)) {
        onSkillsChange(selectedSkills.filter((s) => s.tag !== tag));
        if (activeProficiency === tag) setActiveProficiency(null);
      } else {
        setActiveProficiency(tag);
      }
    },
    [selectedSkills, onSkillsChange, isSelected, activeProficiency]
  );

  const handleProficiencySelect = useCallback(
    (tag: SkillTag, proficiency: ProficiencyLevel) => {
      const newEntry: SkillEntry = { tag, proficiency };
      onSkillsChange([...selectedSkills.filter((s) => s.tag !== tag), newEntry]);
      setActiveProficiency(null);
    },
    [selectedSkills, onSkillsChange]
  );

  const getProficiency = useCallback(
    (tag: SkillTag): ProficiencyLevel | null => {
      const entry = selectedSkills.find((s) => s.tag === tag);
      return entry?.proficiency ?? null;
    },
    [selectedSkills]
  );

  return (
    <SurfaceCard ariaLabel="Skill matrix input" as="section">
      <h3 style={{ color: '#F0F4F8', fontSize: '1.125rem', fontWeight: 700, marginTop: 0, marginBottom: '1rem' }}>
        🧬 Skill Matrix
      </h3>
      <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Select your technical skills and proficiency levels. Choose at least 2 skills for optimal results.
      </p>

      {SKILL_GROUPS.map((group) => (
        <div key={group.category} style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ color: '#8B5CF6', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
            {group.category}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {group.skills.map((skill) => (
              <div key={skill} style={{ position: 'relative' }}>
                <CyberAction
                  variant="chip"
                  selected={isSelected(skill)}
                  onClick={() => handleSkillToggle(skill)}
                  ariaLabel={`${isSelected(skill) ? 'Remove' : 'Add'} ${skill} skill`}
                  ariaPressed={isSelected(skill)}
                >
                  {skill}
                  {getProficiency(skill) && (
                    <span style={{ fontSize: '0.625rem', opacity: 0.8 }}>
                      ({getProficiency(skill)})
                    </span>
                  )}
                </CyberAction>

                {activeProficiency === skill && (
                  <div
                    role="listbox"
                    aria-label={`Select proficiency for ${skill}`}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '0.25rem',
                      background: '#0B1220',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      padding: '0.375rem',
                      zIndex: 50,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      minWidth: '140px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {Object.values(ProficiencyLevel).map((level) => (
                      <button
                        key={level}
                        role="option"
                        aria-selected={false}
                        onClick={() => handleProficiencySelect(skill, level)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#CBD5E1',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          textAlign: 'left',
                          fontFamily: "'Inter', system-ui, sans-serif",
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 245, 160, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedSkills.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0, 245, 160, 0.05)', borderRadius: '10px', border: '1px solid rgba(0, 245, 160, 0.15)' }}>
          <span style={{ color: '#00F5A0', fontSize: '0.8125rem', fontWeight: 600 }}>
            ✓ {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}
    </SurfaceCard>
  );
}
