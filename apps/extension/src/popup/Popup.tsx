import React, { useEffect, useState } from 'react';
import { SavedItem } from '../types';
import LoadingScreen from './components/LoadingScreen';
import { useSaves } from '../lib/hooks/useSaves';
import { authService } from '../lib/auth';

const Popup: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const { saves, isLoading, createSave, deleteSave, isCreating, isDeleting } = useSaves();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [removeStatus, setRemoveStatus] = useState<'idle' | 'removing' | 'removed'>('idle');

  const handleSave = async () => {
    if (!currentTab?.url || !currentTab?.title) return;

    setSaveStatus('saving');
    
    // Get OG image URL and description from the page
    let ogImageUrl: string | undefined;
    let description: string | undefined;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Get OG image
            const ogImage = document.querySelector('meta[property="og:image"]');
            const imageUrl = ogImage ? ogImage.getAttribute('content') : null;

            // Get description (try OG description first, then regular meta description)
            const ogDesc = document.querySelector('meta[property="og:description"]');
            const metaDesc = document.querySelector('meta[name="description"]');
            const desc = ogDesc ? ogDesc.getAttribute('content') : 
                        metaDesc ? metaDesc.getAttribute('content') : null;

            return { imageUrl, description: desc };
          }
        });
        ogImageUrl = result?.imageUrl || undefined;
        description = result?.description || undefined;
      }
    } catch (error) {
      console.error('Error getting page metadata:', error);
    }

    const newItem: Omit<SavedItem, 'id'> = {
      url: currentTab.url,
      title: currentTab.title,
      created_at: new Date().toISOString(),
      favicon_url: currentTab.favIconUrl,
      og_image_url: ogImageUrl,
      description
    };

    try {
      await createSave(newItem);
      setSaveStatus('saved');
    } catch (error: any) {
      console.error('Error saving item:', error);
      if (error.message === 'No active session') {
        await authService.redirectToLogin();
      }
      setSaveStatus('idle');
    }
  };

  const handleRemove = async () => {
    if (!currentTab?.url) return;
    
    setRemoveStatus('removing');
    try {
      const saveToRemove = saves?.find(save => save.url === currentTab.url);
      if (saveToRemove) {
        await deleteSave(saveToRemove.id);
        setRemoveStatus('removed');
      }
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
  }, []);

  // Auto-save when current tab is available
  useEffect(() => {
    if (currentTab && !isLoading) {
      const isAlreadySaved = saves?.some(save => save.url === currentTab.url);
      if (!isAlreadySaved) {
        handleSave();
      }
    }
  }, [currentTab, isLoading, saves]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const isSaved = saves?.some(save => save.url === currentTab?.url);

  // Status message logic
  let statusMessage = '';
  if (removeStatus === 'removing' || isDeleting) {
    statusMessage = 'Removing...';
  } else if (removeStatus === 'removed') {
    statusMessage = 'Page Removed';
  } else if (saveStatus === 'saving' || isCreating) {
    statusMessage = 'Saving...';
  } else if (saveStatus === 'saved' || isSaved) {
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
          {statusMessage || (isSaved ? 'Saved to Stashed!' : 'Save to Stashed')}
        </p>
        {isSaved && removeStatus === 'idle' && currentTab && (
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