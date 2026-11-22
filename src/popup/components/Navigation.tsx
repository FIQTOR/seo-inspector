import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RotateCw
} from 'lucide-react';
import { Category, AuditResult } from '../../types/seo';

interface HeaderProps {
  url: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ url, onRefresh, isLoading }) => {
  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch {
    hostname = url || 'Current Webpage';
  }

  return (
    <header className="px-4 py-3 bg-[#111827] border-b border-[#1F2937] flex items-center justify-between">
      <div className="flex items-center space-x-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-sm tracking-wider">
          SEO
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5">
            <h1 className="text-sm font-semibold text-white tracking-tight leading-none">SEO Inspector</h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-medium">v1.0</span>
          </div>
          <p className="text-xs text-gray-400 truncate max-w-[340px] mt-0.5" title={url}>
            {hostname}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-md bg-[#1F2937] hover:bg-gray-700 text-gray-300 hover:text-white transition-all disabled:opacity-50"
          title="Re-run audit"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};

interface ScoreSectionProps {
  audit: AuditResult;
}

export const ScoreSection: React.FC<ScoreSectionProps> = ({ audit }) => {
  const { overallScore, counts } = audit;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Good Health';
    if (score >= 60) return 'Needs Work';
    return 'Poor Condition';
  };

  return (
    <div className="p-4 bg-gradient-to-b from-[#111827] to-[#0B0F19] border-b border-[#1F2937] flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Large Score Indicator */}
        <div className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center font-bold ${getScoreColor(overallScore)}`}>
          <span className="text-2xl leading-none">{overallScore}</span>
          <span className="text-[10px] uppercase font-semibold tracking-wider opacity-80">/ 100</span>
        </div>

        <div>
          <div className="text-xs uppercase font-medium tracking-wider text-gray-400">Overall SEO Score</div>
          <div className="text-base font-semibold text-white flex items-center space-x-1.5">
            <span>{getScoreLabel(overallScore)}</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {counts.total} checks evaluated across 7 categories
          </div>
        </div>
      </div>

      {/* Counters */}
      <div className="flex space-x-2">
        <div className="px-3 py-2 rounded-lg bg-[#111827] border border-rose-500/20 flex flex-col items-center min-w-[70px]">
          <div className="flex items-center space-x-1 text-rose-400">
            <XCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Critical</span>
          </div>
          <span className="text-base font-bold text-white mt-0.5">{counts.critical}</span>
        </div>

        <div className="px-3 py-2 rounded-lg bg-[#111827] border border-amber-500/20 flex flex-col items-center min-w-[70px]">
          <div className="flex items-center space-x-1 text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Warning</span>
          </div>
          <span className="text-base font-bold text-white mt-0.5">{counts.warning}</span>
        </div>

        <div className="px-3 py-2 rounded-lg bg-[#111827] border border-emerald-500/20 flex flex-col items-center min-w-[70px]">
          <div className="flex items-center space-x-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Passed</span>
          </div>
          <span className="text-base font-bold text-white mt-0.5">{counts.passed}</span>
        </div>
      </div>
    </div>
  );
};

interface TabsNavProps {
  activeTab: Category;
  onSelectTab: (tab: Category) => void;
  audit: AuditResult;
}

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onSelectTab, audit }) => {
  const tabs: Array<{ id: Category; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'meta', label: 'Meta' },
    { id: 'headings', label: 'Headings' },
    { id: 'images', label: 'Images' },
    { id: 'links', label: 'Links' },
    { id: 'social', label: 'Social' },
    { id: 'technical', label: 'Technical' },
    { id: 'schema', label: 'Schema' },
  ];

  return (
    <nav className="flex space-x-1 px-4 py-2 bg-[#0B0F19] border-b border-[#1F2937] overflow-x-auto text-xs scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const score = tab.id !== 'overview' ? audit.categoryScores[tab.id]?.percentage : null;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-all flex items-center space-x-1.5 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1F2937]'
            }`}
          >
            <span>{tab.label}</span>
            {score !== null && (
              <span className={`text-[10px] px-1 rounded ${
                score >= 85 ? 'bg-emerald-500/20 text-emerald-300' :
                score >= 60 ? 'bg-amber-500/20 text-amber-300' :
                'bg-rose-500/20 text-rose-300'
              }`}>
                {score}%
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
