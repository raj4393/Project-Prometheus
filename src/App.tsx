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
import { SkillMatrixInput } from './presentation/modules/intake/SkillMatrixInput';
import { DomainSelector } from './presentation/modules/intake/DomainSelector';
import { ArchitectureTopology } from './presentation/modules/synthesis/ArchitectureTopology';
import { FeasibilityGauge } from './presentation/modules/synthesis/FeasibilityGauge';
import { SprintChecklist } from './presentation/modules/roadmap/SprintChecklist';
import { VivaSimulator } from './presentation/modules/defense/VivaSimulator';
import { SurfaceCard } from './presentation/design-system/SurfaceCard';
import { CyberAction } from './presentation/design-system/CyberAction';

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#05070E' }}>
      <Navbar
        activeTab={state.activeTab}
        onTabChange={handleTabChange}
        engineStatus={state.engineStatus}
        isAudioEnabled={state.isAudioEnabled}
        onToggleAudio={handleToggleAudio}
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
          <div id="panel-intake" role="tabpanel" aria-labelledby="tab-intake">
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

            {/* Student name input */}
            <SurfaceCard ariaLabel="Student information" as="section" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#F0F4F8', fontSize: '1.125rem', fontWeight: 700, marginTop: 0, marginBottom: '1rem' }}>
                👤 Your Profile
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="student-name" style={{ color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500 }}>
                  Full Name
                </label>
                <input
                  id="student-name"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                  aria-label="Student full name"
                  style={{
                    background: 'rgba(5, 7, 14, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    color: '#F0F4F8',
                    fontSize: '0.9375rem',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#00D9F5'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                />
              </div>

              {/* Time, Ambition, Team row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label htmlFor="timeframe" style={{ color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500 }}>Timeline</label>
                  <select
                    id="timeframe"
                    value={timeFrame}
                    onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
                    aria-label="Project timeline"
                    style={{
                      background: 'rgba(5, 7, 14, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      color: '#F0F4F8',
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      cursor: 'pointer',
                    }}
                  >
                    {Object.values(TimeFrame).map((tf) => (
                      <option key={tf} value={tf}>{tf}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label htmlFor="ambition" style={{ color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500 }}>Ambition Level</label>
                  <select
                    id="ambition"
                    value={ambition}
                    onChange={(e) => setAmbition(e.target.value as AmbitionLevel)}
                    aria-label="Project ambition level"
                    style={{
                      background: 'rgba(5, 7, 14, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      color: '#F0F4F8',
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      cursor: 'pointer',
                    }}
                  >
                    {Object.values(AmbitionLevel).map((al) => (
                      <option key={al} value={al}>{al}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label htmlFor="team-size" style={{ color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500 }}>Team Size</label>
                  <input
                    id="team-size"
                    type="number"
                    min={1}
                    max={5}
                    value={teamSize}
                    onChange={(e) => setTeamSize(Math.max(1, Math.min(5, Number(e.target.value))))}
                    aria-label="Team size"
                    style={{
                      background: 'rgba(5, 7, 14, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      color: '#F0F4F8',
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  />
                </div>
              </div>
            </SurfaceCard>

            <div style={{ marginBottom: '1.25rem' }}>
              <SkillMatrixInput selectedSkills={skills} onSkillsChange={setSkills} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <DomainSelector selectedDomains={domains} onDomainsChange={setDomains} />
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
                  <CyberAction variant="ghost" onClick={() => handleTabChange('roadmap')} ariaLabel="View development roadmap">
                    🗺️ View Roadmap
                  </CyberAction>
                  <CyberAction variant="ghost" onClick={() => handleTabChange('defense')} ariaLabel="Start viva defense practice">
                    🎤 Practice Defense
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

            {/* Architecture */}
            <div style={{ marginBottom: '1.25rem' }}>
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

        {/* Empty state for blueprint/roadmap/defense when not generated */}
        {(state.activeTab === 'blueprint' || state.activeTab === 'roadmap' || state.activeTab === 'defense') &&
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

      <LiveStatusBar
        engineStatus={state.engineStatus}
        synthesisLatency={latency}
        blueprintCount={state.presetBlueprints.length + (state.blueprint ? 1 : 0)}
      />
    </div>
  );
}
