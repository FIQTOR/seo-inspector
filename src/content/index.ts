import { extractPageRawData } from './extractor';

// Listen for message from popup or background script
chrome.runtime.onMessage.addListener(
  (
    message: { type: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => {
    if (message.type === 'EXTRACT_SEO_DATA') {
      try {
        const data = extractPageRawData();
        sendResponse({ success: true, data });
      } catch (err: unknown) {
        sendResponse({ 
          success: false, 
          error: err instanceof Error ? err.message : 'Failed to extract SEO data' 
        });
      }
    }
    return true; // Keep asynchronous channel open
  }
);
