import { KeywordItem } from '@/types';

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
 * Highlights keywords by replacing text inside spans with <mark> tags.
 */
export function highlightTextLayer(
  textLayerDiv: HTMLElement,
  keywords: KeywordItem[]
): void {
  resetHighlights(textLayerDiv);
  if (keywords.length === 0) return;

  const spans = Array.from(textLayerDiv.querySelectorAll('span'));

  spans.forEach((span) => {
    let html = span.textContent || '';
    let hasMatch = false;

    keywords.forEach((kw) => {
      const escaped = escapeRegex(kw.text);
      const regex = new RegExp(`(${escaped})`, 'gi');
      if (regex.test(html)) {
        hasMatch = true;
        const color = getHighlightColor(kw);
        html = html.replace(
          regex,
          `<mark class="findr-highlight" data-keyword-id="${kw.id}" style="background-color: ${color} !important; border-radius: 2px !important; color: transparent !important; display: inline-block !important;">$1</mark>`
        );
      }
    });

    if (hasMatch) {
      span.innerHTML = html;
    }
  });
}

/**
 * Removes all highlights from the text layer.
 */
export function resetHighlights(textLayerDiv: HTMLElement): void {
  const marks = Array.from(textLayerDiv.querySelectorAll('mark.findr-highlight'));
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
      parent.normalize(); // merge adjacent text nodes
    }
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
