import React from 'react';
import { AuditResult, Category } from '../../types/seo';
import { IssueCard } from './IssueCard';
import { 
  FileText, 
  CheckCircle, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Image as ImageIcon, 
  Link2, 
  Share2, 
  ShieldCheck, 
  Braces 
} from 'lucide-react';

interface OverviewTabProps {
  audit: AuditResult;
  onNavigateTab: (tab: Category) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ audit, onNavigateTab }) => {
  const { rawData, issues, categoryScores } = audit;
  const criticalAndWarnings = issues.filter(i => i.severity !== 'passed');

  const categoriesList: Array<{ id: Category; label: string; icon: React.ReactNode }> = [
    { id: 'meta', label: 'Meta Tags', icon: <FileText className="w-4 h-4 text-indigo-400" /> },
    { id: 'headings', label: 'Heading Structure', icon: <Layers className="w-4 h-4 text-sky-400" /> },
    { id: 'images', label: 'Image SEO', icon: <ImageIcon className="w-4 h-4 text-emerald-400" /> },
    { id: 'links', label: 'Links Quality', icon: <Link2 className="w-4 h-4 text-amber-400" /> },
    { id: 'social', label: 'Social & OG', icon: <Share2 className="w-4 h-4 text-purple-400" /> },
    { id: 'technical', label: 'Technical SEO', icon: <ShieldCheck className="w-4 h-4 text-teal-400" /> },
    { id: 'schema', label: 'Structured Data', icon: <Braces className="w-4 h-4 text-rose-400" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Page Summary Card */}
      <div className="p-3.5 bg-[#111827] rounded-lg border border-[#1F2937] space-y-2.5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Inspected Page</span>
            <h2 className="text-sm font-semibold text-white leading-snug break-words">
              {rawData.meta.title || '(No Title Specified)'}
            </h2>
            <a 
              href={rawData.url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs text-gray-400 hover:text-indigo-300 truncate flex items-center space-x-1"
            >
              <span className="truncate">{rawData.url}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1F2937] text-xs">
          <div>
            <span className="text-gray-500 block text-[11px]">Canonical URL:</span>
            <span className="text-gray-300 truncate block" title={rawData.meta.canonicalUrl || 'None'}>
              {rawData.meta.canonicalUrl || 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">Robots Directive:</span>
            <span className="text-gray-300 truncate block">
              {rawData.meta.robots || 'index, follow (Default)'}
            </span>
          </div>
        </div>
      </div>

      {/* Category Health Grid */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
          <span>Audit Categories</span>
          <span className="text-[11px] text-gray-500 font-normal">Click category to inspect</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {categoriesList.map((cat) => {
            const score = categoryScores[cat.id]?.percentage ?? 100;
            return (
              <button
                key={cat.id}
                onClick={() => onNavigateTab(cat.id)}
                className="p-2.5 rounded-lg bg-[#111827] border border-[#1F2937] hover:border-indigo-500/50 flex items-center justify-between transition-all text-left group"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded bg-[#1F2937] group-hover:bg-indigo-950/30">
                    {cat.icon}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-200 group-hover:text-white">
                      {cat.label}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  score >= 85 ? 'bg-emerald-500/10 text-emerald-400' :
                  score >= 60 ? 'bg-amber-500/10 text-amber-400' :
                  'bg-rose-500/10 text-rose-400'
                }`}>
                  {score}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actionable Recommendations List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Issues Requiring Attention ({criticalAndWarnings.length})</span>
          </div>
        </div>

        {criticalAndWarnings.length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
            <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
            <div className="text-xs font-semibold text-emerald-300">Outstanding! No Critical SEO Issues Found</div>
            <p className="text-[11px] text-emerald-400/80">Your webpage passes all essential technical SEO checks.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {criticalAndWarnings.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
