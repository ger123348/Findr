import { KeywordItem } from '@/types';
import Mark from 'mark.js';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function highlightTextLayer(
  textLayerDiv: HTMLElement,
  keywords: KeywordItem[]
): void {
  const instance = new Mark(textLayerDiv);
  instance.unmark(); 
  
  keywords.forEach((kw) => {
    // Use the keyword's assigned pastel color, but with 50% opacity
    // so the text underneath is clearly legible, and add a crisp border.
    const bgColor = hexToRgba(kw.color, 0.5);
    const borderColor = hexToRgba(kw.textColor, 0.3);

    instance.mark(kw.text, {
      className: 'findr-highlight',
      separateWordSearch: false,
      acrossElements: true,
      each: (elem) => {
        const htmlElem = elem as HTMLElement;
        htmlElem.style.setProperty('background-color', bgColor, 'important');
        htmlElem.style.setProperty('border-radius', '4px', 'important');
        htmlElem.style.setProperty('box-shadow', `0 0 0 1px ${borderColor}`, 'important');
        
        // Critical for PDF.js text layer: keep the actual mark text transparent
        // so it doesn't double-draw over the canvas text.
        htmlElem.style.setProperty('color', 'transparent', 'important');
        htmlElem.style.setProperty('display', 'inline', 'important');
        htmlElem.dataset.keywordId = kw.id;
      }
    });
  });
}

export function resetHighlights(textLayerDiv: HTMLElement): void {
  const instance = new Mark(textLayerDiv);
  instance.unmark();
}

export function countOccurrences(text: string, keyword: string): number {
  const trimmed = keyword.trim();
  if (!trimmed) return 0;
  
  // 1. Escape special regex characters
  // 2. Replace literal spaces with \s+ so it matches any amount of spaces/newlines
  // This matches mark.js default behavior (accuracy: "partially", ignoreJoiners: true)
  const escaped = trimmed
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+');
    
  const regex = new RegExp(escaped, 'gi');
  return (text.match(regex) || []).length;
}

export function extractMatchesContext(text: string, keyword: string, contextLength = 40): { count: number; snippets: { pre: string; match: string; post: string }[] } {
  const trimmed = keyword.trim();
  if (!trimmed) return { count: 0, snippets: [] };
  
  const escaped = trimmed
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+');
    
  const regex = new RegExp(escaped, 'gi');
  let match;
  let count = 0;
  const snippets = [];
  
  while ((match = regex.exec(text)) !== null) {
    count++;
    
    const start = Math.max(0, match.index - contextLength);
    const end = Math.min(text.length, match.index + match[0].length + contextLength);
    
    let pre = text.substring(start, match.index);
    const matchText = match[0];
    let post = text.substring(match.index + matchText.length, end);
    
    // Clean up whitespace and line breaks for snippets
    pre = pre.replace(/\s+/g, ' ').replace(/^\S*\s/, ''); // remove chopped word at start
    post = post.replace(/\s+/g, ' ').replace(/\s\S*$/, ''); // remove chopped word at end
    
    if (start > 0) pre = '...' + pre;
    if (end < text.length) post = post + '...';
    
    snippets.push({ pre, match: matchText, post });
  }
  
  return { count, snippets };
}
