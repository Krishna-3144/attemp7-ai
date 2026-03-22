// Background service worker for TwoSidedNews extension
// Handles context menu and badge updates

chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for right-click analyze
  chrome.contextMenus?.create({
    id: 'analyze-selection',
    title: 'Analyze with TwoSidedNews AI',
    contexts: ['selection', 'page'],
  });

  console.log('TwoSidedNews AI extension installed');
});

// Context menu click handler
chrome.contextMenus?.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyze-selection') {
    const text = info.selectionText || tab.url;
    chrome.storage.local.set({ pendingAnalysis: text }, () => {
      chrome.action.openPopup?.();
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setBadge') {
    chrome.action.setBadgeText({ text: request.text || '' });
    chrome.action.setBadgeBackgroundColor({ color: request.color || '#1a56db' });
  }
  sendResponse({ ok: true });
  return true;
});
