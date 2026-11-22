// Chrome Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('SEO Inspector Extension installed successfully.');
});

// Cache for audited tabs to make popup instant
interface AuditCache {
  [tabId: number]: {
    url: string;
    timestamp: number;
    data: unknown;
  };
}

const auditCache: AuditCache = {};

// Clean cache when a tab is closed or updated
chrome.tabs.onRemoved.addListener((tabId: number) => {
  delete auditCache[tabId];
});

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo) => {
  if (changeInfo.status === 'loading' || changeInfo.url) {
    delete auditCache[tabId];
  }
});

// Handle messages
chrome.runtime.onMessage.addListener((message: { type: string; tabId?: number; url?: string; data?: unknown }, _sender, sendResponse: (response?: unknown) => void) => {
  if (message.type === 'GET_CACHED_AUDIT') {
    const tabId = message.tabId;
    if (tabId && auditCache[tabId]) {
      sendResponse({ success: true, cached: auditCache[tabId] });
    } else {
      sendResponse({ success: false });
    }
  } else if (message.type === 'SET_CACHED_AUDIT') {
    const tabId = message.tabId;
    if (tabId) {
      auditCache[tabId] = {
        url: message.url || '',
        timestamp: Date.now(),
        data: message.data
      };
      sendResponse({ success: true });
    }
  }
  return true;
});
