import { KeywordItem } from '@/types';

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
      html = html.replace(
        regex,
        `<mark 
          class="findr-highlight" 
          data-keyword-id="${kw.id}" 
          style="background-color:${kw.color};color:${kw.textColor};border-radius:2px;padding:0 1px;"
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
