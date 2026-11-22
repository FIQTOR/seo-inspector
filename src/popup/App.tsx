import React, { useEffect, useState, useCallback } from 'react';
import { Header, ScoreSection, TabsNav } from './components/Navigation';
import { OverviewTab } from './components/OverviewTab';
import { MetaTab } from './components/MetaTab';
import { HeadingsTab } from './components/HeadingsTab';
import { ImagesTab } from './components/ImagesTab';
import { LinksTab } from './components/LinksTab';
import { SocialTab } from './components/SocialTab';
import { TechnicalTab } from './components/TechnicalTab';
import { SchemaTab } from './components/SchemaTab';
import { Footer } from './components/Footer';

import { PageRawData, AuditResult, Category } from '../types/seo';
import { extractPageRawData } from '../content/extractor';
import { analyzeSeo } from '../engine/analyzer';
import { AlertTriangle, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>('overview');
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  const runAudit = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        // Fallback for local browser preview / development
        const raw = extractPageRawData();
        const result = analyzeSeo(raw);
        setAudit(result);
        setCurrentUrl(raw.url);
        setLoading(false);
        return;
      }

      const [activeTabObj] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTabObj || !activeTabObj.id) {
        throw new Error('No active browser tab found.');
      }

      const tabUrl = activeTabObj.url || '';
      setCurrentUrl(tabUrl);

      // Handle restricted URLs (chrome://, edge://, about:, webstore)
      if (tabUrl.startsWith('chrome://') || tabUrl.startsWith('edge://') || tabUrl.startsWith('about:') || tabUrl.startsWith('chrome-extension://')) {
        setError('Chrome internal pages cannot be inspected due to browser security restrictions. Please navigate to a standard public website.');
        setLoading(false);
        return;
      }

      // Execute data extraction in the active tab context using chrome.scripting.executeScript
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTabObj.id },
        func: extractPageRawData
      });

      if (!results || results.length === 0 || !results[0].result) {
        throw new Error('Could not extract DOM data from webpage.');
      }

      const rawData = results[0].result as PageRawData;
      const result = analyzeSeo(rawData);

      setAudit(result);

      // Save to background cache
      chrome.runtime.sendMessage({
        type: 'SET_CACHED_AUDIT',
        tabId: activeTabObj.id,
        url: tabUrl,
        data: result
      });
    } catch (err: unknown) {
      console.error('Audit failed:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to inspect current webpage. Please refresh the page and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runAudit();
  }, [runAudit]);

  return (
    <div className="flex flex-col h-full min-h-[580px] bg-[#0B0F19] text-[#F9FAFB]">
      <Header 
        url={currentUrl} 
        onRefresh={runAudit} 
        isLoading={loading} 
      />

      {loading && !audit && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <div className="text-sm font-medium text-gray-300">Auditing webpage SEO...</div>
          <p className="text-xs text-gray-500 text-center max-w-[280px]">
            Extracting meta tags, document hierarchy, images, links, and schema markup
          </p>
        </div>
      )}

      {error && !audit && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold text-rose-400">Audit Unavailable</div>
          <p className="text-xs text-gray-400 max-w-[340px] leading-relaxed">
            {error}
          </p>
          <button
            onClick={runAudit}
            className="px-3.5 py-1.5 bg-[#1F2937] hover:bg-gray-700 text-white rounded text-xs font-medium transition-all"
          >
            Retry Audit
          </button>
        </div>
      )}

      {audit && (
        <>
          <ScoreSection audit={audit} />
          <TabsNav activeTab={activeTab} onSelectTab={setActiveTab} audit={audit} />

          <main className="flex-1 p-4 overflow-y-auto max-h-[380px]">
            {activeTab === 'overview' && (
              <OverviewTab audit={audit} onNavigateTab={setActiveTab} />
            )}
            {activeTab === 'meta' && (
              <MetaTab audit={audit} />
            )}
            {activeTab === 'headings' && (
              <HeadingsTab audit={audit} />
            )}
            {activeTab === 'images' && (
              <ImagesTab audit={audit} />
            )}
            {activeTab === 'links' && (
              <LinksTab audit={audit} />
            )}
            {activeTab === 'social' && (
              <SocialTab audit={audit} />
            )}
            {activeTab === 'technical' && (
              <TechnicalTab audit={audit} />
            )}
            {activeTab === 'schema' && (
              <SchemaTab audit={audit} />
            )}
          </main>
        </>
      )}

      <Footer audit={audit} />
    </div>
  );
};

