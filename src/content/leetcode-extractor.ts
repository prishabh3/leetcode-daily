import { PlatformSubmission, ProblemDifficulty, SupportedLanguage } from '../core/types/submission';
import { parseLeetCodeUrl } from '../core/utils/url-parser';
import { normalizeLanguage } from '../core/utils/languages';

export type SubmissionVerdict =
  | 'PENDING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILE_ERROR'
  | 'OUTPUT_LIMIT_EXCEEDED'
  | 'UNKNOWN';

export interface VerdictDetails {
  verdict: SubmissionVerdict;
  rawText: string;
  isTerminal: boolean; // true if a final verdict has been reached
  isAccepted: boolean;
  runtime?: string;
  memory?: string;
  submissionId?: string;
}

/**
 * Extracts page and problem metadata from the LeetCode DOM
 */
export function extractLeetCodePageData(): Partial<PlatformSubmission> {
  const currentUrl = window.location.href;
  const parsed = parseLeetCodeUrl(currentUrl);

  const slug = parsed.slug;
  let title = parsed.inferredTitle;
  let problemId = parsed.problemId || '';
  let difficulty: ProblemDifficulty = 'Unknown';

  // 1. Extract Title & ID from DOM
  const titleSelectors = [
    'div[data-cy="question-title"]',
    'a[href*="/problems/"]',
    'span.text-title-large',
    '.text-title-large',
    'h4[data-cy="question-title"]',
    '[data-track-load="description_content"] h4',
  ];

  for (const sel of titleSelectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent) {
      const text = el.textContent.trim();
      const match = text.match(/^(\d+)\.\s*(.+)$/);
      if (match) {
        problemId = match[1];
        title = match[2].trim();
        break;
      } else if (text.length > 2 && text.length < 90 && !text.includes('\n')) {
        title = text;
      }
    }
  }

  // 2. Extract Difficulty
  const easyEl = document.querySelector('.text-olive, .text-difficulty-easy, [data-degree="easy"]');
  const medEl = document.querySelector('.text-yellow, .text-difficulty-medium, [data-degree="medium"]');
  const hardEl = document.querySelector('.text-pink, .text-difficulty-hard, [data-degree="hard"]');

  if (easyEl || document.querySelector('.text-olive, [data-degree="easy"]')) difficulty = 'Easy';
  else if (medEl || document.querySelector('.text-yellow, [data-degree="medium"]')) difficulty = 'Medium';
  else if (hardEl || document.querySelector('.text-pink, [data-degree="hard"]')) difficulty = 'Hard';

  // 3. Extract Programming Language
  let language: SupportedLanguage = 'cpp';
  const langSelectors = [
    'button[id*="headlessui-listbox-button"]',
    'div[data-cy="lang-select"]',
    'button[data-state]',
    '.ant-select-selection-item',
    '[data-e2e-locator="console-lang-select"]',
  ];

  for (const sel of langSelectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent) {
      const normalized = normalizeLanguage(el.textContent);
      if (normalized && normalized !== 'unknown') {
        language = normalized;
        break;
      }
    }
  }

  // Also inspect Monaco editor's data-mode-id attribute if available
  const monacoModeEl = document.querySelector('.monaco-editor[data-mode-id], [data-mode-id]');
  if (monacoModeEl) {
    const mode = monacoModeEl.getAttribute('data-mode-id');
    if (mode) {
      const normalizedMode = normalizeLanguage(mode);
      if (normalizedMode && normalizedMode !== 'unknown') {
        language = normalizedMode;
      }
    }
  }

  // 4. Extract Code from editor
  const code = extractCodeFromDom();

  return {
    problemId,
    problemTitle: title,
    problemSlug: slug,
    url: currentUrl,
    difficulty,
    language,
    code,
  };
}

/**
 * Extracts source code from visible Monaco editor or submission view
 */
export function extractCodeFromDom(): string {
  // 1. Check Monaco editor view lines first if present on problem solving page
  const monacoLines = document.querySelectorAll('.monaco-editor .view-lines .view-line');
  if (monacoLines && monacoLines.length > 0) {
    const lines: string[] = [];
    monacoLines.forEach((l) => lines.push(l.textContent || ''));
    const full = lines.join('\n').trim();
    if (full.length > 0) return full;
  }

  // 2. Fallback to Monaco input textarea if present
  const textarea = document.querySelector<HTMLTextAreaElement>('.monaco-editor textarea.inputarea');
  if (textarea && textarea.value && textarea.value.trim().length > 5) {
    return textarea.value.trim();
  }

  // 3. Check submission detail code container (strictly scoped, no generic 'pre code' which matches problem descriptions)
  const submissionDetailSelectors = [
    '.submission-code pre',
    '[data-e2e-locator="submission-code"] pre',
    '[data-cy="submission-code"] pre',
    '.submission-detail pre code',
    '#submission-code pre',
  ];

  for (const sel of submissionDetailSelectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent && el.textContent.trim().length > 5) {
      return el.textContent.trim();
    }
  }

  return '';
}

/**
 * Robustly inspects the page to detect the definitive verdict of a submission
 */
export function detectSubmissionVerdict(): VerdictDetails {
  const resultSelectors = [
    'span[data-e2e-locator="submission-result"]',
    'div[data-e2e-locator="submission-result"]',
    '[data-e2e-locator="submission-result"]',
    'span.text-green-s',
    'div.text-green-s',
    'span.text-red-s',
    'div.text-red-s',
  ];

  let foundText = '';
  for (const sel of resultSelectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent) {
      const t = el.textContent.trim();
      if (t) {
        foundText = t;
        break;
      }
    }
  }

  // Fallback: search visible badges/headings for known verdict text
  if (!foundText) {
    const candidates = Array.from(document.querySelectorAll('span, div, h3, h4'));
    for (const c of candidates) {
      const txt = c.textContent?.trim() || '';
      if (
        txt === 'Accepted' ||
        txt === 'Wrong Answer' ||
        txt === 'Time Limit Exceeded' ||
        txt === 'Memory Limit Exceeded' ||
        txt === 'Runtime Error' ||
        txt === 'Compile Error' ||
        txt === 'Compilation Error' ||
        txt === 'Pending' ||
        txt === 'Judging'
      ) {
        foundText = txt;
        break;
      }
    }
  }

  const clean = foundText.toLowerCase();

  let verdict: SubmissionVerdict = 'UNKNOWN';
  let isTerminal = false;
  let isAccepted = false;

  if (clean.includes('pending') || clean.includes('judging')) {
    verdict = 'PENDING';
    isTerminal = false;
  } else if (clean.includes('accepted')) {
    verdict = 'ACCEPTED';
    isTerminal = true;
    isAccepted = true;
  } else if (clean.includes('wrong answer')) {
    verdict = 'WRONG_ANSWER';
    isTerminal = true;
  } else if (clean.includes('time limit exceeded')) {
    verdict = 'TIME_LIMIT_EXCEEDED';
    isTerminal = true;
  } else if (clean.includes('memory limit exceeded')) {
    verdict = 'MEMORY_LIMIT_EXCEEDED';
    isTerminal = true;
  } else if (clean.includes('runtime error')) {
    verdict = 'RUNTIME_ERROR';
    isTerminal = true;
  } else if (clean.includes('compile error') || clean.includes('compilation error')) {
    verdict = 'COMPILE_ERROR';
    isTerminal = true;
  } else if (clean.includes('output limit exceeded')) {
    verdict = 'OUTPUT_LIMIT_EXCEEDED';
    isTerminal = true;
  }

  // Extract runtime & memory
  let runtime: string | undefined;
  let memory: string | undefined;

  const runtimeEl = document.querySelector('[data-e2e-locator="submission-runtime"]');
  if (runtimeEl && runtimeEl.textContent) {
    runtime = runtimeEl.textContent.trim();
  }

  const memoryEl = document.querySelector('[data-e2e-locator="submission-memory"]');
  if (memoryEl && memoryEl.textContent) {
    memory = memoryEl.textContent.trim();
  }

  // Extract submission ID from URL or DOM links
  let submissionId: string | undefined;
  const urlParsed = parseLeetCodeUrl(window.location.href);
  if (urlParsed.submissionId) {
    submissionId = urlParsed.submissionId;
  } else {
    // Check links pointing to /submissions/detail/{id} or /submissions/{id}
    const subLink = document.querySelector<HTMLAnchorElement>('a[href*="/submissions/"]');
    if (subLink && subLink.href) {
      const match = subLink.href.match(/\/submissions\/(?:detail\/)?(\d+)/);
      if (match) submissionId = match[1];
    }
  }

  return {
    verdict,
    rawText: foundText,
    isTerminal,
    isAccepted,
    runtime,
    memory,
    submissionId,
  };
}

/**
 * Legacy compatibility wrapper
 */
export function checkSubmissionAccepted(): {
  isAccepted: boolean;
  runtime?: string;
  memory?: string;
  submissionId?: string;
} {
  const v = detectSubmissionVerdict();
  return {
    isAccepted: v.isAccepted,
    runtime: v.runtime,
    memory: v.memory,
    submissionId: v.submissionId,
  };
}
