export interface SavedItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: number;
  favicon?: string;
  thumbnail?: string;
}

export interface SavedItems {
  [key: string]: SavedItem;
} 