import React, { useState } from 'react';
import { useStore } from '../../../core/state/StoreContext';
import { SurfaceCard } from '../../design-system/SurfaceCard';
import { CyberAction } from '../../design-system/CyberAction';
import { GuideReviewSheetModal } from './GuideReviewSheetModal';

export function FacultyGradingPanel(): React.JSX.Element {
  const { state, dispatch } = useStore();
  const assessment = state.facultyAssessment || {
    review0: { score: 0, remarks: '', date: '' },
    review1: { score: 0, remarks: '', date: '' },
    review2: { score: 0, remarks: '', date: '' }
  };

  const [form, setForm] = useState(assessment);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'review0' | 'review1' | 'review2'>('review0');

  const total = (form.review0?.score || 0) + (form.review1?.score || 0) + (form.review2?.score || 0);
  let grade = 'Needs Revision';
  let color = '#F59E0B';
  if (total >= 85) { grade = 'Distinction'; color = '#00F5A0'; }
  else if (total >= 70) { grade = 'First Class'; color = '#00D9F5'; }
  else if (total >= 50) { grade = 'Pass'; color = '#8B5CF6'; }

  const handleSave = () => {
    dispatch({ type: 'UPDATE_ASSESSMENT', payload: form });
    alert('Assessment saved successfully!');
  };

  const renderReviewForm = (key: 'review0' | 'review1' | 'review2', label: string, maxScore: number) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
      <div>
        <label style={{ color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 600 }}>{label} Score (Max {maxScore})</label>
        <input type="number" min="0" max={maxScore} value={form[key]?.score || 0} onChange={e => setForm({ ...form, [key]: { ...form[key], score: Math.min(maxScore, Number(e.target.value)) } })} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', color: '#FFF', borderRadius: '4px', marginTop: '0.25rem' }} />
      </div>
      <div>
        <label style={{ color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 600 }}>Date of Review</label>
        <input type="date" value={form[key]?.date || ''} onChange={e => setForm({ ...form, [key]: { ...form[key], date: e.target.value } })} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', color: '#FFF', borderRadius: '4px', marginTop: '0.25rem' }} />
      </div>
      <div>
        <label style={{ color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 600 }}>Faculty Remarks (Institutional Sign-off)</label>
        <textarea value={form[key]?.remarks || ''} onChange={e => setForm({ ...form, [key]: { ...form[key], remarks: e.target.value } })} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', color: '#FFF', borderRadius: '4px', marginTop: '0.25rem', minHeight: '100px' }} />
      </div>
    </div>
  );

  return (
    <SurfaceCard ariaLabel="Faculty Grading Panel" as="section">
      <h3 style={{ color: '#F0F4F8', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0' }}>📋 Faculty Audit & Assessment Suite</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            <button onClick={() => setActiveTab('review0')} style={{ padding: '0.5rem 1rem', background: activeTab === 'review0' ? 'rgba(0, 245, 160, 0.1)' : 'transparent', color: activeTab === 'review0' ? '#00F5A0' : '#94A3B8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Review 0 (20)</button>
            <button onClick={() => setActiveTab('review1')} style={{ padding: '0.5rem 1rem', background: activeTab === 'review1' ? 'rgba(0, 245, 160, 0.1)' : 'transparent', color: activeTab === 'review1' ? '#00F5A0' : '#94A3B8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Review 1 (30)</button>
            <button onClick={() => setActiveTab('review2')} style={{ padding: '0.5rem 1rem', background: activeTab === 'review2' ? 'rgba(0, 245, 160, 0.1)' : 'transparent', color: activeTab === 'review2' ? '#00F5A0' : '#94A3B8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Review 2 (50)</button>
          </div>
          
          {activeTab === 'review0' && renderReviewForm('review0', 'Synopsis & Ideation', 20)}
          {activeTab === 'review1' && renderReviewForm('review1', 'Midterm & Architecture', 30)}
          {activeTab === 'review2' && renderReviewForm('review2', 'Final Defense & Implementation', 50)}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <CyberAction variant="primary" onClick={handleSave}>💾 Save Assessment</CyberAction>
            <CyberAction variant="secondary" onClick={() => setShowModal(true)}>🖨️ Print Review Sheet</CyberAction>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <h4 style={{ color: '#64748B', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem 0' }}>Final Grade Calculator</h4>
          
          <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: `8px solid ${color}`, boxShadow: `0 0 20px ${color}40` }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, color: '#FFF' }}>{total}</span>
          </div>

          <div style={{ marginTop: '1.5rem', fontSize: '1.25rem', fontWeight: 700, color: color }}>
            {grade}
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
            Academic Status Band
          </p>
        </div>
      </div>

      {showModal && state.blueprint && (
        <GuideReviewSheetModal
          blueprint={state.blueprint}
          assessment={form}
          studentName={state.profile?.studentName || 'Student'}
          onClose={() => setShowModal(false)}
        />
      )}
    </SurfaceCard>
  );
}
