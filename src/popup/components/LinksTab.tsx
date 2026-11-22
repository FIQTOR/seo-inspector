import React, { useState } from 'react';
import { AuditResult } from '../../types/seo';
import { IssueCard } from './IssueCard';
import { Link2, ExternalLink } from 'lucide-react';

interface LinksTabProps {
  audit: AuditResult;
}

export const LinksTab: React.FC<LinksTabProps> = ({ audit }) => {
  const { rawData, issues } = audit;
  const links = rawData.links;
  const linkIssues = issues.filter((i) => i.category === 'links');

  const [activeFilter, setActiveFilter] = useState<'all' | 'internal' | 'external' | 'empty'>('all');

  const filteredLinks = links.items.filter((l) => {
    if (activeFilter === 'internal') return l.isInternal;
    if (activeFilter === 'external') return !l.isInternal;
    if (activeFilter === 'empty') return l.isEmptyText || l.isGenericText;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-center">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total</span>
          <span className="text-base font-bold text-white">{links.total}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-center">
          <span className="text-[10px] text-sky-400 uppercase font-semibold block">Internal</span>
          <span className="text-base font-bold text-sky-400">{links.internalCount}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-center">
          <span className="text-[10px] text-indigo-400 uppercase font-semibold block">External</span>
          <span className="text-base font-bold text-indigo-400">{links.externalCount}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-center">
          <span className="text-[10px] text-amber-400 uppercase font-semibold block">Nofollow</span>
          <span className="text-base font-bold text-amber-400">{links.nofollowCount}</span>
        </div>
      </div>

      {/* Links List */}
      <div className="bg-[#111827] rounded-lg border border-[#1F2937] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Link2 className="w-4 h-4" />
            <span>Inspected Links ({filteredLinks.length})</span>
          </div>

          <div className="flex space-x-1">
            {(['all', 'internal', 'external', 'empty'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveFilter(mode)}
                className={`text-[10px] capitalize px-2 py-0.5 rounded border transition-all ${
                  activeFilter === mode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#1F2937] text-gray-400 border-gray-700 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="text-xs text-gray-400 italic text-center py-4">
            No links matching selected filter.
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {filteredLinks.map((item, idx) => (
              <div 
                key={idx}
                className="p-2.5 rounded bg-[#0B0F19] border border-gray-800 space-y-1.5 text-xs"
              >
                <div className="flex items-start justify-between">
                  <span className={`font-medium ${
                    item.isEmptyText ? 'text-rose-400 italic' :
                    item.isGenericText ? 'text-amber-400' :
                    'text-gray-200'
                  }`}>
                    {item.text || '[No Anchor Text]'}
                  </span>
                  <div className="flex space-x-1 shrink-0">
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      item.isInternal ? 'bg-sky-500/10 text-sky-400' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {item.isInternal ? 'Internal' : 'External'}
                    </span>
                    {item.hasNofollow && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                        nofollow
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-gray-400 truncate flex items-center space-x-1" title={item.href}>
                  <span className="truncate">{item.href}</span>
                  <a href={item.href} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-indigo-400">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Issues */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Audit Checks ({linkIssues.length})
        </h3>
        {linkIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};
