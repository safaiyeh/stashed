export const config = {
  webAppUrl: import.meta.env.VITE_WEB_APP_URL,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const; 