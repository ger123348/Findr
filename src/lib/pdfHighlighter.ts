import { KeywordItem } from '@/types';

// Vivid stabilo-like colors for PDF highlights (brighter than badge colors)
const VIVID_MAP: Record<string, string> = {
  '#FFD6D6': '#FF9999',
  '#D6EAFF': '#99CCFF',
  '#D6FFE4': '#99FFB3',
  '#FFF3D6': '#FFE066',
  '#F0D6FF': '#D699FF',
  '#FFE6D6': '#FFB380',
  '#D6FDFF': '#80F0F5',
  '#FFD6F5': '#FF99E6',
  '#E8FFD6': '#CCFF99',
  '#D6D6FF': '#9999FF',
};

function getVividColor(keyword: KeywordItem): string {
  return VIVID_MAP[keyword.color] || keyword.color;
}

/**
 * Injects highlight <mark> elements into the PDF.js text layer.
 * Uses TreeWalker to find text nodes for more reliable highlighting.
 */
export function highlightTextLayer(
  textLayerDiv: HTMLElement,
  keywords: KeywordItem[]
): void {
  resetHighlights(textLayerDiv);
  if (keywords.length === 0) return;

  // Build a combined regex for all keywords
  const patterns = keywords.map((kw) => ({
    regex: new RegExp(escapeRegex(kw.text), 'gi'),
    keyword: kw,
  }));

  // Walk through all text nodes in the text layer
  const walker = document.createTreeWalker(
    textLayerDiv,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textNodes: Text[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (node.textContent && node.textContent.trim().length > 0) {
      textNodes.push(node);
    }
  }

  // Process each text node
  textNodes.forEach((textNode) => {
    const text = textNode.textContent || '';
    
    // Check if any keyword matches
    let hasMatch = false;
    for (const p of patterns) {
      p.regex.lastIndex = 0;
      if (p.regex.test(text)) {
        hasMatch = true;
        break;
      }
    }
    if (!hasMatch) return;

    // Create a document fragment with highlighted parts
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    // Find ALL matches across all keywords, sorted by position
    interface MatchInfo {
      start: number;
      end: number;
      keyword: KeywordItem;
    }
    const allMatches: MatchInfo[] = [];

    patterns.forEach((p) => {
      p.regex.lastIndex = 0;
      let match;
      while ((match = p.regex.exec(text)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          keyword: p.keyword,
        });
      }
    });

    // Sort by position
    allMatches.sort((a, b) => a.start - b.start);

    // Remove overlaps (keep earlier match)
    const filtered: MatchInfo[] = [];
    let lastEnd = 0;
    for (const m of allMatches) {
      if (m.start >= lastEnd) {
        filtered.push(m);
        lastEnd = m.end;
      }
    }

    // Build fragment
    filtered.forEach((m) => {
      // Add text before this match
      if (m.start > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, m.start)));
      }

      // Create highlight mark
      const mark = document.createElement('mark');
      mark.className = 'findr-highlight';
      mark.dataset.keywordId = m.keyword.id;
      mark.textContent = text.slice(m.start, m.end);

      const vividColor = getVividColor(m.keyword);
      mark.style.setProperty('background-color', vividColor, 'important');

      fragment.appendChild(mark);
      lastIndex = m.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    // Replace the text node with the fragment
    if (filtered.length > 0 && textNode.parentNode) {
      textNode.parentNode.replaceChild(fragment, textNode);
    }
  });
}

/**
 * Removes all injected <mark> elements, restoring original text.
 */
export function resetHighlights(textLayerDiv: HTMLElement): void {
  const marks = textLayerDiv.querySelectorAll('mark.findr-highlight');
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
      parent.normalize();
    }
  });
}

/**
 * Escapes special regex characters in a keyword string.
 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
