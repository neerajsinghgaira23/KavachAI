import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const SafeReplyModal: React.FC = () => {
  const { isSafeReplyOpen, setIsSafeReplyOpen, currentScan } = useScanContext();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);

  if (!isSafeReplyOpen || !currentScan) return null;

  const replies = currentScan.safe_replies || [];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const currentReply = replies[activeTabIdx] || replies[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-cyber-border shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyber-border bg-cyber-elevated">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-black text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black font-mono tracking-wide">
                SAFE COUNTER-INQUIRY GENERATOR
              </h3>
              <p className="text-xs text-zinc-500">
                Challenge unverified recruiters or landlords without risking personal or financial information.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSafeReplyOpen(false)}
            className="p-2 rounded-xl hover:bg-zinc-200 text-zinc-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector Tabs */}
        {replies.length > 1 && (
          <div className="flex border-b border-cyber-border bg-white px-5 pt-3 space-x-2 overflow-x-auto">
            {replies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTabIdx(idx)}
                className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTabIdx === idx
                    ? 'border-black text-black font-bold'
                    : 'border-transparent text-zinc-500 hover:text-black'
                }`}
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {currentReply ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
                  Ready-to-Send Protective Template:
                </span>
                <span className="text-[11px] text-black font-mono flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> [100% PROTECTIVE]
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-cyber-elevated border border-cyber-border text-black font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-black selection:text-white">
                {currentReply.content}
              </div>

              <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-300 text-xs text-black leading-relaxed">
                💡 <strong className="font-bold">Cybersecurity Tactical Rationale:</strong> Legitimate enterprise talent acquisition leads will verify via corporate email servers and provide directory extensions. Fraudulent scammers will either cut contact or produce evasive excuses.
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">No safe replies generated for this scan type.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-cyber-border bg-cyber-elevated">
          <button
            onClick={() => setIsSafeReplyOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-black hover:bg-zinc-200 transition-colors"
          >
            Close
          </button>
          {currentReply && (
            <button
              onClick={() => handleCopy(currentReply.content, activeTabIdx)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs font-mono transition-all shadow-sm"
            >
              {copiedIdx === activeTabIdx ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>COPIED TO CLIPBOARD</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY TEMPLATE</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
