import { KeywordItem } from '@/types';

// More vivid/saturated highlight colors for better visibility on PDF
const VIVID_HIGHLIGHT_COLORS: Record<string, string> = {};

function getVividBgColor(keyword: KeywordItem): string {
  // Use a more saturated/vivid version of the keyword's bg color for PDF highlights
  // These are bolder, stabilo-like colors
  const vividMap: Record<string, string> = {
    '#FFD6D6': '#FF9999', // red → brighter red
    '#D6EAFF': '#99CCFF', // blue → brighter blue
    '#D6FFE4': '#99FFB3', // green → brighter green
    '#FFF3D6': '#FFE066', // yellow → brighter yellow
    '#F0D6FF': '#D699FF', // purple → brighter purple
    '#FFE6D6': '#FFB380', // orange → brighter orange
    '#D6FDFF': '#80F0F5', // teal → brighter teal
    '#FFD6F5': '#FF99E6', // pink → brighter pink
    '#E8FFD6': '#CCFF99', // lime → brighter lime
    '#D6D6FF': '#9999FF', // indigo → brighter indigo
  };
  return vividMap[keyword.color] || keyword.color;
}

/**
 * Injects highlight <mark> elements into the PDF.js text layer for a given page.
 * PDF.js renders a text layer as a set of <span> elements. This utility wraps
 * matching text segments in <mark> elements with the keyword's assigned color.
 *
 * @param textLayerDiv - The DOM element of the PDF.js text layer (div.textLayer)
 * @param keywords - The active list of keywords to highlight
 */
export function highlightTextLayer(
  textLayerDiv: HTMLElement,
  keywords: KeywordItem[]
): void {
  // First, reset any previous highlights by restoring original text nodes
  resetHighlights(textLayerDiv);

  if (keywords.length === 0) return;

  // Collect all text-bearing span elements inside the text layer
  const spans = Array.from(textLayerDiv.querySelectorAll('span'));

  spans.forEach((span) => {
    // Work on the raw inner HTML to allow regex replacement
    let html = span.innerHTML;

    // Apply each keyword's highlight pattern
    keywords.forEach((kw) => {
      const escaped = escapeRegex(kw.text);
      const regex = new RegExp(`(${escaped})`, 'gi');
      const vividBg = getVividBgColor(kw);
      html = html.replace(
        regex,
        `<mark 
          class="findr-highlight" 
          data-keyword-id="${kw.id}" 
          style="background-color:${vividBg};"
        >$1</mark>`
      );
    });

    span.innerHTML = html;
  });
}

/**
 * Removes all injected <mark> elements from a text layer,
 * restoring the original text content.
 */
export function resetHighlights(textLayerDiv: HTMLElement): void {
  const marks = textLayerDiv.querySelectorAll('mark.findr-highlight');
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (parent) {
      // Replace mark with its text content
      parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
      // Normalize merges adjacent text nodes
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
 * Counts total occurrences of a keyword in a plain text string using case-insensitive regex.
 */
export function countOccurrences(text: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  const escaped = escapeRegex(keyword.trim());
  const regex = new RegExp(escaped, 'gi');
  return (text.match(regex) || []).length;
}
