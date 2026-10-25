import { StructuredNotes, ProblemMetadata } from '../types/problem';

export const EMPTY_STRUCTURED_NOTES: StructuredNotes = {
  intuition: '',
  keyObservation: '',
  approach: '',
  whyItWorks: '',
  complexityAnalysis: '',
  edgeCases: '',
  mistakes: '',
  simplifiedExplanation: '',
};

/**
 * Formats structured notes into markdown
 */
export function formatNotesMarkdown(
  metadata: Partial<ProblemMetadata>,
  notes: Partial<StructuredNotes>
): string {
  const n: StructuredNotes = { ...EMPTY_STRUCTURED_NOTES, ...notes };

  return `# ${metadata.title || 'Problem Notes'}

- **Problem ID**: ${metadata.id || 'N/A'}
- **Difficulty**: ${metadata.difficulty || 'Unknown'}
- **LeetCode URL**: [${metadata.title || 'Problem'}](${metadata.url || '#'})
- **Tags**: ${(metadata.tags || []).join(', ') || 'None'}
- **Patterns**: ${(metadata.patterns || []).join(', ') || 'None'}

---

## 1. Problem Intuition
${n.intuition.trim() || '_No notes recorded yet._'}

## 2. Key Observation
${n.keyObservation.trim() || '_No notes recorded yet._'}

## 3. Algorithm or Approach
${n.approach.trim() || '_No notes recorded yet._'}

## 4. Why the Approach Works
${n.whyItWorks.trim() || '_No notes recorded yet._'}

## 5. Complexity Analysis
${n.complexityAnalysis.trim() || `- **Time Complexity**: ${metadata.estimatedTimeComplexity || 'O(?) (unverified)'}\n- **Space Complexity**: ${metadata.estimatedSpaceComplexity || 'O(?) (unverified)'}`}

## 6. Edge Cases
${n.edgeCases.trim() || '_No notes recorded yet._'}

## 7. Mistakes Made During Initial Attempt
${n.mistakes.trim() || '_No mistakes recorded._'}

## 8. Simpler Explanation for Future Revision
${n.simplifiedExplanation.trim() || '_No revision summary recorded._'}
`;
}

/**
 * Parses markdown back into StructuredNotes fields if existing notes are fetched
 */
export function parseNotesMarkdown(markdown: string): StructuredNotes {
  const result: StructuredNotes = { ...EMPTY_STRUCTURED_NOTES };
  if (!markdown) return result;

  const sections: { key: keyof StructuredNotes; title: string }[] = [
    { key: 'intuition', title: '1. Problem Intuition' },
    { key: 'keyObservation', title: '2. Key Observation' },
    { key: 'approach', title: '3. Algorithm or Approach' },
    { key: 'whyItWorks', title: '4. Why the Approach Works' },
    { key: 'complexityAnalysis', title: '5. Complexity Analysis' },
    { key: 'edgeCases', title: '6. Edge Cases' },
    { key: 'mistakes', title: '7. Mistakes Made During Initial Attempt' },
    { key: 'simplifiedExplanation', title: '8. Simpler Explanation for Future Revision' },
  ];

  for (let i = 0; i < sections.length; i++) {
    const current = sections[i];
    const headerRegex = new RegExp(`##\\s+${escapeRegex(current.title)}`, 'i');
    const match = markdown.match(headerRegex);

    if (match && match.index !== undefined) {
      const startIndex = match.index + match[0].length;
      let endIndex = markdown.length;

      if (i + 1 < sections.length) {
        const nextHeaderRegex = new RegExp(`##\\s+${escapeRegex(sections[i + 1].title)}`, 'i');
        const nextMatch = markdown.slice(startIndex).match(nextHeaderRegex);
        if (nextMatch && nextMatch.index !== undefined) {
          endIndex = startIndex + nextMatch.index;
        }
      }

      const body = markdown.slice(startIndex, endIndex).trim();
      if (body && !body.startsWith('_No notes') && !body.startsWith('_No mistakes')) {
        result[current.key] = body;
      }
    }
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
