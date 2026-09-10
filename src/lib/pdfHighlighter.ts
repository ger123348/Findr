import { KeywordItem } from '@/types';

// Vivid stabilo colors (semi-transparent for overlay effect)
const VIVID_MAP: Record<string, string> = {
  '#FFD6D6': 'rgba(255, 120, 120, 0.45)',
  '#D6EAFF': 'rgba(100, 170, 255, 0.45)',
  '#D6FFE4': 'rgba(100, 220, 140, 0.45)',
  '#FFF3D6': 'rgba(255, 220, 60, 0.5)',
  '#F0D6FF': 'rgba(190, 120, 255, 0.45)',
  '#FFE6D6': 'rgba(255, 160, 100, 0.45)',
  '#D6FDFF': 'rgba(100, 220, 235, 0.45)',
  '#FFD6F5': 'rgba(255, 120, 210, 0.45)',
  '#E8FFD6': 'rgba(170, 235, 100, 0.45)',
  '#D6D6FF': 'rgba(140, 140, 255, 0.45)',
};

function getHighlightColor(keyword: KeywordItem): string {
  return VIVID_MAP[keyword.color] || 'rgba(255, 255, 0, 0.5)';
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights keywords directly on the PDF.js text layer spans.
 * 
 * Strategy:
 * 1. Collect all spans and their text
 * 2. Concatenate into one string, tracking span boundaries
 * 3. Find keyword matches in the full string
 * 4. Map matches back to spans — color the entire span that overlaps a match
 * 
 * This handles cross-span keywords properly.
 */
export function highlightTextLayer(
  textLayerDiv: HTMLElement,
  keywords: KeywordItem[]
): void {
  // Reset first
  resetHighlights(textLayerDiv);
  if (keywords.length === 0) return;

  const spans = Array.from(textLayerDiv.querySelectorAll('span'));
  if (spans.length === 0) return;

  // Build span text map with character offset tracking
  interface SpanInfo {
    span: HTMLSpanElement;
    text: string;
    globalStart: number;
    globalEnd: number;
  }

  let fullText = '';
  const spanInfos: SpanInfo[] = [];

  spans.forEach((span) => {
    const text = span.textContent || '';
    spanInfos.push({
      span,
      text,
      globalStart: fullText.length,
      globalEnd: fullText.length + text.length,
    });
    fullText += text;
  });

  // Find all keyword matches in the concatenated text
  interface MatchResult {
    start: number;
    end: number;
    keyword: KeywordItem;
  }

  const allMatches: MatchResult[] = [];

  keywords.forEach((kw) => {
    const escaped = escapeRegex(kw.text);
    const regex = new RegExp(escaped, 'gi');
    let match;
    while ((match = regex.exec(fullText)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        keyword: kw,
      });
    }
  });

  // Sort by position, remove overlaps
  allMatches.sort((a, b) => a.start - b.start);
  const filtered: MatchResult[] = [];
  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.end;
    }
  }

  // Map matches to spans and apply highlight
  filtered.forEach((match) => {
    const color = getHighlightColor(match.keyword);

    spanInfos.forEach((info) => {
      // Check if this span overlaps with the match
      const overlapStart = Math.max(match.start, info.globalStart);
      const overlapEnd = Math.min(match.end, info.globalEnd);

      if (overlapStart < overlapEnd) {
        // This span contains part of the match — highlight it
        info.span.style.backgroundColor = color;
        info.span.style.borderRadius = '2px';
        info.span.dataset.highlighted = 'true';
        info.span.dataset.keywordId = match.keyword.id;
      }
    });
  });
}

/**
 * Removes all highlights from the text layer.
 */
export function resetHighlights(textLayerDiv: HTMLElement): void {
  const spans = textLayerDiv.querySelectorAll('span[data-highlighted="true"]');
  spans.forEach((span) => {
    (span as HTMLElement).style.backgroundColor = '';
    (span as HTMLElement).style.borderRadius = '';
    delete (span as HTMLElement).dataset.highlighted;
    delete (span as HTMLElement).dataset.keywordId;
  });
}

/**
 * Counts total occurrences of a keyword in a plain text string.
 */
export function countOccurrences(text: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  const escaped = escapeRegex(keyword.trim());
  const regex = new RegExp(escaped, 'gi');
  return (text.match(regex) || []).length;
}
