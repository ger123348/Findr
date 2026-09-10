import { KeywordItem } from '@/types';
import Mark from 'mark.js';

const VIVID_MAP: Record<string, string> = {
  '#FFD6D6': 'rgba(255, 0, 0, 0.7)',
  '#D6EAFF': 'rgba(0, 0, 255, 0.7)',
  '#D6FFE4': 'rgba(0, 255, 0, 0.7)',
  '#FFF3D6': 'rgba(255, 255, 0, 0.7)',
  '#F0D6FF': 'rgba(255, 0, 255, 0.7)',
  '#FFE6D6': 'rgba(255, 128, 0, 0.7)',
  '#D6FDFF': 'rgba(0, 255, 255, 0.7)',
  '#FFD6F5': 'rgba(255, 0, 128, 0.7)',
  '#E8FFD6': 'rgba(128, 255, 0, 0.7)',
  '#D6D6FF': 'rgba(128, 0, 255, 0.7)',
};

function getHighlightColor(keyword: KeywordItem): string {
  return VIVID_MAP[keyword.color] || 'rgba(255, 255, 0, 0.8)';
}

export function highlightTextLayer(
  textLayerDiv: HTMLElement,
  keywords: KeywordItem[]
): void {
  console.log('Running highlightTextLayer with keywords:', keywords.map(k => k.text));
  const instance = new Mark(textLayerDiv);
  instance.unmark(); 
  
  keywords.forEach((kw) => {
    const color = getHighlightColor(kw);
    instance.mark(kw.text, {
      className: 'findr-highlight',
      separateWordSearch: false,
      acrossElements: true,
      each: (elem) => {
        // EXTREMELY aggressive inline styles to force visibility
        elem.style.setProperty('background-color', color, 'important');
        elem.style.setProperty('border', '2px solid red', 'important');
        elem.style.setProperty('box-shadow', '0 0 10px rgba(255,0,0,1)', 'important');
        elem.style.setProperty('color', 'transparent', 'important');
        elem.style.setProperty('display', 'inline', 'important');
        elem.style.setProperty('position', 'relative', 'important');
        elem.style.setProperty('z-index', '9999', 'important');
        elem.style.setProperty('opacity', '1', 'important');
        elem.dataset.keywordId = kw.id;
      },
      done: (count) => {
        console.log(`Mark.js found ${count} matches for "${kw.text}"`);
      }
    });
  });
}

export function resetHighlights(textLayerDiv: HTMLElement): void {
  const instance = new Mark(textLayerDiv);
  instance.unmark();
}

export function countOccurrences(text: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'gi');
  return (text.match(regex) || []).length;
}
