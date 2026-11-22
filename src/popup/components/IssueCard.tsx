import React, { useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  HelpCircle,
  Wrench
} from 'lucide-react';
import { AuditIssue, Severity } from '../../types/seo';

interface IssueCardProps {
  issue: AuditIssue;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const [expanded, setExpanded] = useState(issue.severity === 'critical');

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </span>
        );
      case 'passed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Passed
          </span>
        );
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden transition-all hover:border-gray-700">
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-3.5 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          {getSeverityBadge(issue.severity)}
          <span className="text-xs font-semibold text-gray-200 truncate">
            {issue.title}
          </span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          {issue.scoreImpact > 0 && (
            <span className="text-[10px] text-rose-400 font-mono">
              -{issue.scoreImpact} pts
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-[#1F2937]/50 space-y-2.5 text-xs">
          <div>
            <div className="text-gray-300 leading-relaxed">{issue.explanation}</div>
          </div>

          <div className="p-2.5 rounded bg-[#1F2937]/50 border border-gray-800 space-y-1.5">
            <div className="flex items-start space-x-1.5 text-indigo-400 font-medium">
              <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Why it matters:</span>
            </div>
            <p className="text-gray-400 text-[11px] pl-5 leading-normal">
              {issue.whyItMatters}
            </p>

            <div className="flex items-start space-x-1.5 text-emerald-400 font-medium pt-1">
              <Wrench className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>How to fix:</span>
            </div>
            <p className="text-gray-300 text-[11px] pl-5 leading-normal">
              {issue.suggestedSolution}
            </p>
          </div>

          {issue.relevantElement && (
            <div className="p-2 rounded bg-black/40 border border-gray-800 flex items-start space-x-2 font-mono text-[11px] text-gray-300 break-all">
              <Code2 className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
              <span>{issue.relevantElement}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

