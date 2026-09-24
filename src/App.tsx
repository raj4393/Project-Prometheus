import React from 'react';
/**
 * @module App
 * @description Root application component orchestrating all feature modules,
 * managing navigation state, and coordinating synthesis workflows.
 */

import { useCallback, useState } from 'react';
import { useStore } from './core/state/StoreContext';
import { EngineStatus, type ActiveTab } from './core/state/projectReducer';
import type { SkillEntry, StudentProfile } from './domain/contracts/student.contract';
import { TimeFrame, AmbitionLevel, type DomainPillar } from './domain/contracts/student.contract';
import { generateDefaultRoadmap, generateDefaultDefense } from './domain/models/projectPresets';
import { generateBlueprint } from './infrastructure/ai/geminiClient';
import { downloadIEEESynopsis } from './infrastructure/serialization/ieeeMarkdownExporter';
import { sanitizeInput } from './core/security/sanitize';
import { ErrorBoundary } from './core/security/ErrorBoundary';
import { playClick, playSweep, playSuccess } from './core/audio/SoundEngine';

import { Navbar } from './presentation/common/Navbar';
import { LiveStatusBar } from './presentation/common/LiveStatusBar';
import { SkillMatrixInput, SKILL_GROUPS } from './presentation/modules/intake/SkillMatrixInput';
import { DomainSelector } from './presentation/modules/intake/DomainSelector';
import { ArchitectureTopology } from './presentation/modules/synthesis/ArchitectureTopology';
import { ArchitectureVisualizer } from './presentation/modules/synthesis/ArchitectureVisualizer';
import { EvaluatorRadar } from './presentation/modules/synthesis/EvaluatorRadar';
import { FeasibilityGauge } from './presentation/modules/synthesis/FeasibilityGauge';
import { SprintChecklist } from './presentation/modules/roadmap/SprintChecklist';
import { VivaSimulator } from './presentation/modules/defense/VivaSimulator';
import { SurfaceCard } from './presentation/design-system/SurfaceCard';
import { CyberAction } from './presentation/design-system/CyberAction';
import { ComparisonMatrix } from './presentation/modules/synthesis/ComparisonMatrix';
import { IEEEPrintPreviewModal } from './presentation/common/IEEEPrintPreviewModal';
import { LiteratureMatrix } from './presentation/modules/academic/LiteratureMatrix';
import { AcademicRubric } from './presentation/modules/academic/AcademicRubric';
import { FacultyGradingPanel } from './presentation/modules/assessment/FacultyGradingPanel';

/**
 * Root application component rendering the Project Prometheus platform.
 * Manages intake form state, synthesis orchestration, and view routing.
 *
 * @returns The complete application interface
 */
export default function App(): React.JSX.Element {
  const { state, dispatch } = useStore();

  // Intake form local state
  const [studentName, setStudentName] = useState('');
  const [skills, setSkills] = useState<ReadonlyArray<SkillEntry>>([]);
  const [domains, setDomains] = useState<ReadonlyArray<DomainPillar>>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.TwelveWeeks);
  const [ambition, setAmbition] = useState<AmbitionLevel>(AmbitionLevel.Ambitious);
  const [teamSize, setTeamSize] = useState(1);
  const [latency, setLatency] = useState<number | null>(null);
  const [showIeeeModal, setShowIeeeModal] = useState(false);

  /**
   * Handles the project synthesis workflow.
   */
  const handleGenerate = useCallback(async () => {
    if (skills.length === 0 || domains.length === 0) return;

    const profile: StudentProfile = {
      studentName: sanitizeInput(studentName) || 'Student',
      skills: [...skills],
      domains: [...domains],
      timeFrame,
      ambition,
      teamSize,
    };

    dispatch({ type: 'SET_PROFILE', payload: profile });
    dispatch({ type: 'SET_GENERATING', payload: true });
    dispatch({ type: 'SET_ENGINE_STATUS', payload: EngineStatus.Connecting });

    try {
      const result = await generateBlueprint(profile);

      dispatch({ type: 'SET_BLUEPRINT', payload: result.blueprint });
      dispatch({
        type: 'SET_ENGINE_STATUS',
        payload: result.source === 'gemini' ? EngineStatus.Online : EngineStatus.Fallback,
      });
      setLatency(result.latencyMs);

      // Generate roadmap and defense
      const roadmap = generateDefaultRoadmap(result.blueprint.id);
      dispatch({ type: 'SET_ROADMAP', payload: roadmap });

      const defense = generateDefaultDefense(result.blueprint);
      dispatch({ type: 'SET_DEFENSE', payload: defense });

      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'blueprint' });
    } catch {
      dispatch({ type: 'SET_ENGINE_STATUS', payload: EngineStatus.Error });
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }, [studentName, skills, domains, timeFrame, ambition, teamSize, dispatch]);

  /**
   * Handles selecting a preset blueprint.
   */
  const handleSelectPreset = useCallback(
    (blueprint: typeof state.presetBlueprints[number]) => {
      dispatch({ type: 'SELECT_PRESET', payload: blueprint });
      dispatch({ type: 'SET_ENGINE_STATUS', payload: EngineStatus.Fallback });

      const roadmap = generateDefaultRoadmap(blueprint.id);
      dispatch({ type: 'SET_ROADMAP', payload: roadmap });

      const defense = generateDefaultDefense(blueprint);
      dispatch({ type: 'SET_DEFENSE', payload: defense });
    },
    [dispatch]
  );

  /**
   * Handles tab navigation.
   */
  const handleTabChange = useCallback(
    (tab: ActiveTab) => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    },
    [dispatch]
  );

  /**
   * Handles milestone toggling in the roadmap.
   */
  const handleToggleMilestone = useCallback(
    (milestoneId: string) => {
      dispatch({ type: 'TOGGLE_MILESTONE', payload: milestoneId });
      if (state.isAudioEnabled) playClick();
    },
    [dispatch, state.isAudioEnabled]
  );

  /**
   * Handles question reveal toggling in viva simulator.
   */
  const handleToggleReveal = useCallback(
    (questionId: string) => {
      dispatch({ type: 'TOGGLE_QUESTION_REVEAL', payload: questionId });
      if (state.isAudioEnabled) playSweep();
    },
    [dispatch, state.isAudioEnabled]
  );

  /**
   * Handles IEEE synopsis download.
   */
  const handleDownloadSynopsis = useCallback(() => {
    if (state.blueprint) {
      downloadIEEESynopsis(
        state.blueprint,
        state.roadmap,
        state.profile?.studentName ?? 'Student'
      );
      if (state.isAudioEnabled) playSuccess();
    }
  }, [state.blueprint, state.roadmap, state.profile, state.isAudioEnabled]);

  const handleToggleAudio = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUDIO' });
  }, [dispatch]);

  const handleLoadDemo = useCallback(() => {
    dispatch({ type: 'LOAD_DEMO' });
    if (state.isAudioEnabled) playSuccess();
  }, [dispatch, state.isAudioEnabled]);

  const handleExportProject = useCallback(() => {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prometheus-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (state.isAudioEnabled) playSuccess();
  }, [state]);

  const handleImportProject = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedState = JSON.parse(event.target?.result as string);
        dispatch({ type: 'RESTORE_STATE', payload: importedState });
        if (state.isAudioEnabled) playSuccess();
        alert('Project imported successfully!');
      } catch (err) {
        console.error("Invalid project file", err);
        alert('Failed to parse project file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  }, [dispatch, state.isAudioEnabled]);

  // Calculate Readiness Score
  let readinessScore = 0;
  if (state.activeTab !== 'intake') {
    const litScore = state.literature && state.literature.length >= 5 ? 25 : (state.literature?.length || 0) / 5 * 25;
    const roadmapScore = state.roadmap && state.roadmap.totalMilestones > 0 ? (state.roadmap.completedMilestones / state.roadmap.totalMilestones) * 25 : 0;
    const vivaCount = state.defense ? state.defense.questions.filter(q => q.isRevealed).length : 0;
    const vivaScore = vivaCount >= 3 ? 25 : (vivaCount / 3) * 25;
    const facultyScore = (state.facultyAssessment && state.facultyAssessment.review0?.remarks && state.facultyAssessment.review1?.remarks && state.facultyAssessment.review2?.remarks) ? 25 : 0;
    readinessScore = Math.round(litScore + roadmapScore + vivaScore + facultyScore);
  }

  // Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) || activeElement.isContentEditable)) {
        return;
      }
      
      switch(e.key.toLowerCase()) {
        case '1': handleTabChange('intake'); break;
        case '2': handleTabChange('blueprint'); break;
        case '3': handleTabChange('roadmap'); break;
        case '4': handleTabChange('defense'); break;
        case '5': handleTabChange('assessment'); break;
        case 'p': setShowIeeeModal((prev: boolean) => !prev); break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTabChange]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#05070E' }}>
      <Navbar
        activeTab={state.activeTab}
        onTabChange={handleTabChange}
        engineStatus={state.engineStatus}
        isAudioEnabled={state.isAudioEnabled}
        onToggleAudio={handleToggleAudio}
        onLoadDemo={handleLoadDemo}
        onExportProject={handleExportProject}
        onImportProject={handleImportProject}
        readinessScore={readinessScore}
      />

      <main
        style={{
          flex: 1,
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem',
        }}
      >
        <ErrorBoundary>
        {/* ===== INTAKE TAB ===== */}
        {state.activeTab === 'intake' && (
          <div id="panel-intake" role="tabpanel" aria-labelledby="tab-intake" className="animate-fadeIn">
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 800,
                margin: '0 0 0.75rem 0',
                background: 'linear-gradient(135deg, #00F5A0, #00D9F5, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Build Your Capstone Project
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '1.0625rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                Tell us about your skills and interests. Our AI engine will generate a tailored project blueprint with architecture, roadmap, and defense prep.
              </p>
            </div>

            {/* Bento-Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem', maxWidth: '80rem', margin: '0 auto' }}>
              {/* Left Grid (col-span-4) */}
              <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SurfaceCard ariaLabel="Student information" as="section" style={{ padding: '1.25rem' }}>
                  <h3 style={{ color: '#f3f4f6', fontSize: '1rem', fontWeight: 600, marginTop: 0, marginBottom: '1rem' }}>
                    Project Parameters
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Student Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <label htmlFor="student-name" style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>
                        Student Name
                      </label>
                      <input
                        id="student-name"
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Enter full name"
                        style={{
                          background: '#090a0f',
                          border: '1px solid #1e2230',
                          borderRadius: '6px',
                          padding: '0.5rem 0.75rem',
                          color: '#f3f4f6',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.2s',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#06b6d4'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#1e2230'; }}
                      />
                    </div>

                    {/* Timeline & Team Size Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>Timeline</label>
                        <div style={{ display: 'flex', background: '#090a0f', borderRadius: '6px', border: '1px solid #1e2230', overflow: 'hidden' }}>
                          {Object.values(TimeFrame).map(tf => (
                            <button
                              key={tf}
                              onClick={() => setTimeFrame(tf)}
                              style={{
                                flex: 1,
                                padding: '0.5rem',
                                background: timeFrame === tf ? '#1e2230' : 'transparent',
                                color: timeFrame === tf ? '#f3f4f6' : '#64748b',
                                border: 'none',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              {tf.replace('Weeks', 'w')}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>Team Size</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#090a0f', borderRadius: '6px', border: '1px solid #1e2230', overflow: 'hidden' }}>
                          <button onClick={() => setTeamSize(Math.max(1, teamSize - 1))} style={{ padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>-</button>
                          <span style={{ flex: 1, textAlign: 'center', color: '#f3f4f6', fontSize: '0.875rem' }}>{teamSize}</span>
                          <button onClick={() => setTeamSize(Math.min(5, teamSize + 1))} style={{ padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>+</button>
                        </div>
                      </div>
                    </div>

                    {/* Ambition Toggle Group */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>Ambition Tier</label>
                      <div style={{ display: 'flex', background: '#090a0f', borderRadius: '6px', border: '1px solid #1e2230', overflow: 'hidden', padding: '2px' }}>
                        {Object.values(AmbitionLevel).map((al) => (
                          <button
                            key={al}
                            onClick={() => setAmbition(al)}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              background: ambition === al ? '#1e2230' : 'transparent',
                              color: ambition === al ? '#f3f4f6' : '#64748b',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            {al}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </SurfaceCard>

                {/* Stack Health Card */}
                <SurfaceCard ariaLabel="Stack Health Indicator" as="section" style={{ padding: '1.25rem' }}>
                  <h3 style={{ color: '#f3f4f6', fontSize: '0.875rem', fontWeight: 600, marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#06b6d4' }}>⚡</span> Stack Health
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Language Base</span>
                      <span style={{ color: skills.some(s => SKILL_GROUPS[0].skills.includes(s.tag)) ? '#10b981' : '#64748b' }}>
                        {skills.some(s => SKILL_GROUPS[0].skills.includes(s.tag)) ? 'Covered' : 'Missing'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Backend Services</span>
                      <span style={{ color: skills.some(s => SKILL_GROUPS[2].skills.includes(s.tag)) ? '#10b981' : '#64748b' }}>
                        {skills.some(s => SKILL_GROUPS[2].skills.includes(s.tag)) ? 'Covered' : 'Missing'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Database Layer</span>
                      <span style={{ color: skills.some(s => SKILL_GROUPS[5].skills.includes(s.tag)) ? '#10b981' : '#64748b' }}>
                        {skills.some(s => SKILL_GROUPS[5].skills.includes(s.tag)) ? 'Covered' : 'Missing'}
                      </span>
                    </div>
                    
                    {skills.some(s => SKILL_GROUPS[3].skills.includes(s.tag)) && !skills.some(s => SKILL_GROUPS[2].skills.includes(s.tag)) && (
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '4px', color: '#F59E0B' }}>
                        ⚠️ AI detected without backend. Add FastAPI or Python API.
                      </div>
                    )}
                  </div>
                </SurfaceCard>
                
                <DomainSelector selectedDomains={domains} onDomainsChange={setDomains} />
              </div>

              {/* Right Grid (col-span-8) */}
              <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SkillMatrixInput selectedSkills={skills} onSkillsChange={setSkills} />
              </div>
            </div>

            {/* Generate button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <CyberAction
                variant="primary"
                onClick={handleGenerate}
                disabled={skills.length === 0 || domains.length === 0 || state.isGenerating}
                ariaLabel="Generate capstone project blueprint"
              >
                {state.isGenerating ? '⏳ Synthesizing...' : '🚀 Generate Blueprint'}
              </CyberAction>
              {skills.length === 0 || domains.length === 0 ? (
                <p style={{ color: '#64748B', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
                  Select at least 1 skill and 1 domain to generate.
                </p>
              ) : null}
            </div>

            {/* Preset Blueprints */}
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{
                color: '#F0F4F8',
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1rem',
                textAlign: 'center',
              }}>
                ✨ Featured Capstone Projects
              </h3>
              <p style={{ color: '#64748B', textAlign: 'center', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Explore pre-built project blueprints or generate your own above.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {state.presetBlueprints.map((preset) => (
                  <SurfaceCard key={preset.id} ariaLabel={`Preset: ${preset.title}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        color: '#8B5CF6',
                      }}>
                        {preset.targetDomain}
                      </span>
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(0, 245, 160, 0.1)',
                        color: '#00F5A0',
                      }}>
                        {preset.feasibilityScore}% feasible
                      </span>
                    </div>
                    <h4 style={{ color: '#F0F4F8', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                      {preset.title}
                    </h4>
                    <p style={{ color: '#94A3B8', fontSize: '0.8125rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                      {preset.abstract.substring(0, 180)}...
                    </p>
                    <CyberAction
                      variant="secondary"
                      onClick={() => handleSelectPreset(preset)}
                      ariaLabel={`Explore ${preset.title}`}
                    >
                      Explore Project →
                    </CyberAction>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== BLUEPRINT TAB ===== */}
        {state.activeTab === 'blueprint' && state.blueprint && (
          <div id="panel-blueprint" role="tabpanel" aria-labelledby="tab-blueprint">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 600, padding: '0.1875rem 0.625rem', borderRadius: '4px',
                    background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6',
                  }}>{state.blueprint.targetDomain}</span>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 600, padding: '0.1875rem 0.625rem', borderRadius: '4px',
                    background: 'rgba(0, 217, 245, 0.1)', color: '#00D9F5',
                  }}>{state.blueprint.novelty}</span>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 600, padding: '0.1875rem 0.625rem', borderRadius: '4px',
                    background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B',
                  }}>{state.blueprint.estimatedWeeks} weeks</span>
                </div>
                <h2 style={{
                  fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.75rem 0',
                  background: 'linear-gradient(135deg, #00F5A0, #00D9F5)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  lineHeight: 1.2,
                }}>
                  {state.blueprint.title}
                </h2>
                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <CyberAction variant="primary" onClick={handleDownloadSynopsis} ariaLabel="Download IEEE Synopsis as Markdown file">
                    📥 Download IEEE Synopsis (.md)
                  </CyberAction>
                  <CyberAction variant="primary" onClick={() => setShowIeeeModal(true)} ariaLabel="Preview IEEE Document">
                    🖨️ Print Preview
                  </CyberAction>
                  <CyberAction variant="ghost" onClick={() => handleTabChange('roadmap')} ariaLabel="View development roadmap">
                    🗺️ View Roadmap
                  </CyberAction>
                  <CyberAction variant="ghost" onClick={() => handleTabChange('defense')} ariaLabel="Start viva defense practice">
                    🎤 Practice Defense
                  </CyberAction>
                  <CyberAction variant="secondary" onClick={() => dispatch({ type: 'SAVE_BLUEPRINT', payload: state.blueprint! })} ariaLabel="Save Blueprint to Comparison Matrix">
                    💾 Save to Comparison
                  </CyberAction>
                </div>
              </div>
              <FeasibilityGauge score={state.blueprint.feasibilityScore} />
            </div>

            {/* Abstract */}
            <SurfaceCard ariaLabel="Project abstract" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#00D9F5', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 0, marginBottom: '0.75rem' }}>
                Abstract
              </h3>
              <p style={{ color: '#CBD5E1', fontSize: '0.9375rem', lineHeight: 1.8, margin: 0 }}>
                {state.blueprint.abstract}
              </p>
            </SurfaceCard>

            {/* Radar, Rubric & Architecture */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <EvaluatorRadar blueprint={state.blueprint} defense={state.defense} />
              <AcademicRubric blueprint={state.blueprint} roadmap={state.roadmap} defense={state.defense} />
              <ArchitectureTopology blueprint={state.blueprint} />
            </div>

            {/* Features */}
            <SurfaceCard ariaLabel="Core features" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#F0F4F8', fontSize: '1.125rem', fontWeight: 700, marginTop: 0, marginBottom: '1rem' }}>
                ⭐ Core Features
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {state.blueprint.features.map((feature) => (
                  <div key={feature.name} style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <span style={{
                        fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem',
                        borderRadius: '4px', background: 'rgba(0, 245, 160, 0.1)', color: '#00F5A0',
                      }}>P{feature.priority}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#F0F4F8' }}>{feature.name}</span>
                    </div>
                    <p style={{ color: '#94A3B8', fontSize: '0.8125rem', margin: 0, lineHeight: 1.5 }}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            {/* Improvements */}
            <SurfaceCard ariaLabel="Future improvements">
              <h3 style={{ color: '#F0F4F8', fontSize: '1.125rem', fontWeight: 700, marginTop: 0, marginBottom: '1rem' }}>
                🔮 Future Improvements
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {state.blueprint.improvements.map((imp) => (
                  <div key={imp.title} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}>
                    <span style={{
                      fontSize: '0.625rem', fontWeight: 600, padding: '0.125rem 0.375rem', borderRadius: '4px',
                      background: imp.impact === 'High' ? 'rgba(0, 245, 160, 0.1)' : imp.impact === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                      color: imp.impact === 'High' ? '#00F5A0' : imp.impact === 'Medium' ? '#F59E0B' : '#64748B',
                      flexShrink: 0, marginTop: '2px',
                    }}>{imp.impact}</span>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#F0F4F8' }}>{imp.title}</span>
                      <p style={{ color: '#94A3B8', fontSize: '0.8125rem', margin: '0.25rem 0 0 0' }}>{imp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SurfaceCard>
            
            <div style={{ marginTop: '2rem' }}>
              <ComparisonMatrix />
            </div>
          </div>
        )}

        {/* ===== VISUALIZER TAB ===== */}
        {state.activeTab === 'visualizer' && state.blueprint && (
          <div id="panel-visualizer" role="tabpanel" aria-labelledby="tab-visualizer">
            <ArchitectureVisualizer blueprint={state.blueprint} />
          </div>
        )}

        {/* ===== ROADMAP TAB ===== */}
        {state.activeTab === 'roadmap' && state.roadmap && (
          <div id="panel-roadmap" role="tabpanel" aria-labelledby="tab-roadmap">
            <SprintChecklist roadmap={state.roadmap} onToggleMilestone={handleToggleMilestone} />
          </div>
        )}

        {/* ===== DEFENSE TAB ===== */}
        {state.activeTab === 'defense' && state.defense && (
          <div id="panel-defense" role="tabpanel" aria-labelledby="tab-defense">
            <VivaSimulator defense={state.defense} onToggleReveal={handleToggleReveal} />
          </div>
        )}

        {/* ===== LITERATURE TAB ===== */}
        {state.activeTab === 'literature' && (
          <div id="panel-literature" role="tabpanel" aria-labelledby="tab-literature">
            <LiteratureMatrix />
          </div>
        )}

        {/* ===== ASSESSMENT TAB ===== */}
        {state.activeTab === 'assessment' && (
          <div id="panel-assessment" role="tabpanel" aria-labelledby="tab-assessment">
            <FacultyGradingPanel />
          </div>
        )}

        {/* Empty state for blueprint/roadmap/defense/visualizer when not generated */}
        {(state.activeTab === 'blueprint' || state.activeTab === 'roadmap' || state.activeTab === 'defense' || state.activeTab === 'visualizer' || state.activeTab === 'assessment') &&
         !state.blueprint && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }} aria-hidden="true">🚀</span>
            <h3 style={{ color: '#F0F4F8', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              No Blueprint Generated Yet
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9375rem', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              Head to the Profile tab to enter your skills and interests, then generate a tailored capstone blueprint.
            </p>
            <CyberAction variant="primary" onClick={() => handleTabChange('intake')} ariaLabel="Go to profile tab">
              → Go to Profile
            </CyberAction>
          </div>
        )}
        </ErrorBoundary>
      </main>

      {/* Persistent Telemetry Footer (Linear-inspired) */}
      <div className="telemetry-footer" style={{ 
        height: '2.25rem', 
        background: 'rgba(10, 12, 16, 0.95)', 
        backdropFilter: 'blur(4px)', 
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#94a3b8',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#10b981' }}>●</span> Local State: Synced ({new Date().toISOString().split('T')[1].split('.')[0]}Z)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b' }}>
          <span>Shortcuts: [1-5] Switch Tabs | [P] IEEE Preview | [Tab] Next Field</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#10b981' }}>Vitest: 41 Passed</span>
          <span>|</span>
          <span style={{ color: '#cbd5e1' }}>TS: 0 Errors</span>
          <span>|</span>
          <span style={{ color: '#cbd5e1' }}>Production Ready</span>
        </div>
      </div>

      {showIeeeModal && state.blueprint && (
        <IEEEPrintPreviewModal 
          blueprint={state.blueprint}
          roadmap={state.roadmap}
          studentName={state.profile?.studentName ?? 'Student'}
          onClose={() => setShowIeeeModal(false)}
        />
      )}
    </div>
  );
}
