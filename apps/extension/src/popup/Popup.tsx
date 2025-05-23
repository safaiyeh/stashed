import React, { useEffect, useState } from 'react';
import { SavedItem } from '../types';

const Popup: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Get current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setCurrentTab(tabs[0]);
    });

    // Load saved items
    chrome.storage.local.get(['savedItems'], (result) => {
      const items = result.savedItems || {};
      setSavedItems(Object.values(items));
    });
  }, []);

  const handleSave = async () => {
    if (!currentTab?.url || !currentTab?.title) return;

    setIsSaving(true);
    const newItem: SavedItem = {
      id: Date.now().toString(),
      url: currentTab.url,
      title: currentTab.title,
      tags: [],
      createdAt: Date.now(),
      favicon: currentTab.favIconUrl
    };

    try {
      const result = await chrome.storage.local.get(['savedItems']);
      const items = result.savedItems || {};
      items[newItem.id] = newItem;
      await chrome.storage.local.set({ savedItems: items });
      setSavedItems([...savedItems, newItem]);
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-96 min-h-[400px] bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Stashed</h1>
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
        <h2 className="text-sm font-medium text-gray-700 mb-3">Saved Items</h2>
        <div className="space-y-3">
          {savedItems.map((item) => (
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
              No saved items yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup; 