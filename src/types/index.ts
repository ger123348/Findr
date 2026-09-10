export interface KeywordItem {
  id: string;
  text: string;
  color: string; // background color for highlight
  textColor: string; // contrasting text color for badge
}

export interface DocumentRecord {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

export interface SearchMatch {
  pageIndex: number;
  count: number;
}

export interface KeywordResult {
  keyword: KeywordItem;
  totalCount: number;
  matches: SearchMatch[];
}

export interface PdfPage {
  pageIndex: number;
  text: string;
}
