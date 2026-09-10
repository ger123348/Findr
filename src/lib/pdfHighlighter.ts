import { KeywordItem } from '@/types';

/**
 * Cross-span highlight engine using DOM Range + getClientRects.
 * This correctly finds keywords even when they're split across
 * multiple PDF.js text layer <span> elements.
 */

interface HighlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  keywordId: string;
}

interface MatchInfo {
  start: number;
  end: number;
  keyword: KeywordItem;
}

// Vivid stabilo colors
const VIVID_MAP: Record<string, string> = {
  '#FFD6D6': 'rgba(255, 100, 100, 0.4)',
  '#D6EAFF': 'rgba(80, 160, 255, 0.4)',
  '#D6FFE4': 'rgba(80, 220, 130, 0.4)',
  '#FFF3D6': 'rgba(255, 210, 50, 0.45)',
  '#F0D6FF': 'rgba(180, 100, 255, 0.4)',
  '#FFE6D6': 'rgba(255, 150, 80, 0.4)',
  '#D6FDFF': 'rgba(80, 220, 230, 0.4)',
  '#FFD6F5': 'rgba(255, 100, 200, 0.4)',
  '#E8FFD6': 'rgba(160, 230, 80, 0.4)',
  '#D6D6FF': 'rgba(120, 120, 255, 0.4)',
};

function getHighlightColor(keyword: KeywordItem): string {
  return VIVID_MAP[keyword.color] || 'rgba(255, 255, 0, 0.4)';
}

/**
 * Collects all text nodes in DOM order from a container.
 */
function getAllTextNodes(container: HTMLElement): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (node.textContent && node.textContent.length > 0) {
      nodes.push(node);
    }
  }
  return nodes;
}

/**
 * Builds a character offset map from text nodes.
 * Returns the concatenated full text and a function to resolve
 * global offset → { textNode, localOffset }.
 */
function buildTextMap(textNodes: Text[]) {
  let fullText = '';
  const offsets: { node: Text; start: number; end: number }[] = [];

  textNodes.forEach((node) => {
    const text = node.textContent || '';
    offsets.push({
      node,
      start: fullText.length,
      end: fullText.length + text.length,
    });
    fullText += text;
  });

  function resolve(globalOffset: number): { node: Text; offset: number } | null {
    for (const entry of offsets) {
      if (globalOffset >= entry.start && globalOffset <= entry.end) {
        return { node: entry.node, offset: globalOffset - entry.start };
      }
    }
    return null;
  }

  return { fullText, resolve };
}

/**
 * Finds all keyword matches in the full text.
 * Handles overlaps by keeping the first match.
 */
function findMatches(fullText: string, keywords: KeywordItem[]): MatchInfo[] {
  const allMatches: MatchInfo[] = [];

  keywords.forEach((kw) => {
    const escaped = kw.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  // Sort by position
  allMatches.sort((a, b) => a.start - b.start);

  // Remove overlaps
  const filtered: MatchInfo[] = [];
  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.end;
    }
  }

  return filtered;
}

/**
 * Creates highlight overlay rectangles for keyword matches.
 * Uses DOM Range + getClientRects for pixel-perfect positioning.
 */
export function computeHighlights(
  textLayerDiv: HTMLElement,
  keywords: KeywordItem[],
  containerRect: DOMRect
): HighlightRect[] {
  if (keywords.length === 0) return [];

  const textNodes = getAllTextNodes(textLayerDiv);
  if (textNodes.length === 0) return [];

  const { fullText, resolve } = buildTextMap(textNodes);
  const matches = findMatches(fullText, keywords);
  const highlights: HighlightRect[] = [];

  matches.forEach((match) => {
    const startInfo = resolve(match.start);
    const endInfo = resolve(match.end);
    if (!startInfo || !endInfo) return;

    try {
      const range = document.createRange();
      range.setStart(startInfo.node, Math.min(startInfo.offset, startInfo.node.length));
      range.setEnd(endInfo.node, Math.min(endInfo.offset, endInfo.node.length));

      const rects = range.getClientRects();
      const color = getHighlightColor(match.keyword);

      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        highlights.push({
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
          color,
          keywordId: match.keyword.id,
        });
      }
    } catch {
      // Skip invalid ranges
    }
  });

  return highlights;
}

/**
 * Counts occurrences for the search results panel.
 */
export function countOccurrences(text: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'gi');
  return (text.match(regex) || []).length;
}
