import React, { useEffect, useState } from 'react';
import { SavedItem } from '../types';
import { authService } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { config } from '../config/env';
import LoginScreen from './components/LoginScreen';
import LoadingScreen from './components/LoadingScreen';

const Popup: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const session = await authService.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        // Set session in Supabase client
        supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
        
        // Load saved items from Supabase
        const { data, error } = await supabase
          .from('saved_items')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setSavedItems(data);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setCurrentTab(tabs[0]);
    });

    // Listen for auth completion message
    const messageListener = (message: any) => {
      if (message.type === 'AUTH_COMPLETE') {
        checkAuth();
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    checkAuth();

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleSave = async () => {
    if (!currentTab?.url || !currentTab?.title) return;

    setIsSaving(true);
    const newItem = {
      url: currentTab.url,
      title: currentTab.title,
      tags: [],
      created_at: new Date().toISOString(),
      favicon: currentTab.favIconUrl
    };

    try {
      const { data, error } = await supabase
        .from('saved_items')
        .insert([newItem])
        .select()
        .single();

      if (error) {
        if (error.code === '401') {
          // Session expired, clear it and show login
          await authService.clearSession();
          setIsAuthenticated(false);
        } else {
          throw error;
        }
      } else {
        setSavedItems([data, ...savedItems]);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await authService.clearSession();
    setIsAuthenticated(false);
    setSavedItems([]);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="w-96 min-h-[400px] bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Stashed</h1>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
        >
          Sign out
        </button>
      </div>

      {/* Save Section */}
      {currentTab && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {currentTab.favIconUrl && (
              <img src={currentTab.favIconUrl} alt="" className="w-4 h-4" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentTab.title}
              </p>
              <p className="text-xs text-gray-500 truncate">{currentTab.url}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Saved Items List */}
      <div className="p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Recent Items</h2>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {savedItems.slice(0, 10).map((item) => (
            <div key={item.id} className="flex items-start space-x-3">
              {item.favicon && (
                <img src={item.favicon} alt="" className="w-4 h-4 mt-1" />
              )}
              <div className="flex-1 min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                >
                  {item.title}
                </a>
                <p className="text-xs text-gray-500 truncate">{item.url}</p>
              </div>
            </div>
          ))}
          {savedItems.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No saved items yet. Save your first page!
            </p>
          )}
        </div>
        {savedItems.length > 10 && (
          <div className="mt-3 text-center">
            <a
              href={`${config.webAppUrl}/dashboard`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              View all {savedItems.length} items →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup; 