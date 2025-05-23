import { authService } from '../lib/auth';
import { supabase } from '../lib/supabase';

// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveToStashed',
    title: 'Save to Stashed',
    contexts: ['page', 'link']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'saveToStashed' && tab?.url) {
    try {
      const session = await authService.getSession();
      
      if (!session) {
        await authService.redirectToLogin();
        return;
      }

      // Set the session in Supabase client
      supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });

      const newItem = {
        url: tab.url,
        title: tab.title || '',
        tags: [],
        created_at: new Date().toISOString(),
        favicon: tab.favIconUrl
      };

      const { error } = await supabase
        .from('saved_items')
        .insert([newItem]);

      if (error) {
        if (error.code === '401') {
          // Session is invalid, clear it and redirect to login
          await authService.clearSession();
          await authService.redirectToLogin();
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  }
}); 