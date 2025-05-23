export interface SavedItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  created_at: string;
  favicon_url?: string;
  og_image_url?: string;
  thumbnail?: string;
  is_archived?: boolean;
  is_favorite?: boolean;
  metadata?: Record<string, any>;
}

export interface SavedItems {
  [key: string]: SavedItem;
} 