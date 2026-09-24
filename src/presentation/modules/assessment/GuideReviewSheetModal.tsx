import React from 'react';
import type { BlueprintContract } from '../../../domain/contracts/blueprint.contract';
import type { FacultyAssessment } from '../../../core/state/projectReducer';

interface GuideReviewSheetModalProps {
  readonly blueprint: BlueprintContract;
  readonly assessment: FacultyAssessment;
  readonly studentName: string;
  readonly onClose: () => void;
}

export function GuideReviewSheetModal({ blueprint, assessment, studentName, onClose }: GuideReviewSheetModalProps): React.JSX.Element {
  const total = (assessment.review0?.score || 0) + (assessment.review1?.score || 0) + (assessment.review2?.score || 0);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <div
        className="print-modal"
        style={{
          background: '#FFF',
          color: '#000',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '3rem',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          fontFamily: "'Times New Roman', Times, serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Capstone Project Assessment</h1>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Official Guide Review & Grading Sheet</p>
          </div>
          <button onClick={() => window.print()} style={{ padding: '0.5rem 1rem', background: '#000', color: '#FFF', border: 'none', cursor: 'pointer', borderRadius: '4px' }} className="hide-on-print">
            🖨️ Print Sheet
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '0.5rem', fontWeight: 'bold', width: '30%' }}>Student Name</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{studentName}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '0.5rem', fontWeight: 'bold' }}>Project Title</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{blueprint.title}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '0.5rem', fontWeight: 'bold' }}>Domain</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem' }}>{blueprint.targetDomain}</td>
            </tr>
          </tbody>
        </table>

        <h2 style={{ fontSize: '1.125rem', borderBottom: '2px solid #000', paddingBottom: '0.25rem', marginBottom: '1rem' }}>Evaluation Breakdown</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'left' }}>Criteria Phase</th>
              <th style={{ border: '1px solid #000', padding: '0.5rem', width: '15%' }}>Max Marks</th>
              <th style={{ border: '1px solid #000', padding: '0.5rem', width: '15%' }}>Awarded</th>
              <th style={{ border: '1px solid #000', padding: '0.5rem', width: '30%' }}>Remarks & Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '0.5rem' }}>Review 0 (Synopsis & Ideation)</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>20</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>{assessment.review0?.score || 0}</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem', fontSize: '0.75rem' }}>
                {assessment.review0?.remarks}<br/><small>{assessment.review0?.date}</small>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '0.5rem' }}>Review 1 (Midterm & Architecture)</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>30</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>{assessment.review1?.score || 0}</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem', fontSize: '0.75rem' }}>
                {assessment.review1?.remarks}<br/><small>{assessment.review1?.date}</small>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '0.5rem' }}>Review 2 (Final Defense & Impl)</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>50</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>{assessment.review2?.score || 0}</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem', fontSize: '0.75rem' }}>
                {assessment.review2?.remarks}<br/><small>{assessment.review2?.date}</small>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '0.5rem', fontWeight: 'bold', textAlign: 'right' }}>Total Marks</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>{total}</td>
              <td style={{ border: '1px solid #000', padding: '0.5rem' }}></td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem' }}>
          <div style={{ borderTop: '1px solid #000', width: '40%', paddingTop: '0.5rem', textAlign: 'center' }}>
            Signature of Project Guide
          </div>
          <div style={{ borderTop: '1px solid #000', width: '40%', paddingTop: '0.5rem', textAlign: 'center' }}>
            Signature of External Examiner
          </div>
        </div>
      </div>
    </div>
  );
}
