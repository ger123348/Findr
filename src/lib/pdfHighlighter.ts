import { KeywordItem } from '@/types';
import Mark from 'mark.js';

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

/**
 * Highlights keywords using Mark.js.
 * This is the ultimate solution for PDF.js text layer because it perfectly handles
 * cross-element boundaries (when a single word is split across multiple span elements).
 */
export function highlightTextLayer(
  textLayerDiv: HTMLElement,
  keywords: KeywordItem[]
): void {
  const instance = new Mark(textLayerDiv);
  instance.unmark(); // Clear existing highlights first
  
  keywords.forEach((kw) => {
    const color = getHighlightColor(kw);
    instance.mark(kw.text, {
      className: 'findr-highlight',
      separateWordSearch: false, // Match the exact keyword phrase only
      acrossElements: true,      // Handle words split across PDF.js spans
      each: (elem) => {
        // Apply inline !important styles to beat any Tailwind or PDF.js CSS resets
        elem.style.setProperty('background-color', color, 'important');
        elem.style.setProperty('border-radius', '2px', 'important');
        // Keep text transparent so the underlying canvas text is visible
        elem.style.setProperty('color', 'transparent', 'important');
        elem.dataset.keywordId = kw.id;
      }
    });
  });
}

/**
 * Removes all highlights from the text layer.
 */
export function resetHighlights(textLayerDiv: HTMLElement): void {
  const instance = new Mark(textLayerDiv);
  instance.unmark();
}

/**
 * Counts total occurrences of a keyword in a plain text string.
 */
export function countOccurrences(text: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'gi');
  return (text.match(regex) || []).length;
}
