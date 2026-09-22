import React, { useState } from 'react';
import { ShieldAlert, Download, MessageSquare, Check } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';
import { downloadAuditReport } from '../services/api';

export const FlagsList: React.FC = () => {
  const { currentScan, setIsSafeReplyOpen } = useScanContext();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  if (!currentScan) return null;

  const flags = currentScan.flags || [];
  const handleExport = (format: 'json' | 'txt') => {
    downloadAuditReport(currentScan, format);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="p-5 rounded-3xl bg-white border border-cyber-border shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-cyber-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-black" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-black font-mono">
            Triggered Red-Flag Alert Cards ({flags.length})
          </h4>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono">[FORENSIC EVIDENCE]</span>
      </div>

      {flags.length === 0 ? (
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
          <p className="text-xs text-black font-semibold font-mono">
            [VERIFIED CLEAN] No critical advance-fee, payment, or rental fraud flags detected.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {flags.map((flag) => {
            const isCritical = flag.severity === 'CRITICAL';
            return (
              <div
                key={flag.id}
                className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-white hover:border-black transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
                        isCritical
                          ? 'bg-black text-white'
                          : 'bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {flag.severity}
                    </span>
                    <span className="text-xs font-bold text-black">{flag.title}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-black shrink-0">
                    +{flag.weight} pts
                  </span>
                </div>
                <div className="text-xs font-mono p-2.5 rounded-xl bg-white border border-zinc-200 text-black break-all">
                  "{flag.matched_text}"
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
                  <strong className="text-black font-semibold">Defense Advice: </strong>{flag.recommendation}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Bar */}
      <div className="pt-3 border-t border-cyber-border flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setIsSafeReplyOpen(true)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold tracking-wide transition-all shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>GENERATE SAFE REPLY TEMPLATE</span>
        </button>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleExport('json')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-black border border-zinc-300 text-xs font-bold font-mono transition-colors shadow-sm"
          >
            {downloadSuccess ? <Check className="w-3.5 h-3.5 text-black" /> : <Download className="w-3.5 h-3.5 text-black" />}
            <span>{downloadSuccess ? 'EXPORTED' : 'EXPORT JSON'}</span>
          </button>
          <button
            onClick={() => handleExport('txt')}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 text-xs font-mono font-bold transition-colors"
          >
            TXT
          </button>
        </div>
      </div>
    </div>
  );
};
