import { PlatformSubmission, ProblemDifficulty, SupportedLanguage } from '../core/types/submission';
import { parseLeetCodeUrl } from '../core/utils/url-parser';
import { normalizeLanguage } from '../core/utils/languages';

/**
 * Extracts submission details from the LeetCode DOM
 */
export function extractLeetCodePageData(): Partial<PlatformSubmission> {
  const currentUrl = window.location.href;
  const parsed = parseLeetCodeUrl(currentUrl);

  const slug = parsed.slug;
  let title = parsed.inferredTitle;
  let problemId = parsed.problemId || '';
  let difficulty: ProblemDifficulty = 'Unknown';

  // 1. Extract Title & ID from DOM
  // Modern LeetCode often has: "1. Two Sum" inside an element or breadcrumb
  const titleSelectors = [
    'div[data-cy="question-title"]',
    'a[href*="/problems/"]',
    'span.text-title-large',
    '.text-title-large',
    'h4[data-cy="question-title"]',
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
      } else if (text.length > 2 && text.length < 80) {
        title = text;
      }
    }
  }

  // 2. Extract Difficulty
  const easyEl = document.querySelector('.text-olive, .text-difficulty-easy, [data-degree="easy"]');
  const medEl = document.querySelector('.text-yellow, .text-difficulty-medium, [data-degree="medium"]');
  const hardEl = document.querySelector('.text-pink, .text-difficulty-hard, [data-degree="hard"]');

  if (easyEl || document.body.innerText.includes('Easy')) {
    if (document.querySelector('.text-olive, [data-degree="easy"]')) difficulty = 'Easy';
  }
  if (medEl || document.querySelector('.text-yellow, [data-degree="medium"]')) difficulty = 'Medium';
  if (hardEl || document.querySelector('.text-pink, [data-degree="hard"]')) difficulty = 'Hard';

  // 3. Extract Programming Language
  let language: SupportedLanguage = 'cpp';
  const langSelectors = [
    'button[id*="headlessui-listbox-button"]',
    'div[data-cy="lang-select"]',
    'button[data-state]',
    '.ant-select-selection-item',
  ];

  for (const sel of langSelectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent) {
      const normalized = normalizeLanguage(el.textContent);
      if (normalized) {
        language = normalized;
        break;
      }
    }
  }

  // 4. Extract Code from Monaco Editor
  let code = '';
  // Try monaco models via DOM or window
  const monacoLines = document.querySelectorAll('.monaco-editor .view-lines .view-line');
  if (monacoLines && monacoLines.length > 0) {
    const lines: string[] = [];
    monacoLines.forEach((l) => lines.push(l.textContent || ''));
    code = lines.join('\n');
  }

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
 * Checks if the current view shows an Accepted submission result
 */
export function checkSubmissionAccepted(): {
  isAccepted: boolean;
  runtime?: string;
  memory?: string;
  submissionId?: string;
} {
  // Look for elements with "Accepted"
  const acceptedSelectors = [
    'span[data-e2e-locator="submission-result"]',
    'div[data-e2e-locator="submission-result"]',
    'span.text-green-s',
    'div.text-green-s',
  ];

  let isAccepted = false;
  let runtime: string | undefined;
  let memory: string | undefined;
  let submissionId: string | undefined;

  for (const sel of acceptedSelectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent?.trim().toLowerCase() === 'accepted') {
      isAccepted = true;
      break;
    }
  }

  // Check generic elements if data attributes changed
  if (!isAccepted) {
    const spans = Array.from(document.querySelectorAll('span, div'));
    const acceptedSpan = spans.find((s) => s.textContent?.trim() === 'Accepted');
    if (acceptedSpan) {
      isAccepted = true;
    }
  }

  // Extract runtime & memory if visible
  const runtimeEl = document.querySelector('[data-e2e-locator="submission-runtime"]');
  if (runtimeEl && runtimeEl.textContent) {
    runtime = runtimeEl.textContent.trim();
  }

  const memoryEl = document.querySelector('[data-e2e-locator="submission-memory"]');
  if (memoryEl && memoryEl.textContent) {
    memory = memoryEl.textContent.trim();
  }

  // Check URL for submission ID
  const urlParsed = parseLeetCodeUrl(window.location.href);
  if (urlParsed.submissionId) {
    submissionId = urlParsed.submissionId;
  }

  return { isAccepted, runtime, memory, submissionId };
}
