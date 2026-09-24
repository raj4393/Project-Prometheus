import React, { useState } from 'react';
import type { LiteratureEntry } from '../../../domain/contracts/literature.contract';
import { SurfaceCard } from '../../design-system/SurfaceCard';
import { CyberAction } from '../../design-system/CyberAction';
import { useStore } from '../../../core/state/StoreContext';

export function LiteratureMatrix(): React.JSX.Element {
  const { state, dispatch } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<LiteratureEntry>>({});
  const [bibtexInput, setBibtexInput] = useState('');
  const [showBibtex, setShowBibtex] = useState(false);

  const handleBibtexImport = () => {
    try {
      const titleMatch = bibtexInput.match(/title\s*=\s*[{"]([^}"]+)[}"]/i);
      const authorMatch = bibtexInput.match(/author\s*=\s*[{"]([^}"]+)[}"]/i);
      const yearMatch = bibtexInput.match(/year\s*=\s*[{"]?(\d{4})[}"]?/i);
      const journalMatch = bibtexInput.match(/(?:journal|booktitle)\s*=\s*[{"]([^}"]+)[}"]/i);
      
      if (titleMatch) {
        setNewEntry(prev => ({
          ...prev,
          title: titleMatch[1],
          authors: authorMatch ? `${authorMatch[1]}, ${yearMatch?.[1] || ''}` : prev.authors,
          source: journalMatch ? journalMatch[1] : prev.source,
        }));
        setBibtexInput('');
        setShowBibtex(false);
      } else {
        alert("Could not parse BibTeX. Ensure it has at least a title.");
      }
    } catch {
      alert("Error parsing BibTeX.");
    }
  };

  const handleDownloadBibtex = () => {
    if (state.literature.length === 0) return;
    let bibtexStr = '';
    state.literature.forEach((entry, i) => {
      bibtexStr += `@article{ref${i + 1},\n  title={${entry.title}},\n  author={${entry.authors.split(',')[0]}},\n  journal={${entry.source}}\n}\n\n`;
    });
    const blob = new Blob([bibtexStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'references.bib';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!newEntry.title || !newEntry.methodology) return;
    dispatch({
      type: 'ADD_LITERATURE_ENTRY',
      payload: {
        id: crypto.randomUUID(),
        title: newEntry.title,
        authors: newEntry.authors || '',
        source: newEntry.source || '',
        methodology: newEntry.methodology,
        limitations: newEntry.limitations || '',
        novelty: newEntry.novelty || '',
      }
    });
    setNewEntry({});
    setIsEditing(false);
  };

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_LITERATURE_ENTRY', payload: id });
  };

  return (
    <SurfaceCard ariaLabel="Literature Review Matrix" as="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#F0F4F8', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
          📚 Literature Review Matrix
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <CyberAction variant="ghost" onClick={handleDownloadBibtex}>📥 Export .bib</CyberAction>
          <CyberAction variant="primary" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : '➕ Add Reference'}
          </CyberAction>
        </div>
      </div>

      {isEditing && (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => setShowBibtex(!showBibtex)} style={{ background: 'transparent', color: '#8B5CF6', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
              {showBibtex ? 'Hide Quick Import' : '📋 Quick Import / BibTeX'}
            </button>
          </div>
          {showBibtex && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <textarea 
                value={bibtexInput} 
                onChange={e => setBibtexInput(e.target.value)} 
                placeholder="@article{...}" 
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', color: '#FFF', borderRadius: '4px', fontFamily: 'monospace', minHeight: '80px' }} 
              />
              <CyberAction variant="secondary" onClick={handleBibtexImport}>Parse</CyberAction>
            </div>
          )}
          <div style={{ display: 'grid', gap: '1rem' }}>
            <input 
              placeholder="Paper Title" 
              value={newEntry.title || ''}
              onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', color: '#FFF', borderRadius: '4px' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input 
                placeholder="Authors / Year (e.g., Smith et al., 2023)" 
                value={newEntry.authors || ''}
                onChange={e => setNewEntry({ ...newEntry, authors: e.target.value })}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', color: '#FFF', borderRadius: '4px' }}
              />
              <input 
                placeholder="Source (e.g., IEEE, Springer)" 
                value={newEntry.source || ''}
                onChange={e => setNewEntry({ ...newEntry, source: e.target.value })}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', color: '#FFF', borderRadius: '4px' }}
              />
            </div>
            <input 
              placeholder="Methodology Used" 
              value={newEntry.methodology || ''}
              onChange={e => setNewEntry({ ...newEntry, methodology: e.target.value })}
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', color: '#FFF', borderRadius: '4px' }}
            />
            <input 
              placeholder="Limitations of Existing System" 
              value={newEntry.limitations || ''}
              onChange={e => setNewEntry({ ...newEntry, limitations: e.target.value })}
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', color: '#FFF', borderRadius: '4px' }}
            />
            <input 
              placeholder="Proposed Novelty / Gap Addressed" 
              value={newEntry.novelty || ''}
              onChange={e => setNewEntry({ ...newEntry, novelty: e.target.value })}
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', color: '#FFF', borderRadius: '4px' }}
            />
            <CyberAction variant="secondary" onClick={handleSave}>Save Reference</CyberAction>
          </div>
        </div>
      )}

      {state.literature.length === 0 ? (
        <p style={{ color: '#94A3B8', fontSize: '0.9375rem', textAlign: 'center', padding: '2rem 0' }}>
          No literature references added yet. Start tracking your reference papers here.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#CBD5E1', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '0.75rem', color: '#00D9F5' }}>Title & Source</th>
                <th style={{ padding: '0.75rem', color: '#00F5A0' }}>Methodology</th>
                <th style={{ padding: '0.75rem', color: '#F59E0B' }}>Limitations</th>
                <th style={{ padding: '0.75rem', color: '#8B5CF6' }}>Proposed Novelty</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.literature.map(entry => (
                <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600, color: '#F0F4F8' }}>{entry.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>{entry.authors} • {entry.source}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{entry.methodology}</td>
                  <td style={{ padding: '0.75rem' }}>{entry.limitations}</td>
                  <td style={{ padding: '0.75rem' }}>{entry.novelty}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => handleRemove(entry.id)} style={{ background: 'transparent', border: '1px solid rgba(236,72,153,0.5)', color: '#EC4899', borderRadius: '4px', cursor: 'pointer', padding: '0.25rem 0.5rem' }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SurfaceCard>
  );
}
