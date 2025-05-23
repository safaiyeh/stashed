import React, { useEffect, useState } from 'react';
import { SavedItem } from '../types';
import SkeletonLoader from './components/SkeletonLoader';
import { useSaves } from '../lib/hooks/useSaves';
import { useTags } from '../lib/hooks/useTags';
import { authService } from '../lib/auth';

const Popup: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const { saves, isLoading: isSavesLoading, createSave, deleteSave, isCreating, isDeleting } = useSaves();
  const { tags, isLoading: isTagsLoading, createTag, addTagsToSave } = useTags();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [removeStatus, setRemoveStatus] = useState<'idle' | 'removing' | 'removed'>('idle');
  const [tagInput, setTagInput] = useState('');
  const [isSavingTags, setIsSavingTags] = useState(false);
  const [tagsSaved, setTagsSaved] = useState(false);
  const [currentSave, setCurrentSave] = useState<SavedItem | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Helper: get domain from url
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };


  // Save the page
  const handleSave = async () => {
    if (!currentTab?.url || !currentTab?.title) return;
    setSaveStatus('saving');
    let ogImageUrl: string | undefined;
    let description: string | undefined;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const ogImage = document.querySelector('meta[property="og:image"]');
            const imageUrl = ogImage ? ogImage.getAttribute('content') : null;
            const ogDesc = document.querySelector('meta[property="og:description"]');
            const metaDesc = document.querySelector('meta[name="description"]');
            const desc = ogDesc ? ogDesc.getAttribute('content') : metaDesc ? metaDesc.getAttribute('content') : null;
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
      const savedItem = await createSave(newItem);
      setCurrentSave(savedItem);
      setSaveStatus('saved');
    } catch (error: any) {
      console.error('Error saving item:', error);
      if (error.message === 'No active session') {
        await authService.redirectToLogin();
      }
      setSaveStatus('idle');
    }
  };

  // Save tags for the current save
  const handleSaveTags = async () => {
    if (!currentSave || (!tagInput.trim() && selectedTagIds.length === 0)) return;
    setIsSavingTags(true);
    setTagsSaved(false);
    // Split input by comma or space, trim, and dedupe
    const inputTags = Array.from(new Set(tagInput.split(/[, ]+/).map(t => t.trim()).filter(Boolean)));
    // Find which tags are new
    const existingTagNames = tags?.map(t => t.name) || [];
    const newTagNames = inputTags.filter(t => !existingTagNames.includes(t));
    const existingTagIds = tags?.filter(t => inputTags.includes(t.name)).map(t => t.id) || [];
    // Create new tags
    const newTagIds: string[] = [];
    for (const name of newTagNames) {
      try {
        const tag = await createTag(name);
        if (tag && tag.id) newTagIds.push(tag.id);
      } catch (e) { /* ignore duplicate errors */ }
    }
    // Add all tag ids to the save (selected + from input)
    const allTagIds = Array.from(new Set([...selectedTagIds, ...existingTagIds, ...newTagIds]));
    if (allTagIds.length > 0) {
      await addTagsToSave(allTagIds.map(tagId => ({ save_id: currentSave.id, tag_id: tagId })));
    }
    // Refresh tags for this save
    setIsSavingTags(false);
    setTagsSaved(true);
    setTagInput('');
    setTimeout(() => setTagsSaved(false), 1500);
  };

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setCurrentTab(tabs[0]);
    });
  }, []);

  useEffect(() => {
    if (currentTab && !isSavesLoading) {
      const found = saves?.find(save => save.url === currentTab.url);
      if (!found) {
        handleSave();
      } else {
        setCurrentSave(found);
      }
    }
    // eslint-disable-next-line
  }, [currentTab, isSavesLoading, saves]);

  if (isSavesLoading || isTagsLoading) {
    return <SkeletonLoader />;
  }

  const isSaved = !!currentSave;
  let statusMessage = '';
  if (removeStatus === 'removing' || isDeleting) {
    statusMessage = 'Removing...';
  } else if (removeStatus === 'removed') {
    statusMessage = 'Page Removed';
  } else if (saveStatus === 'saving' || isCreating) {
    statusMessage = 'Saving...';
  } else if (saveStatus === 'saved') {
    statusMessage = 'Saved to Stashed!';
  }

  return (
    <div className="w-96 bg-white text-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/stashed-icon.png" alt="Stashed" className="w-6 h-6" />
          <span className="text-xl font-bold">Stashed</span>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium" onClick={() => window.open(import.meta.env.VITE_SAVES_URL, '_blank')}>View My Saves</button>
      </div>

      {/* Save/Remove Status */}
      <div className="px-4 py-2 flex items-center justify-between">
        <p className="text-xl font-bold">
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

      {/* Current Tab Info */}
      {currentTab && removeStatus === 'idle' && (
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
            {currentTab.favIconUrl ? (
              <img src={currentTab.favIconUrl} alt="" className="w-6 h-6" />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium truncate text-gray-900">
              {getDomain(currentTab.url || '')}
            </p>
          </div>
        </div>
      )}

      {/* Tag Input Section */}
      {isSaved && removeStatus !== 'removing' && (
        <div className="p-4 border-b border-gray-200">
          <div className="mb-2 font-semibold">Add Tags:</div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="Enter tags..."
              className="flex-1 px-3 py-2 rounded bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={e => { if (e.key === 'Enter') handleSaveTags(); }}
              disabled={isSavingTags}
            />
            <button
              onClick={handleSaveTags}
              disabled={isSavingTags || (!tagInput.trim() && selectedTagIds.length === 0)}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
            >
              Save
            </button>
          </div>
          {/* User's tags as selectable pills */}
          <div className="flex flex-wrap gap-2 mb-2">
            {tags?.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-2 py-1 rounded-full text-sm border transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
          {isSavingTags && <div className="text-sm text-blue-600">Saving tags...</div>}
          {tagsSaved && <div className="text-sm text-green-600">Tags Saved.</div>}
        </div>
      )}
    </div>
  );
};

export default Popup; 