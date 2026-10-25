import { SupportedLanguage } from '../types/submission';
import { getFileExtension } from '../utils/languages';

/**
 * Pads problem ID with leading zeroes up to 4 digits (e.g. "1" -> "0001")
 */
export function formatProblemId(id: string | number): string {
  const str = String(id || '').trim();
  const num = parseInt(str, 10);
  if (!isNaN(num) && num > 0) {
    return String(num).padStart(4, '0');
  }
  return str ? str.replace(/[^a-zA-Z0-9_-]/g, '') : '0000';
}

/**
 * Sanitizes problem slug or generic path segment to avoid directory traversal or illegal characters
 */
export function sanitizeSlug(input: string): string {
  if (!input) return 'unknown';
  return input
    .trim()
    .toLowerCase()
    .replace(/[/\\]+/g, '-') // Replace slashes with dash
    .replace(/[^a-z0-9_-]+/g, '-') // Remove non-alphanumeric chars
    .replace(/-+/g, '-') // Collapse consecutive dashes
    .replace(/^-+|-+$/g, '') // Trim leading/trailing dashes
    .slice(0, 80); // Cap length
}

/**
 * Sanitizes approach name for directory or file naming (e.g. "Hash Map (Optimal)" -> "hash-map-optimal")
 */
export function sanitizeApproachName(name: string): string {
  if (!name || name.trim().toLowerCase() === 'default' || name.trim().toLowerCase() === 'solution') {
    return 'solution';
  }
  return sanitizeSlug(name);
}

/**
 * Generates directory name for a problem, e.g. "0001-two-sum"
 */
export function getProblemDirectory(problemId: string | number, slug: string): string {
  const paddedId = formatProblemId(problemId);
  const cleanSlug = sanitizeSlug(slug);
  return `${paddedId}-${cleanSlug}`;
}

/**
 * Generates relative solution file path in the repository
 * Example: problems/0001-two-sum/cpp/solution.cpp or problems/0001-two-sum/cpp/hash-map.cpp
 */
export function getSolutionFilePath(
  problemId: string | number,
  slug: string,
  language: SupportedLanguage,
  approachName: string = 'solution',
  basePrefix: string = 'solutions'
): string {
  const dir = getProblemDirectory(problemId, slug);
  const ext = getFileExtension(language);
  const cleanApproach = sanitizeApproachName(approachName);
  const prefix = basePrefix ? `${sanitizeSlug(basePrefix)}/` : '';
  return `${prefix}${dir}/${language}/${cleanApproach}.${ext}`;
}

/**
 * Generates relative metadata file path
 * Example: solutions/0001-two-sum/metadata.json
 */
export function getMetadataFilePath(
  problemId: string | number,
  slug: string,
  basePrefix: string = 'solutions'
): string {
  const dir = getProblemDirectory(problemId, slug);
  const prefix = basePrefix ? `${sanitizeSlug(basePrefix)}/` : '';
  return `${prefix}${dir}/metadata.json`;
}

/**
 * Generates relative notes file path
 * Example: solutions/0001-two-sum/notes.md
 */
export function getNotesFilePath(
  problemId: string | number,
  slug: string,
  basePrefix: string = 'solutions'
): string {
  const dir = getProblemDirectory(problemId, slug);
  const prefix = basePrefix ? `${sanitizeSlug(basePrefix)}/` : '';
  return `${prefix}${dir}/notes.md`;
}

/**
 * Generates relative historical solution path for non-canonical/older accepted solutions
 * Example: solutions/0013-roman-to-integer/history/123456789/solution.cpp
 */
export function getHistoricalSolutionFilePath(
  problemId: string | number,
  slug: string,
  submissionId: string | number,
  language: SupportedLanguage,
  basePrefix: string = 'solutions'
): string {
  const dir = getProblemDirectory(problemId, slug);
  const ext = getFileExtension(language);
  const safeSubId = sanitizeSlug(String(submissionId));
  const prefix = basePrefix ? `${sanitizeSlug(basePrefix)}/` : '';
  return `${prefix}${dir}/history/${safeSubId}/solution.${ext}`;
}

/**
 * Generates relative historical metadata file path
 * Example: solutions/0013-roman-to-integer/history/123456789/metadata.json
 */
export function getHistoricalMetadataFilePath(
  problemId: string | number,
  slug: string,
  submissionId: string | number,
  basePrefix: string = 'solutions'
): string {
  const dir = getProblemDirectory(problemId, slug);
  const safeSubId = sanitizeSlug(String(submissionId));
  const prefix = basePrefix ? `${sanitizeSlug(basePrefix)}/` : '';
  return `${prefix}${dir}/history/${safeSubId}/metadata.json`;
}

/**
 * Generates relative attempt solution path for unsuccessful attempts (Mode C)
 * Example: solutions/0013-roman-to-integer/attempts/123456789/attempt.cpp
 */
export function getAttemptSolutionFilePath(
  problemId: string | number,
  slug: string,
  submissionId: string | number,
  language: SupportedLanguage,
  basePrefix: string = 'solutions'
): string {
  const dir = getProblemDirectory(problemId, slug);
  const ext = getFileExtension(language);
  const safeSubId = sanitizeSlug(String(submissionId));
  const prefix = basePrefix ? `${sanitizeSlug(basePrefix)}/` : '';
  return `${prefix}${dir}/attempts/${safeSubId}/attempt.${ext}`;
}

/**
 * Generates relative attempt metadata path for unsuccessful attempts
 * Example: solutions/0013-roman-to-integer/attempts/123456789/metadata.json
 */
export function getAttemptMetadataFilePath(
  problemId: string | number,
  slug: string,
  submissionId: string | number,
  basePrefix: string = 'solutions'
): string {
  const dir = getProblemDirectory(problemId, slug);
  const safeSubId = sanitizeSlug(String(submissionId));
  const prefix = basePrefix ? `${sanitizeSlug(basePrefix)}/` : '';
  return `${prefix}${dir}/attempts/${safeSubId}/metadata.json`;
}

export const SYNC_INDEX_PATH = 'data/sync-index.json';
export const PROGRESS_SVG_PATH = 'assets/progress.svg';
export const README_PATH = 'README.md';
