import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Printer } from 'lucide-react';
import { AuditResult } from '../../types/seo';
import { exportAsJSON, exportAsCSV, exportAsHTML } from '../../utils/export';

interface FooterProps {
  audit: AuditResult | null;
}

export const Footer: React.FC<FooterProps> = ({ audit }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <footer className="px-4 py-2.5 bg-[#111827] border-t border-[#1F2937] flex items-center justify-between relative">
      <div className="text-[11px] text-gray-500">
        Local & Private • Manifest V3
      </div>

      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={!audit}
          className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-50 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>

        {showExportMenu && audit && (
          <div 
            className="absolute right-0 bottom-full mb-2 w-48 rounded-lg bg-[#111827] border border-gray-700 shadow-xl p-1.5 z-50 space-y-1"
            onMouseLeave={() => setShowExportMenu(false)}
          >
            <button
              onClick={() => {
                exportAsJSON(audit);
                setShowExportMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded text-xs text-gray-200 hover:bg-[#1F2937] flex items-center space-x-2 transition-all"
            >
              <FileJson className="w-4 h-4 text-amber-400" />
              <span>Export as JSON</span>
            </button>

            <button
              onClick={() => {
                exportAsCSV(audit);
                setShowExportMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded text-xs text-gray-200 hover:bg-[#1F2937] flex items-center space-x-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export as CSV</span>
            </button>

            <button
              onClick={() => {
                exportAsHTML(audit);
                setShowExportMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded text-xs text-gray-200 hover:bg-[#1F2937] flex items-center space-x-2 transition-all"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Printable HTML Report</span>
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};

