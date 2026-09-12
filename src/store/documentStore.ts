import { create } from 'zustand';
import { KeywordItem } from '@/types';

// Pastel color palette for keyword badges and highlights
const KEYWORD_COLORS: { bg: string; text: string }[] = [
  { bg: '#FFD6D6', text: '#C0392B' }, // red
  { bg: '#D6EAFF', text: '#1A6FC4' }, // blue
  { bg: '#D6FFE4', text: '#1A8C4E' }, // green
  { bg: '#FFF3D6', text: '#B07D1A' }, // yellow
  { bg: '#F0D6FF', text: '#7B2DA0' }, // purple
  { bg: '#FFE6D6', text: '#C45C1A' }, // orange
  { bg: '#D6FDFF', text: '#1A9BA8' }, // teal
  { bg: '#FFD6F5', text: '#B0197E' }, // pink
  { bg: '#E8FFD6', text: '#4A8C1A' }, // lime
  { bg: '#D6D6FF', text: '#3A2DC4' }, // indigo
];

interface DocumentState {
  documentUrl: string | null;
  documentName: string | null;
  keywords: KeywordItem[];
  colorIndex: number;
  setDocument: (url: string, name: string) => void;
  clearDocument: () => void;
  addKeyword: (text: string) => void;
  removeKeyword: (id: string) => void;
  clearKeywords: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documentUrl: null,
  documentName: null,
  keywords: [],
  colorIndex: 0,

  setDocument: (url, name) => {
    const currentUrl = get().documentUrl;
    if (currentUrl && currentUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentUrl);
    }
    set({ documentUrl: url, documentName: name, keywords: [], colorIndex: 0 });
  },

  clearDocument: () => {
    const currentUrl = get().documentUrl;
    if (currentUrl && currentUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentUrl);
    }
    set({ documentUrl: null, documentName: null, keywords: [], colorIndex: 0 });
  },

  addKeyword: (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const { keywords, colorIndex } = get();

    // Dedup check – case-insensitive
    const alreadyExists = keywords.some(
      (k) => k.text.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyExists) return;

    const palette = KEYWORD_COLORS[colorIndex % KEYWORD_COLORS.length];
    const newKeyword: KeywordItem = {
      id: `kw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: trimmed,
      color: palette.bg,
      textColor: palette.text,
    };

    set({
      keywords: [...keywords, newKeyword],
      colorIndex: colorIndex + 1,
    });
  },

  removeKeyword: (id: string) =>
    set((state) => ({
      keywords: state.keywords.filter((k) => k.id !== id),
    })),

  clearKeywords: () => set({ keywords: [], colorIndex: 0 }),
}));
