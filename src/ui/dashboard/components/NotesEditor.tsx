import React, { useState, useEffect } from 'react';
import { ProblemMetadata, StructuredNotes, SolutionRecord } from '../../../core/types/problem';
import { EMPTY_STRUCTURED_NOTES, formatNotesMarkdown, parseNotesMarkdown } from '../../../core/generator/template';
import { storage } from '../../../core/storage/chrome-storage';
import { GitHubClient } from '../../../core/github/client';
import { getNotesFilePath } from '../../../core/sync/path-sanitizer';

interface Props {
  problemId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export const NotesEditor: React.FC<Props> = ({ problemId, onClose, onUpdated }) => {
  const [meta, setMeta] = useState<ProblemMetadata | null>(null);
  const [notes, setNotes] = useState<StructuredNotes>(EMPTY_STRUCTURED_NOTES);
  const [activeApproachKey, setActiveApproachKey] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProblem() {
      const p = await storage.getProblemMetadata(problemId);
      if (p) {
        setMeta(p);
        const keys = Object.keys(p.solutions || {});
        if (keys.length > 0) setActiveApproachKey(keys[0]);

        // Attempt to load notes from GitHub or default
        try {
          const settings = (await storage.getSettings()).github;
          if (settings.token && settings.owner && settings.repo) {
            const client = new GitHubClient(settings);
            const notesPath = getNotesFilePath(p.id, p.slug, settings.defaultPathPrefix);
            const remoteNotes = await client.getFileContent(notesPath);
            if (remoteNotes?.content) {
              setNotes(parseNotesMarkdown(remoteNotes.content));
              return;
            }
          }
        } catch {
          // ignore network fetch failures, use empty
        }
      }
    }
    loadProblem();
  }, [problemId]);

  const handleSaveNotes = async () => {
    if (!meta) return;
    setIsSaving(true);
    setStatusMsg(null);

    try {
      // 1. Save metadata locally
      await storage.saveProblemMetadata(meta);

      // 2. Format markdown and commit directly to GitHub if connected
      const settings = (await storage.getSettings()).github;
      if (settings.token && settings.owner && settings.repo) {
        const client = new GitHubClient(settings);
        const notesPath = getNotesFilePath(meta.id, meta.slug, settings.defaultPathPrefix);
        const markdown = formatNotesMarkdown(meta, notes);

        // Fetch existing sha if available
        const existing = await client.getFileContent(notesPath);
        await client.putSingleFile(
          notesPath,
          markdown,
          `docs(notes): update notes for ${meta.title}`,
          existing?.sha
        );
        setStatusMsg('Notes saved and committed to GitHub!');
      } else {
        setStatusMsg('Notes saved locally (configure GitHub in settings to push).');
      }

      onUpdated();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg(`Error saving notes: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!meta) {
    return <div style={{ padding: '20px' }}>Loading notes...</div>;
  }

  const solutionList = Object.entries(meta.solutions || {});
  const activeSolution: SolutionRecord | undefined = meta.solutions[activeApproachKey];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          width: '900px',
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>#{meta.id}</span>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{meta.title}</h2>
              <span className={`badge badge-${meta.difficulty.toLowerCase()}`}>{meta.difficulty}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              LeetCode URL: <a href={meta.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)' }}>{meta.url || 'N/A'}</a>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="primary" onClick={handleSaveNotes} disabled={isSaving}>
              {isSaving ? 'Saving...' : '💾 Save & Commit Notes'}
            </button>
            <button onClick={onClose}>✕ Close</button>
          </div>
        </div>

        {statusMsg && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(88, 166, 255, 0.1)',
              border: '1px solid var(--accent-blue)',
              color: 'var(--accent-blue)',
              fontSize: '13px',
            }}
          >
            {statusMsg}
          </div>
        )}

        {/* Approach Evolution Selector */}
        {solutionList.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Recorded Approaches & Languages:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {solutionList.map(([key, sol]) => (
                <button
                  key={key}
                  onClick={() => setActiveApproachKey(key)}
                  style={{
                    fontSize: '12px',
                    borderColor: activeApproachKey === key ? 'var(--accent-blue)' : 'var(--border-color)',
                    backgroundColor: activeApproachKey === key ? 'var(--bg-tertiary)' : 'transparent',
                  }}
                >
                  <span className="badge badge-lang">{sol.language}</span>
                  <span>{sol.approachName}</span>
                </button>
              ))}
            </div>

            {activeSolution && (
              <div
                style={{
                  marginTop: '10px',
                  backgroundColor: 'var(--bg-primary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  display: 'flex',
                  gap: '20px',
                }}
              >
                <div>File: <code style={{ color: 'var(--accent-blue)' }}>{activeSolution.filePath}</code></div>
                <div>Runtime: <strong>{activeSolution.runtime || 'N/A'}</strong></div>
                <div>Memory: <strong>{activeSolution.memory || 'N/A'}</strong></div>
                <div>Time: <strong>{activeSolution.complexity?.time || 'O(?)'}</strong></div>
                <div>Space: <strong>{activeSolution.complexity?.space || 'O(?)'}</strong></div>
              </div>
            )}
          </div>
        )}

        {/* Structured 8 Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              1. Problem Intuition
            </label>
            <textarea
              rows={3}
              placeholder="First impressions and high-level instinct..."
              value={notes.intuition}
              onChange={(e) => setNotes({ ...notes, intuition: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              2. Key Observation
            </label>
            <textarea
              rows={3}
              placeholder="The mathematical, structural, or algorithmic pivot..."
              value={notes.keyObservation}
              onChange={(e) => setNotes({ ...notes, keyObservation: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              3. Algorithm or Approach
            </label>
            <textarea
              rows={3}
              placeholder="Step-by-step description of the algorithm..."
              value={notes.approach}
              onChange={(e) => setNotes({ ...notes, approach: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              4. Why the Approach Works
            </label>
            <textarea
              rows={3}
              placeholder="Correctness invariants and proof reasoning..."
              value={notes.whyItWorks}
              onChange={(e) => setNotes({ ...notes, whyItWorks: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              5. Complexity Analysis
            </label>
            <textarea
              rows={3}
              placeholder="Time & Space complexity breakdowns (e.g. O(N) time, O(1) auxiliary space)..."
              value={notes.complexityAnalysis}
              onChange={(e) => setNotes({ ...notes, complexityAnalysis: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              6. Edge Cases
            </label>
            <textarea
              rows={3}
              placeholder="Empty inputs, negative numbers, overflow, boundary values..."
              value={notes.edgeCases}
              onChange={(e) => setNotes({ ...notes, edgeCases: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              7. Mistakes Made During Initial Attempt
            </label>
            <textarea
              rows={3}
              placeholder="Off-by-one errors, TLE pitfalls, pointer misunderstandings..."
              value={notes.mistakes}
              onChange={(e) => setNotes({ ...notes, mistakes: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              8. Simpler Explanation for Future Revision
            </label>
            <textarea
              rows={3}
              placeholder="30-second refresher summary when revisiting this problem..."
              value={notes.simplifiedExplanation}
              onChange={(e) => setNotes({ ...notes, simplifiedExplanation: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
