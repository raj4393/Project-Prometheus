import React, { useState, useCallback, useMemo } from 'react';
import { ProficiencyLevel, type SkillTag, type SkillEntry } from '../../../domain/contracts/student.contract';
import { CyberAction } from '../../design-system/CyberAction';
import { SurfaceCard } from '../../design-system/SurfaceCard';

export const SKILL_GROUPS = [
  { category: 'Languages', skills: ['Python', 'Java', 'C', 'C++', 'C#', 'TypeScript', 'JavaScript', 'Go', 'Rust', 'Kotlin', 'Swift', 'PHP', 'SQL', 'Solidity', 'R'] },
  { category: 'Web & Mobile', skills: ['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Tailwind CSS', 'Flutter', 'React Native'] },
  { category: 'Backend & Microservices', skills: ['Node.js', 'Express.js', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'GraphQL', 'gRPC', 'WebSockets'] },
  { category: 'AI, LLMs & Data Science', skills: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'OpenCV', 'Hugging Face', 'LangChain', 'LlamaIndex', 'RAG Pipelines', 'Vector DBs (Chroma/Pinecone)'] },
  { category: 'Cloud & DevOps', skills: ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Linux', 'Git & GitHub Actions', 'Nginx', 'CI/CD', 'Vercel'] },
  { category: 'Databases & Queues', skills: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Supabase', 'Firebase', 'Apache Kafka', 'RabbitMQ'] },
  { category: 'IoT, Robotics & Hardware', skills: ['ROS/ROS2', 'Arduino', 'ESP32', 'Raspberry Pi', 'MQTT', 'Edge AI'] },
];

interface SkillMatrixInputProps {
  readonly selectedSkills: ReadonlyArray<SkillEntry>;
  readonly onSkillsChange: (skills: ReadonlyArray<SkillEntry>) => void;
}

export function SkillMatrixInput({ selectedSkills, onSkillsChange }: SkillMatrixInputProps): React.JSX.Element {
  const [activeProficiency, setActiveProficiency] = useState<SkillTag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const isSelected = useCallback(
    (tag: SkillTag): boolean => selectedSkills.some((s) => s.tag === tag),
    [selectedSkills]
  );

  const getProficiency = useCallback(
    (tag: SkillTag): ProficiencyLevel | null => {
      const entry = selectedSkills.find((s) => s.tag === tag);
      return entry?.proficiency ?? null;
    },
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

  const handleAddCustomSkill = () => {
    if (searchQuery.trim()) {
      const tag = searchQuery.trim();
      if (!customSkills.includes(tag)) setCustomSkills([...customSkills, tag]);
      if (!isSelected(tag)) setActiveProficiency(tag);
      setSearchQuery('');
    }
  };

  const getProficiencyColor = (level: ProficiencyLevel) => {
    switch (level) {
      case ProficiencyLevel.Beginner: return '#94A3B8'; // Slate
      case ProficiencyLevel.Intermediate: return '#818CF8'; // Indigo
      case ProficiencyLevel.Advanced:
      case ProficiencyLevel.Expert: return '#10B981'; // Emerald
      default: return '#CBD5E1';
    }
  };

  // Stack Heuristics
  const hasLanguage = selectedSkills.some(s => SKILL_GROUPS[0].skills.includes(s.tag));
  const hasBackend = selectedSkills.some(s => SKILL_GROUPS[2].skills.includes(s.tag));
  const hasDatabase = selectedSkills.some(s => SKILL_GROUPS[5].skills.includes(s.tag));
  const hasAI = selectedSkills.some(s => SKILL_GROUPS[3].skills.includes(s.tag));

  const isFullStack = hasLanguage && hasBackend && hasDatabase;
  const needsBackendForAI = hasAI && !hasBackend;

  const filteredGroups = useMemo(() => {
    let groups = SKILL_GROUPS;
    if (activeCategory !== 'All') {
      groups = groups.filter(g => g.category === activeCategory);
    }
    
    if (!searchQuery) return groups;
    
    const lowerQuery = searchQuery.toLowerCase();
    return groups.map(g => ({
      ...g,
      skills: g.skills.filter(s => s.toLowerCase().includes(lowerQuery))
    })).filter(g => g.skills.length > 0);
  }, [searchQuery, activeCategory]);

  const exactMatchExists = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return SKILL_GROUPS.some(g => g.skills.some(s => s.toLowerCase() === lowerQuery)) || customSkills.some(s => s.toLowerCase() === lowerQuery);
  }, [searchQuery, customSkills]);

  return (
    <SurfaceCard ariaLabel="Skill matrix input" as="section">
      <h3 style={{ color: '#F0F4F8', fontSize: '1.125rem', fontWeight: 700, marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>🧬 Skill Taxonomy Matrix</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '12px' }}>
          Selected: {selectedSkills.length}
        </span>
      </h3>

      <div style={{ marginBottom: '1rem' }}>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !exactMatchExists && handleAddCustomSkill()}
          placeholder="Search 50+ technologies or type custom..." 
          style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', borderRadius: '8px', transition: 'all 0.2s', outline: 'none' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#06b6d4'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        />
        
        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <button
            onClick={() => setActiveCategory('All')}
            style={{
              padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
              background: activeCategory === 'All' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
              color: activeCategory === 'All' ? '#22d3ee' : '#94a3b8',
              boxShadow: activeCategory === 'All' ? 'inset 0 0 0 1px rgba(6,182,212,0.3)' : 'inset 0 0 0 1px rgba(255,255,255,0.08)'
            }}
          >
            All
          </button>
          {SKILL_GROUPS.map(g => (
            <button
              key={g.category}
              onClick={() => setActiveCategory(g.category)}
              style={{
                padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
                background: activeCategory === g.category ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
                color: activeCategory === g.category ? '#22d3ee' : '#94a3b8',
                boxShadow: activeCategory === g.category ? 'inset 0 0 0 1px rgba(6,182,212,0.3)' : 'inset 0 0 0 1px rgba(255,255,255,0.08)'
              }}
            >
              {g.category.replace(' & Microservices', '').replace(', LLMs & Data Science', '/ML').replace(' & Hardware', '').replace(' & Queues', '')}
            </button>
          ))}
        </div>
        {searchQuery && !exactMatchExists && (
          <button 
            onClick={handleAddCustomSkill}
            style={{ marginTop: '0.5rem', background: 'rgba(139, 92, 246, 0.2)', color: '#8B5CF6', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            + Add custom skill '{searchQuery}'
          </button>
        )}
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {customSkills.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: '#8B5CF6', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>Custom / Specializations</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {customSkills.map((skill) => {
                const prof = getProficiency(skill);
                const profColor = prof ? getProficiencyColor(prof) : '';
                return (
                  <div key={skill} style={{ position: 'relative' }}>
                    <button
                      onClick={() => handleSkillToggle(skill)}
                      style={{
                        background: isSelected(skill) ? `${profColor}20` : 'rgba(255,255,255,0.03)',
                        border: isSelected(skill) ? `1px solid ${profColor}` : '1px solid rgba(255,255,255,0.08)',
                        color: isSelected(skill) ? profColor : '#CBD5E1',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: activeProficiency === skill ? 'scale(0.97)' : 'scale(1)',
                      }}
                      onMouseEnter={(e) => {
                        if (activeProficiency !== skill) {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = isSelected(skill) ? `0 0 8px ${profColor}40` : '0 0 8px rgba(255,255,255,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = activeProficiency === skill ? 'scale(0.97)' : 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {skill} {prof && <span style={{ fontSize: '0.625rem', marginLeft: '4px' }}>({prof})</span>}
                    </button>
                    {activeProficiency === skill && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.25rem', background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', zIndex: 10, padding: '4px', minWidth: '150px' }}>
                        {[ProficiencyLevel.Beginner, ProficiencyLevel.Intermediate, ProficiencyLevel.Advanced].map((level) => (
                          <button key={level} onClick={() => handleProficiencySelect(skill, level)} style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: '#FFF', textAlign: 'left', padding: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                            {level} ({level === ProficiencyLevel.Beginner ? '1x' : level === ProficiencyLevel.Intermediate ? '2x' : '3x'})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredGroups.map((group) => (
          <div key={group.category} style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: '#8B5CF6', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
              {group.category}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {group.skills.map((skill) => {
                const prof = getProficiency(skill);
                const profColor = prof ? getProficiencyColor(prof) : '';
                return (
                  <div key={skill} style={{ position: 'relative' }}>
                    <button
                      onClick={() => handleSkillToggle(skill)}
                      style={{
                        background: isSelected(skill) ? `${profColor}20` : 'rgba(255,255,255,0.03)',
                        border: isSelected(skill) ? `1px solid ${profColor}` : '1px solid rgba(255,255,255,0.08)',
                        color: isSelected(skill) ? profColor : '#CBD5E1',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: activeProficiency === skill ? 'scale(0.97)' : 'scale(1)',
                      }}
                      onMouseEnter={(e) => {
                        if (activeProficiency !== skill) {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = isSelected(skill) ? `0 0 8px ${profColor}40` : '0 0 8px rgba(255,255,255,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = activeProficiency === skill ? 'scale(0.97)' : 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {skill} {prof && <span style={{ fontSize: '0.625rem', marginLeft: '4px' }}>({prof})</span>}
                    </button>
                    {activeProficiency === skill && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.25rem', background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', zIndex: 10, padding: '4px', minWidth: '150px' }}>
                        {[ProficiencyLevel.Beginner, ProficiencyLevel.Intermediate, ProficiencyLevel.Advanced].map((level) => (
                          <button key={level} onClick={() => handleProficiencySelect(skill, level)} style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: '#FFF', textAlign: 'left', padding: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                            {level} ({level === ProficiencyLevel.Beginner ? '1x' : level === ProficiencyLevel.Intermediate ? '2x' : '3x'})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
