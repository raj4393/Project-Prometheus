import React, { useEffect, useState } from 'react';
import type { BlueprintContract } from '../../domain/contracts/blueprint.contract';
import type { RoadmapContract } from '../../domain/contracts/roadmap.contract';
import { generateIEEEMarkdown } from '../../infrastructure/serialization/ieeeMarkdownExporter';
import { SurfaceCard } from '../design-system/SurfaceCard';
import { CyberAction } from '../design-system/CyberAction';

interface IEEEPrintPreviewModalProps {
  readonly blueprint: BlueprintContract;
  readonly roadmap: RoadmapContract | null;
  readonly studentName: string;
  readonly onClose: () => void;
}

export function IEEEPrintPreviewModal({ blueprint, roadmap, studentName, onClose }: IEEEPrintPreviewModalProps): React.JSX.Element {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    // Basic Markdown to HTML conversion for preview purposes
    const md = generateIEEEMarkdown(blueprint, roadmap, studentName);
    const html = md
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/---/gim, '<hr/>')
      .replace(/\n/gim, '<br/>');
    
    setHtmlContent(html);
  }, [blueprint, roadmap, studentName]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(5,7,14,0.9)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '2rem'
    }}>
      <div style={{ background: '#fff', color: '#000', width: '100%', maxWidth: '900px', height: '100%', overflowY: 'auto', borderRadius: '8px', padding: '2rem' }} className="print-container">
        
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-container, .print-container * { visibility: visible; }
            .print-container { position: absolute; left: 0; top: 0; width: 100%; }
            .print-content { column-count: 2; column-gap: 2rem; font-family: "Times New Roman", Times, serif; }
            h1 { text-align: center; column-span: all; font-size: 24pt; margin-bottom: 24pt; }
            h2 { font-size: 14pt; margin-top: 18pt; margin-bottom: 6pt; }
            h3 { font-size: 12pt; margin-top: 12pt; margin-bottom: 4pt; }
            p, li { font-size: 10pt; line-height: 1.2; margin-bottom: 6pt; }
            .no-print { display: none !important; }
          }
          
          .print-content { column-count: 2; column-gap: 2rem; font-family: "Times New Roman", Times, serif; text-align: justify; }
          .print-content h1 { text-align: center; column-span: all; font-size: 24pt; margin-bottom: 24pt; }
        `}</style>
        
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
          <h2 style={{ margin: 0, color: '#333' }}>IEEE Print Preview</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <CyberAction variant="primary" onClick={() => window.print()}>Print / Save PDF</CyberAction>
            <div style={{ display: 'inline-block', background: '#ccc', borderRadius: '8px' }}>
              <CyberAction variant="ghost" onClick={onClose}>Close</CyberAction>
            </div>
          </div>
        </div>

        <div className="print-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
}
