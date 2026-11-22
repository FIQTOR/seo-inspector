import React from 'react';
import { AuditResult } from '../../types/seo';
import { IssueCard } from './IssueCard';
import { Share2, Image as ImageIcon } from 'lucide-react';

interface SocialTabProps {
  audit: AuditResult;
}

export const SocialTab: React.FC<SocialTabProps> = ({ audit }) => {
  const { rawData, issues } = audit;
  const social = rawData.social;
  const socialIssues = issues.filter((i) => i.category === 'social');

  return (
    <div className="space-y-4">
      {/* Social Card Preview */}
      <div className="bg-[#111827] rounded-lg border border-[#1F2937] p-3.5 space-y-3">
        <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
          <Share2 className="w-4 h-4" />
          <span>Social Media Card Preview</span>
        </div>

        {/* Facebook/LinkedIn Card Simulation */}
        <div className="max-w-[420px] mx-auto rounded-lg overflow-hidden border border-gray-700 bg-[#0B0F19] shadow-lg">
          {/* Card Image */}
          <div className="w-full h-40 bg-gray-900 flex items-center justify-center relative overflow-hidden">
            {social.ogImage ? (
              <img 
                src={social.ogImage} 
                alt="Social preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 space-y-1">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span className="text-[11px]">No og:image declared</span>
              </div>
            )}
          </div>

          {/* Card Meta Content */}
          <div className="p-3 space-y-1 border-t border-gray-800">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block truncate">
              {social.ogSiteName || rawData.technical.hostname}
            </span>
            <h4 className="text-xs font-bold text-white line-clamp-1">
              {social.ogTitle || rawData.meta.title || 'Untitled Page'}
            </h4>
            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
              {social.ogDescription || rawData.meta.description || 'No description found.'}
            </p>
          </div>
        </div>

        {/* Key Extracted Social Tags */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2 rounded bg-[#0B0F19] border border-gray-800">
            <span className="text-gray-500 text-[10px] block">Open Graph Type</span>
            <span className="text-gray-300 font-mono text-[11px]">{social.ogType || 'Missing'}</span>
          </div>
          <div className="p-2 rounded bg-[#0B0F19] border border-gray-800">
            <span className="text-gray-500 text-[10px] block">Twitter Card Type</span>
            <span className="text-gray-300 font-mono text-[11px]">{social.twitterCard || 'Missing'}</span>
          </div>
        </div>
      </div>

      {/* Audit Issues */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Audit Checks ({socialIssues.length})
        </h3>
        {socialIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};
