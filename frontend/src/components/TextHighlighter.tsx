import React, { useState } from 'react';
import { Eye, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const TextHighlighter: React.FC = () => {
  const { currentScan } = useScanContext();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (!currentScan || !currentScan.raw_content) return null;

  const rawText = currentScan.raw_content;
  const flags = currentScan.flags || [];

  // Sort flags by length descending
  const sortedFlags = [...flags].sort((a, b) => b.matched_text.length - a.matched_text.length);

  const renderContent = () => {
    if (sortedFlags.length === 0) {
      return <span className="text-black">{rawText}</span>;
    }

    const phrases = sortedFlags
      .map((f) => f.matched_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .filter(Boolean);

    if (phrases.length === 0) {
      return <span className="text-black">{rawText}</span>;
    }

    const regex = new RegExp(`(${phrases.join('|')})`, 'gi');
    const segments = rawText.split(regex);

    return segments.map((seg, idx) => {
      const matchFlag = sortedFlags.find(
        (f) => f.matched_text.toLowerCase() === seg.toLowerCase()
      );

      if (matchFlag) {
        const isCritical = matchFlag.severity === 'CRITICAL';
        return (
          <span
            key={idx}
            onMouseEnter={() => setActiveTooltip(matchFlag.id)}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative inline-block cursor-help font-bold px-1.5 py-0.5 rounded transition-all ${
              isCritical
                ? 'bg-zinc-200 text-black border-b-2 border-black hover:bg-black hover:text-white'
                : 'bg-zinc-100 text-zinc-800 border-b-2 border-zinc-400 hover:bg-zinc-300'
            }`}
          >
            {seg}

            {activeTooltip === matchFlag.id && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3.5 rounded-2xl bg-white border border-zinc-300 shadow-2xl text-[11px] text-black z-50 pointer-events-none leading-snug">
                <span className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase mb-1">
                  {isCritical ? (
                    <span className="text-black flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> [CRITICAL: +{matchFlag.weight} pts]
                    </span>
                  ) : (
                    <span className="text-zinc-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> [RISK: +{matchFlag.weight} pts]
                    </span>
                  )}
                </span>
                <span className="font-bold block text-black">{matchFlag.title}</span>
                <span className="text-[11px] text-zinc-600 mt-1 block">{matchFlag.recommendation}</span>
              </span>
            )}
          </span>
        );
      }

      return <span key={idx} className="text-black">{seg}</span>;
    });
  };

  return (
    <div className="p-5 rounded-3xl bg-white border border-cyber-border shadow-card space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyber-border pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-black" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-black font-mono">
            Verbatim Forensic Annotations &amp; Red-Flag Highlighting
          </h4>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 font-bold text-black">
            <span className="w-2 h-2 rounded-full bg-black" /> [CRITICAL TRIGGER]
          </span>
          <span className="flex items-center gap-1 font-medium text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-zinc-400" /> [RISK INDICATOR]
          </span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-cyber-elevated border border-cyber-border font-mono text-xs leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap text-black selection:bg-black selection:text-white">
        {renderContent()}
      </div>
    </div>
  );
};
