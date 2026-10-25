import React, { useState } from 'react';
import { SupportedLanguage, ProblemDifficulty, PlatformSubmission } from '../../../core/types/submission';
import { parseLeetCodeUrl } from '../../../core/utils/url-parser';
import { getSolutionFilePath } from '../../../core/sync/path-sanitizer';
import { storage } from '../../../core/storage/chrome-storage';
import { checkSubmissionDuplicate } from '../../../core/sync/deduplication';
import { syncQueueManager } from '../../../core/sync/sync-queue-manager';
import { GitHubClient } from '../../../core/github/client';

interface Props {
  initialDraft?: PlatformSubmission | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualImportModal: React.FC<Props> = ({ initialDraft, onClose, onSuccess }) => {
  const [code, setCode] = useState(initialDraft?.code || '');
  const [url, setUrl] = useState(initialDraft?.url || '');
  const [title, setTitle] = useState(initialDraft?.problemTitle || '');
  const [problemId, setProblemId] = useState(initialDraft?.problemId || '');
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>(initialDraft?.difficulty || 'Medium');
  const [language, setLanguage] = useState<SupportedLanguage>(initialDraft?.language || 'cpp');
  const [approachName, setApproachName] = useState('solution');
  const [submissionId, setSubmissionId] = useState(initialDraft?.submissionId || '');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [confidence, setConfidence] = useState(4);
  const [intuitionNote, setIntuitionNote] = useState('');

  // Review step state
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const [targetPath, setTargetPath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto parse URL when pasted
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    const parsed = parseLeetCodeUrl(val);
    if (parsed.isValid) {
      if (!title) setTitle(parsed.inferredTitle);
      if (parsed.problemId && !problemId) setProblemId(parsed.problemId);
      if (parsed.submissionId && !submissionId) setSubmissionId(parsed.submissionId);
    }
  };

  const handleProceedToReview = async () => {
    if (!code.trim()) {
      setSubmitError('Please paste your solution code.');
      return;
    }
    if (!title.trim()) {
      setSubmitError('Please enter the problem title.');
      return;
    }

    setSubmitError(null);

    const parsed = parseLeetCodeUrl(url);
    const slug = parsed.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const cleanId = problemId || parsed.problemId || '0';

    const settings = (await storage.getSettings()).github;
    const path = getSolutionFilePath(cleanId, slug, language, approachName, settings.defaultPathPrefix);
    setTargetPath(path);

    // Check duplicate
    const testSubmission: PlatformSubmission = {
      problemId: cleanId,
      problemTitle: title,
      problemSlug: slug,
      url,
      difficulty,
      language,
      code,
      submissionId: submissionId || undefined,
      timestamp: Date.now(),
      status: 'Accepted',
    };

    const syncIndex = await storage.getSyncIndex();
    const dupCheck = await checkSubmissionDuplicate(testSubmission, approachName, syncIndex);

    if (dupCheck.isDuplicate) {
      setDupWarning(`Warning: An identical submission already exists at ${dupCheck.existingFilePath}. Syncing will not create a redundant commit.`);
    } else {
      setDupWarning(null);
    }

    setStep('review');
  };

  const handleConfirmSync = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const parsed = parseLeetCodeUrl(url);
      const slug = parsed.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const cleanId = problemId || parsed.problemId || '0';

      const submission: PlatformSubmission = {
        problemId: cleanId,
        problemTitle: title,
        problemSlug: slug,
        url,
        difficulty,
        language,
        code,
        submissionId: submissionId || undefined,
        timestamp: Date.now(),
        status: 'Accepted',
      };

      // Enqueue submission
      await syncQueueManager.enqueue(submission, {
        approachName,
        confidence,
        timeComplexity,
        spaceComplexity,
        notes: {
          intuition: intuitionNote,
        },
      });

      // Try triggering background processing right away
      const settings = (await storage.getSettings()).github;
      if (settings.token && settings.owner && settings.repo) {
        const client = new GitHubClient(settings);
        await syncQueueManager.processQueue(client);
      }

      // Clear draft upon successful manual sync
      await storage.setActiveDraft(null);

      onSuccess();
      onClose();
    } catch (err: any) {
      setSubmitError(`Sync failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          width: '740px',
          maxWidth: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
            {step === 'input' ? '📥 Manual Solution Import' : '🔍 Review Submission Before Sync'}
          </h2>
          <button onClick={onClose} style={{ padding: '2px 8px' }}>✕</button>
        </div>

        {submitError && (
          <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(218, 54, 51, 0.15)', color: '#f85149', fontSize: '13px' }}>
            {submitError}
          </div>
        )}

        {step === 'input' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                LeetCode Problem URL
              </label>
              <input
                type="text"
                placeholder="https://leetcode.com/problems/two-sum/"
                value={url}
                onChange={handleUrlChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Problem ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1"
                  value={problemId}
                  onChange={(e) => setProblemId(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Problem Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Two Sum"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as ProblemDifficulty)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Programming Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                >
                  <option value="cpp">C++ (.cpp)</option>
                  <option value="python3">Python 3 (.py)</option>
                  <option value="java">Java (.java)</option>
                  <option value="javascript">JavaScript (.js)</option>
                  <option value="typescript">TypeScript (.ts)</option>
                  <option value="csharp">C# (.cs)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Approach Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. solution, hash-map, brute-force"
                  value={approachName}
                  onChange={(e) => setApproachName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Submission ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 104829103"
                  value={submissionId}
                  onChange={(e) => setSubmissionId(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                Solution Source Code
              </label>
              <textarea
                rows={9}
                placeholder="Paste your accepted solution code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Time Complexity
                </label>
                <input
                  type="text"
                  placeholder="e.g. O(N)"
                  value={timeComplexity}
                  onChange={(e) => setTimeComplexity(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Space Complexity
                </label>
                <input
                  type="text"
                  placeholder="e.g. O(1)"
                  value={spaceComplexity}
                  onChange={(e) => setSpaceComplexity(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Recall Confidence (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value, 10))}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                Initial Notes or Intuition (Optional)
              </label>
              <input
                type="text"
                placeholder="Key takeaway or observation..."
                value={intuitionNote}
                onChange={(e) => setIntuitionNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="button" className="primary" onClick={handleProceedToReview}>
                Review Submission →
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Submission Review */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {dupWarning && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(210, 153, 34, 0.15)', border: '1px solid var(--accent-yellow)', color: 'var(--accent-yellow)', fontSize: '13px' }}>
                ⚠️ {dupWarning}
              </div>
            )}

            <div className="card" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <span className={`badge badge-${difficulty.toLowerCase()}`} style={{ marginRight: '8px' }}>
                    {difficulty}
                  </span>
                  <strong style={{ fontSize: '15px' }}>{title}</strong>
                </div>
                <span className="badge badge-lang">{language}</span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Approach: <strong>{approachName}</strong> • Confidence: <strong>{confidence}/5</strong>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Target File Path:{' '}
                <code style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                  {targetPath}
                </code>
              </div>
            </div>

            {/* Code preview snippet */}
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Source Code Preview:
              </div>
              <pre
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  backgroundColor: 'var(--bg-primary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                }}
              >
                {code}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <button type="button" onClick={() => setStep('input')}>
                ← Back to Edit
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={onClose}>Cancel</button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleConfirmSync}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Syncing to GitHub...' : '🚀 Confirm & Upload to GitHub'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
