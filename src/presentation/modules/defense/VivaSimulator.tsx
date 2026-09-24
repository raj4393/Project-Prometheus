import React from 'react';
/**
 * @module VivaSimulator
 * @description Collapsible examiner question & answer defense simulator.
 * Shows at least 4 interactive viva questions with click-to-reveal model answers.
 */

import { useCallback, useState, useRef } from 'react';
import type { DefenseContract } from '../../../domain/contracts/defense.contract';
import { SurfaceCard } from '../../design-system/SurfaceCard';
import { CyberAction } from '../../design-system/CyberAction';

// Define SpeechRecognition types globally
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

/**
 * Props for the VivaSimulator component.
 *
 * @property defense - The defense contract containing viva questions
 * @property onToggleReveal - Callback when a question's answer visibility is toggled
 */
interface VivaSimulatorProps {
  readonly defense: DefenseContract;
  readonly onToggleReveal: (questionId: string) => void;
}

/**
 * Difficulty badge colors.
 */
const DIFFICULTY_COLORS: Record<string, string> = {
  Foundational: '#00F5A0',
  Intermediate: '#00D9F5',
  Advanced: '#F59E0B',
  Expert: '#EF4444',
};

/**
 * An interactive viva voce defense simulator with collapsible Q&A panels.
 * Each question features click-to-reveal model answers, difficulty badges,
 * and scoring rubrics.
 *
 * @param props - Component configuration
 * @returns The rendered viva simulator interface
 */
export function VivaSimulator({ defense, onToggleReveal }: VivaSimulatorProps): React.JSX.Element {
  const handleReveal = useCallback(
    (questionId: string) => {
      onToggleReveal(questionId);
    },
    [onToggleReveal]
  );

  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const recognitionRef = useRef<any>(null);

  const hasSpeechSupport = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const calculateScore = (answer: string, spoken: string) => {
    const answerWords = answer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const spokenWords = spoken.toLowerCase().split(/\s+/);
    const matches = answerWords.filter(w => spokenWords.some(sw => sw.includes(w))).length;
    return answerWords.length > 0 ? Math.min(100, Math.round((matches / answerWords.length) * 100)) : 0;
  };

  const handleManualInput = (questionId: string, modelAnswer: string, text: string) => {
    setTranscripts(prev => ({ ...prev, [questionId]: text }));
    setScores(prev => ({ ...prev, [questionId]: calculateScore(modelAnswer, text) }));
  };

  const startRecording = useCallback((questionId: string, modelAnswer: string) => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscripts(prev => ({ ...prev, [questionId]: currentTranscript }));
      
      const score = calculateScore(modelAnswer, currentTranscript);
      setScores(prev => ({ ...prev, [questionId]: score }));
    };

    recognitionRef.current.onend = () => {
      setActiveRecordingId(null);
    };

    setActiveRecordingId(questionId);
    setTranscripts(prev => ({ ...prev, [questionId]: '' }));
    setScores(prev => ({ ...prev, [questionId]: 0 }));
    recognitionRef.current.start();
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setActiveRecordingId(null);
    }
  }, []);

  return (
    <SurfaceCard ariaLabel="Viva voce defense simulator" as="section">
      <h3 style={{ color: '#F0F4F8', fontSize: '1.125rem', fontWeight: 700, marginTop: 0, marginBottom: '0.5rem' }}>
        🎤 Viva Voce Defense Simulator
      </h3>
      <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Practice defending your project with these examiner questions. Click to reveal model answers.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {defense.questions.map((question, index) => {
          const diffColor = DIFFICULTY_COLORS[question.difficulty] ?? '#CBD5E1';
          const panelId = `viva-answer-${question.id}`;

          return (
            <div
              key={question.id}
              style={{
                borderRadius: '12px',
                border: question.isRevealed
                  ? '1px solid rgba(0, 217, 245, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
                overflow: 'hidden',
                transition: 'border-color 0.3s ease',
              }}
            >
              {/* Question header */}
              <button
                onClick={() => handleReveal(question.id)}
                aria-expanded={question.isRevealed}
                aria-controls={panelId}
                aria-label={`Question ${index + 1}: ${question.question}`}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: question.isRevealed ? 'rgba(0, 217, 245, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  color: '#CBD5E1',
                  transition: 'background 0.2s ease',
                }}
              >
                {/* Question number */}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: `${diffColor}15`,
                    color: diffColor,
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: diffColor,
                      background: `${diffColor}15`,
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                    }}>
                      {question.difficulty}
                    </span>
                    <span style={{
                      fontSize: '0.6875rem',
                      color: '#64748B',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                    }}>
                      {question.category}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#F0F4F8', lineHeight: 1.5 }}>
                    {question.question}
                  </p>
                </div>
                
                {/* Expand icon */}
                <span
                  style={{
                    color: '#64748B',
                    fontSize: '1.25rem',
                    transform: question.isRevealed ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>

              {/* Answer panel */}
              {question.isRevealed && (
                <div
                  id={panelId}
                  role="region"
                  aria-label={`Model answer for question ${index + 1}`}
                  style={{
                    padding: '1rem 1rem 1rem 3.5rem',
                    background: 'rgba(0, 217, 245, 0.02)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    animation: 'slideDown 0.3s ease-out',
                  }}
                >
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ color: '#00D9F5', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Model Answer
                    </span>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: '0.875rem', lineHeight: 1.7, margin: '0 0 1rem 0' }}>
                    {question.modelAnswer}
                  </p>
                  <div style={{
                    padding: '0.625rem 0.875rem',
                    background: 'rgba(139, 92, 246, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                  }}>
                    <span style={{ color: '#8B5CF6', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Scoring Rubric
                    </span>
                    <p style={{ color: '#94A3B8', fontSize: '0.8125rem', margin: '0.375rem 0 0 0' }}>
                      {question.scoringRubric}
                    </p>
                  </div>

                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#F0F4F8', fontWeight: 600 }}>Practice Your Answer</span>
                      {hasSpeechSupport && (
                        activeRecordingId === question.id ? (
                          <button onClick={(e) => { e.stopPropagation(); stopRecording(); }} style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                            ⏹ Stop
                          </button>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); startRecording(question.id, question.modelAnswer); }} style={{ background: 'rgba(0, 217, 245, 0.2)', color: '#00D9F5', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                            🎤 Start Recording
                          </button>
                        )
                      )}
                    </div>
                    
                    {!hasSpeechSupport && (
                      <textarea
                        value={transcripts[question.id] || ''}
                        onChange={(e) => handleManualInput(question.id, question.modelAnswer, e.target.value)}
                        placeholder="Speech API not supported in this browser. Type your response here..."
                        style={{ width: '100%', minHeight: '80px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '0.75rem', borderRadius: '4px', fontSize: '0.8125rem', marginTop: '0.5rem' }}
                      />
                    )}

                    {hasSpeechSupport && transcripts[question.id] !== undefined && (
                      <div style={{ fontSize: '0.8125rem', color: '#94A3B8', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                        "{transcripts[question.id]}"
                      </div>
                    )}
                    {scores[question.id] !== undefined && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: scores[question.id] > 50 ? '#00F5A0' : '#F59E0B' }}>
                        Keyword Match Score: {scores[question.id]}%
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
        <CyberAction
          variant="ghost"
          onClick={() => {
            defense.questions.forEach((q) => {
              if (!q.isRevealed) onToggleReveal(q.id);
            });
          }}
          ariaLabel="Reveal all model answers"
        >
          Reveal All Answers
        </CyberAction>
      </div>
    </SurfaceCard>
  );
}
