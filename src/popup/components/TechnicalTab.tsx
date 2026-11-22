import React from 'react';
import { AuditResult } from '../../types/seo';
import { IssueCard } from './IssueCard';
import { ShieldCheck, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

interface TechnicalTabProps {
  audit: AuditResult;
}

export const TechnicalTab: React.FC<TechnicalTabProps> = ({ audit }) => {
  const { rawData, issues } = audit;
  const tech = rawData.technical;
  const techIssues = issues.filter((i) => i.category === 'technical');

  return (
    <div className="space-y-4">
      {/* Technical Parameters List */}
      <div className="bg-[#111827] rounded-lg border border-[#1F2937] p-3.5 space-y-3">
        <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Core Technical Signals</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-[#0B0F19] border border-gray-800 space-y-0.5">
            <span className="text-gray-500 text-[10px] block">Security Protocol</span>
            <span className={`font-semibold flex items-center space-x-1 ${
              tech.isHttps ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {tech.isHttps ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>{tech.isHttps ? 'HTTPS (Secure)' : 'HTTP (Insecure)'}</span>
            </span>
          </div>

          <div className="p-2 rounded bg-[#0B0F19] border border-gray-800 space-y-0.5">
            <span className="text-gray-500 text-[10px] block">Robots Directives</span>
            <span className="font-mono text-gray-200 truncate block">
              {tech.robotsMeta || 'index, follow'}
            </span>
          </div>

          <div className="p-2 rounded bg-[#0B0F19] border border-gray-800 space-y-0.5">
            <span className="text-gray-500 text-[10px] block">HTML5 Doctype</span>
            <span className={`font-semibold ${tech.doctype ? 'text-emerald-400' : 'text-amber-400'}`}>
              {tech.doctype ? 'Present (<!DOCTYPE html>)' : 'Missing'}
            </span>
          </div>

          <div className="p-2 rounded bg-[#0B0F19] border border-gray-800 space-y-0.5">
            <span className="text-gray-500 text-[10px] block">Robots.txt Location</span>
            <a 
              href={tech.robotsTxtUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-400 hover:underline truncate flex items-center space-x-1"
            >
              <span className="truncate">{tech.robotsTxtUrl}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>

        <div className="p-2 rounded bg-[#0B0F19] border border-gray-800 text-[11px] text-gray-400">
          <span className="text-indigo-400 font-semibold">Note on Indexability:</span> Detected HTML signals reflect code rendered in DOM. Live server indexing confirmation also depends on search engine crawl quotas, server HTTP response headers (e.g. X-Robots-Tag), and Search Console verification.
        </div>
      </div>

      {/* Audit Issues */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Audit Checks ({techIssues.length})
        </h3>
        {techIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};
