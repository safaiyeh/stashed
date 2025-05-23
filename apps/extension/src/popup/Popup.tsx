import React, { useEffect, useState } from 'react';
import { SavedItem } from '../types';
import LoadingScreen from './components/LoadingScreen';

const Popup: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [removeStatus, setRemoveStatus] = useState<'idle' | 'removing' | 'removed'>('idle');

  const loadSavedItems = async () => {
    try {
      const { items } = await chrome.storage.local.get(['items']);
      if (items) {
        setSavedItems(items);
      }
    } catch (error) {
      console.error('Error loading saved items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentTab?.url || !currentTab?.title) return;

    setSaveStatus('saving');
    const newItem: SavedItem = {
      id: Date.now().toString(),
      url: currentTab.url,
      title: currentTab.title,
      tags: [],
      createdAt: Date.now(),
      favicon: currentTab.favIconUrl
    };

    try {
      const updatedItems = [newItem, ...savedItems];
      await chrome.storage.local.set({ items: updatedItems });
      setSavedItems(updatedItems);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleRemove = async () => {
    setRemoveStatus('removing');
    try {
      const filtered = savedItems.filter(item => item.url !== currentTab?.url);
      await chrome.storage.local.set({ items: filtered });
      setSavedItems(filtered);
      setRemoveStatus('removed');
    } catch (error) {
      console.error('Error removing item:', error);
      setRemoveStatus('idle');
    }
  };

  useEffect(() => {
    // Get current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setCurrentTab(tabs[0]);
    });

    loadSavedItems();
  }, []);

  // Auto-save when current tab is available
  useEffect(() => {
    if (currentTab && !isLoading) {
      handleSave();
    }
  }, [currentTab, isLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Status message logic
  let statusMessage = '';
  if (removeStatus === 'removing') {
    statusMessage = 'Removing...';
  } else if (removeStatus === 'removed') {
    statusMessage = 'Page Removed';
  } else if (saveStatus === 'saving') {
    statusMessage = 'Saving...';
  } else if (saveStatus === 'saved') {
    statusMessage = 'Saved to Stashed!';
  }

  return (
    <div className="w-96 bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Stashed</h1>
      </div>

      {/* Save/Remove Status */}
      <div className="px-4 py-2 flex items-center justify-between">
        <p className="text-xl font-bold text-gray-900">
          {statusMessage}
        </p>
        {saveStatus === 'saved' && removeStatus === 'idle' && currentTab && (
          <button
            className="text-blue-600 text-sm font-medium hover:underline ml-4"
            onClick={handleRemove}
          >
            Remove
          </button>
        )}
      </div>

      {/* Current Tab Info (hide if removing or removed) */}
      {currentTab && removeStatus === 'idle' && (
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup; 