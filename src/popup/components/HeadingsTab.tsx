import React from 'react';
import { AuditResult } from '../../types/seo';
import { IssueCard } from './IssueCard';
import { Layers } from 'lucide-react';

interface HeadingsTabProps {
  audit: AuditResult;
}

export const HeadingsTab: React.FC<HeadingsTabProps> = ({ audit }) => {
  const { rawData, issues } = audit;
  const headings = rawData.headings;
  const headingIssues = issues.filter((i) => i.category === 'headings');

  const countBadges = [
    { label: 'H1', count: headings.h1Count, highlight: headings.h1Count !== 1 },
    { label: 'H2', count: headings.h2Count, highlight: false },
    { label: 'H3', count: headings.h3Count, highlight: false },
    { label: 'H4', count: headings.h4Count, highlight: false },
    { label: 'H5', count: headings.h5Count, highlight: false },
    { label: 'H6', count: headings.h6Count, highlight: false },
  ];

  return (
    <div className="space-y-4">
      {/* Heading counts overview */}
      <div className="bg-[#111827] rounded-lg border border-[#1F2937] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Heading Frequency</span>
          </div>
          <span className="text-[11px] text-gray-400">Total: {headings.items.length} headings</span>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {countBadges.map((b) => (
            <div 
              key={b.label}
              className={`p-2 rounded flex flex-col items-center border ${
                b.highlight 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                  : 'bg-[#0B0F19] border-gray-800 text-gray-300'
              }`}
            >
              <span className="text-[10px] font-bold">{b.label}</span>
              <span className="text-sm font-semibold mt-0.5">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Headings Hierarchy Tree */}
      <div className="bg-[#111827] rounded-lg border border-[#1F2937] p-3.5 space-y-2.5">
        <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Heading Structure Tree
        </div>

        {headings.items.length === 0 ? (
          <div className="text-xs text-gray-400 italic text-center py-4">
            No headings (H1–H6) detected on this page.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {headings.items.map((item, idx) => {
              const indent = (item.level - 1) * 12;
              return (
                <div 
                  key={idx}
                  style={{ marginLeft: `${indent}px` }}
                  className="flex items-center space-x-2 text-xs py-1 px-2 rounded bg-[#0B0F19] border border-gray-800/80"
                >
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    item.level === 1 ? 'bg-indigo-600 text-white' :
                    item.level === 2 ? 'bg-sky-600/30 text-sky-300 border border-sky-500/30' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    H{item.level}
                  </span>
                  <span className={`truncate ${item.text ? 'text-gray-200' : 'text-rose-400 italic'}`}>
                    {item.text || '[Empty Heading Tag]'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Heading Audit Issues */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Audit Checks ({headingIssues.length})
        </h3>
        {headingIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};
