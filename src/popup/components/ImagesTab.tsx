import React, { useState } from 'react';
import { AuditResult } from '../../types/seo';
import { IssueCard } from './IssueCard';
import { Image as ImageIcon, Filter } from 'lucide-react';

interface ImagesTabProps {
  audit: AuditResult;
}

export const ImagesTab: React.FC<ImagesTabProps> = ({ audit }) => {
  const { rawData, issues } = audit;
  const images = rawData.images;
  const imageIssues = issues.filter((i) => i.category === 'images');

  const [filterMissingAltOnly, setFilterMissingAltOnly] = useState(false);

  const displayedImages = filterMissingAltOnly 
    ? images.items.filter(i => !i.hasAlt)
    : images.items;

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-center">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total</span>
          <span className="text-base font-bold text-white">{images.total}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-center">
          <span className="text-[10px] text-emerald-400 uppercase font-semibold block">With Alt</span>
          <span className="text-base font-bold text-emerald-400">{images.withAlt}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-center">
          <span className="text-[10px] text-rose-400 uppercase font-semibold block">Missing Alt</span>
          <span className="text-base font-bold text-rose-400">{images.missingAlt}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-center">
          <span className="text-[10px] text-indigo-400 uppercase font-semibold block">Alt Ratio</span>
          <span className="text-base font-bold text-indigo-400">{images.altPercentage}%</span>
        </div>
      </div>

      {/* Image list */}
      <div className="bg-[#111827] rounded-lg border border-[#1F2937] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ImageIcon className="w-4 h-4" />
            <span>Page Images ({displayedImages.length})</span>
          </div>
          <button
            onClick={() => setFilterMissingAltOnly(!filterMissingAltOnly)}
            className={`text-[11px] px-2 py-0.5 rounded border transition-all flex items-center space-x-1 ${
              filterMissingAltOnly 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                : 'bg-[#1F2937] text-gray-400 border-gray-700 hover:text-white'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Missing Alt Only</span>
          </button>
        </div>

        {images.items.length === 0 ? (
          <div className="text-xs text-gray-400 italic text-center py-4">
            No images detected on this page.
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {displayedImages.map((img, idx) => (
              <div 
                key={idx}
                className="p-2.5 rounded bg-[#0B0F19] border border-gray-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-[10px] truncate max-w-[320px] font-mono" title={img.src}>
                    {img.src.split('/').pop() || img.src}
                  </span>
                  <div className="flex items-center space-x-1">
                    {img.format && (
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-gray-800 text-gray-300">
                        {img.format}
                      </span>
                    )}
                    {img.hasAlt ? (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Alt OK
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Missing Alt
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-gray-200 text-[11px]">
                  <span className="text-gray-500">Alt text: </span>
                  {img.hasAlt ? (
                    img.alt === '' ? (
                      <span className="text-amber-400 italic">alt="" (Decorative Image)</span>
                    ) : (
                      <span className="font-medium text-gray-200">"{img.alt}"</span>
                    )
                  ) : (
                    <span className="text-rose-400 italic">No alt attribute declared</span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-[10px] text-gray-400">
                  <span>Size: {img.width || '?'} × {img.height || '?'} px</span>
                  <span>Loading: {img.loading || 'eager'}</span>
                  {!img.hasDimensions && (
                    <span className="text-amber-400">No explicit width/height</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Issues */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Audit Checks ({imageIssues.length})
        </h3>
        {imageIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};
