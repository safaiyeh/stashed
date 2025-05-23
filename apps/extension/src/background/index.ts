// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveToStashed',
    title: 'Save to Stashed',
    contexts: ['page', 'link']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveToStashed' && tab?.url) {
    const newItem = {
      id: Date.now().toString(),
      url: tab.url,
      title: tab.title || '',
      tags: [],
      createdAt: Date.now(),
      favicon: tab.favIconUrl
    };

    chrome.storage.local.get(['savedItems'], (result) => {
      const items = result.savedItems || {};
      items[newItem.id] = newItem;
      chrome.storage.local.set({ savedItems: items });
    });
  }
}); 