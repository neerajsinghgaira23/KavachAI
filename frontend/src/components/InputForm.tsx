import React, { useEffect } from 'react';
import { FileText, Globe, UploadCloud, Zap, Send, Trash2 } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';
import { DropzoneUploader } from './DropzoneUploader';

export const InputForm: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    inputText,
    setInputText,
    inputUrl,
    setInputUrl,
    loadSample,
    triggerScan,
    resetScan,
    isScanning,
    error,
  } = useScanContext();

  // Keyboard shortcut: Ctrl+Enter to trigger scan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isScanning) triggerScan();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScanning, triggerScan]);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  return (
    <div className="flex flex-col space-y-4">
      {/* Top 1-Click Instant Demo Attack Vector Chips */}
      <div className="p-4 rounded-xl bg-[#0f172a]/90 border border-[#1e293b] shadow-xl">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            1-Click Instant Attack Vectors
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Zero-Latency Presets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => loadSample('amazon_scam')}
            disabled={isScanning}
            className="flex flex-col text-left p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 transition-all group disabled:opacity-50"
          >
            <span className="text-xs font-semibold text-slate-200 group-hover:text-rose-400 flex items-center gap-1 truncate">
              📦 Fake AWS Job Offer
            </span>
            <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
              $450 deposit + Telegram + 92% Scam
            </span>
          </button>

          <button
            onClick={() => loadSample('rental_deposit')}
            disabled={isScanning}
            className="flex flex-col text-left p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition-all group disabled:opacity-50"
          >
            <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 flex items-center gap-1 truncate">
              🏢 Deceptive Flat Lease
            </span>
            <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
              $1,200 wire before view + 84% Scam
            </span>
          </button>

          <button
            onClick={() => loadSample('legit_offer')}
            disabled={isScanning}
            className="flex flex-col text-left p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-all group disabled:opacity-50"
          >
            <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 flex items-center gap-1 truncate">
              💼 Verified Corporate Letter
            </span>
            <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
              Zero fee + microsoft.com + 8% Safe
            </span>
          </button>
        </div>
      </div>

      {/* Main Inspection Console */}
      <div className="p-5 rounded-xl bg-[#0f172a]/90 border border-[#1e293b] shadow-2xl flex flex-col space-y-4">
        {/* Multi-Tab Selector */}
        <div className="flex items-center space-x-1 p-1 rounded-lg bg-[#020617]/80 border border-slate-800">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-xs font-semibold transition-all ${activeTab === 'text'
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Text / Letter</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-xs font-semibold transition-all ${activeTab === 'url'
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Target URL</span>
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-xs font-semibold transition-all ${activeTab === 'file'
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Document / PDF</span>
          </button>
        </div>

        {/* Tab 1: Text Inspector */}
        {activeTab === 'text' && (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <label htmlFor="text-input" className="font-semibold text-slate-300">
                Document Body / Letter Content:
              </label>
              <span>
                {charCount} chars • {wordCount} words
              </span>
            </div>
            <textarea
              id="text-input"
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste suspicious appointment letter, lease agreement, WhatsApp/Telegram offer, or recruitment message here..."
              className="w-full p-3.5 rounded-lg bg-[#020617]/70 border border-slate-700/70 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 placeholder-slate-500 text-sm font-sans leading-relaxed resize-none transition-all outline-none"
            />
          </div>
        )}

        {/* Tab 2: URL Inspector */}
        {activeTab === 'url' && (
          <div className="flex flex-col space-y-3">
            <div>
              <label htmlFor="url-input" className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Suspicious URL / Target Domain:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  id="url-input"
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://amazon-careers-verify.xyz/auth or http://..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#020617]/70 border border-slate-700/70 focus:border-cyan-400 text-slate-200 placeholder-slate-500 text-sm font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="url-context" className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Contextual Snippet (Optional):
              </label>
              <textarea
                id="url-context"
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Include any accompanying email message, text message, or instructions..."
                className="w-full p-3 rounded-lg bg-[#020617]/70 border border-slate-700/70 focus:border-cyan-400 text-slate-200 placeholder-slate-500 text-xs font-sans resize-none outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 3: File Dropzone */}
        {activeTab === 'file' && <DropzoneUploader />}

        {/* Error Notification */}
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Console Action Bar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <button
            onClick={resetScan}
            disabled={isScanning || (!inputText && !inputUrl)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/40 text-xs transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Input</span>
          </button>

          <button
            onClick={triggerScan}
            disabled={isScanning || (!inputText.trim() && !inputUrl.trim())}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.35)]"
          >
            <Send className={`w-3.5 h-3.5 ${isScanning ? 'animate-bounce' : ''}`} />
            <span>{isScanning ? 'INSPECTING TELEMETRY...' : 'SCAN & INSPECT THREAT'}</span>
            <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-black/25 text-black font-mono">
              Ctrl+↵
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
