import React from 'react';
import { AuditResult } from '../../types/seo';
import { IssueCard } from './IssueCard';
import { Braces, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

interface SchemaTabProps {
  audit: AuditResult;
}

export const SchemaTab: React.FC<SchemaTabProps> = ({ audit }) => {
  const { rawData, issues } = audit;
  const schema = rawData.schema;
  const schemaIssues = issues.filter((i) => i.category === 'schema');

  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (raw: string, index: number) => {
    navigator.clipboard.writeText(raw);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header and Detected Schema Types */}
      <div className="bg-[#111827] rounded-lg border border-[#1F2937] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <Braces className="w-4 h-4" />
            <span>Structured Data (JSON-LD)</span>
          </div>
          <span className="text-[11px] text-gray-400">Total Blocks: {schema.total}</span>
        </div>

        {schema.detectedTypes.length > 0 ? (
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold block mb-1">
              Detected Schema.org Entities:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {schema.detectedTypes.map((t, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic text-center py-2">
            No JSON-LD structured data detected on this page.
          </div>
        )}
      </div>

      {/* Raw Schema Blocks */}
      {schema.items.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Schema Code Blocks
          </h3>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {schema.items.map((item, idx) => (
              <div 
                key={idx}
                className="bg-[#111827] border border-[#1F2937] rounded-lg p-2.5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    {item.valid ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span className="font-semibold text-white">
                      {Array.isArray(item.type) ? item.type.join(', ') : item.type}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(item.raw, idx)}
                    className="p-1 rounded bg-[#1F2937] hover:bg-gray-700 text-gray-400 hover:text-white transition-all flex items-center space-x-1 text-[10px]"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {item.error && (
                  <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 text-[11px] font-mono border border-rose-500/20">
                    Syntax Error: {item.error}
                  </div>
                )}

                <pre className="p-2 rounded bg-[#0B0F19] text-[10px] text-gray-300 font-mono overflow-x-auto max-h-[100px] border border-gray-800">
                  {item.raw}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Issues */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Audit Checks ({schemaIssues.length})
        </h3>
        {schemaIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
};

