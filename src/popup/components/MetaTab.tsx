import React from 'react';
import { AuditResult } from '../../types/seo';
import { IssueCard } from './IssueCard';
import { FileText } from 'lucide-react';

interface MetaTabProps {
  audit: AuditResult;
}

export const MetaTab: React.FC<MetaTabProps> = ({ audit }) => {
  const { rawData, issues } = audit;
  const meta = rawData.meta;
  const metaIssues = issues.filter((i) => i.category === 'meta');

  return (
    <div className="space-y-4">
      {/* Meta Values Table/Cards */}
      <div className="bg-[#111827] rounded-lg border border-[#1F2937] p-3.5 space-y-3">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>Extracted Meta Tags</span>
        </div>

        {/* Title */}
        <div className="p-2.5 rounded bg-[#0B0F19] border border-gray-800 space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-gray-400 font-medium">Page Title (&lt;title&gt;)</span>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
              meta.titleLength >= 30 && meta.titleLength <= 60
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-amber-500/10 text-amber-400'
            }`}>
              {meta.titleLength} chars (Recommended: 30–60)
            </span>
          </div>
          <div className="text-xs text-white font-medium select-text">
            {meta.title || <span className="text-rose-400 italic">No Title Found</span>}
          </div>
        </div>

        {/* Meta Description */}
        <div className="p-2.5 rounded bg-[#0B0F19] border border-gray-800 space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-gray-400 font-medium">Meta Description</span>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
              meta.descriptionLength >= 120 && meta.descriptionLength <= 160
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-amber-500/10 text-amber-400'
            }`}>
              {meta.descriptionLength} chars (Recommended: 120–160)
            </span>
          </div>
          <div className="text-xs text-gray-300 select-text leading-relaxed">
            {meta.description || <span className="text-rose-400 italic">No Meta Description Found</span>}
          </div>
        </div>

        {/* Other Meta items */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-[#0B0F19] border border-gray-800">
            <span className="text-gray-500 text-[10px] block">Canonical URL</span>
            <span className="text-gray-300 font-mono text-[11px] truncate block" title={meta.canonicalUrl || 'None'}>
              {meta.canonicalUrl || 'Missing'}
            </span>
          </div>
          <div className="p-2 rounded bg-[#0B0F19] border border-gray-800">
            <span className="text-gray-500 text-[10px] block">Robots Directives</span>
            <span className="text-gray-300 font-mono text-[11px] truncate block">
              {meta.robots || 'index, follow (Default)'}
            </span>
          </div>
          <div className="p-2 rounded bg-[#0B0F19] border border-gray-800">
            <span className="text-gray-500 text-[10px] block">HTML Language (lang)</span>
            <span className="text-gray-300 font-mono text-[11px] block">
              {meta.language || 'Missing'}
            </span>
          </div>
          <div className="p-2 rounded bg-[#0B0F19] border border-gray-800">
            <span className="text-gray-500 text-[10px] block">Charset / Encoding</span>
            <span className="text-gray-300 font-mono text-[11px] block">
              {meta.charset || 'Missing'}
            </span>
          </div>
        </div>
      </div>

      {/* Issues & Checks */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Audit Checks ({metaIssues.length})
        </h3>
        {metaIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};
