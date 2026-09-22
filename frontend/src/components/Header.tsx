import React from 'react';
import { Shield, RotateCcw } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const Header: React.FC = () => {
  const { resetScan, isScanning } = useScanContext();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyber-border bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-black text-white shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-tight text-black font-sans flex items-center">
                KAVACH<span className="text-zinc-500">AI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-zinc-100 text-black border border-zinc-300 font-bold">
                SOC DEFENSE ENGINE
              </span>
            </div>
            <p className="text-xs text-zinc-500 hidden sm:block font-mono">
              Single-Page Threat Inspector &amp; Phishing Countermeasure Suite
            </p>
          </div>
        </div>

        {/* Right: Engine Status & Reset Trigger */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-cyber-elevated border border-cyber-border text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
            </span>
            <span className="text-zinc-500 hidden md:inline">RADAR ENGINE:</span>
            <span className="text-black font-bold">ACTIVE</span>
            <span className="text-zinc-300">|</span>
            <span className="text-black font-semibold">v1.4.2</span>
          </div>

          <button
            onClick={resetScan}
            disabled={isScanning}
            title="Reset Threat Telemetry"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-600 hover:text-black border border-zinc-300 text-xs font-medium transition-all shadow-sm disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-zinc-500 ${isScanning ? 'animate-spin text-black' : ''}`} />
            <span className="hidden sm:inline">Reset Console</span>
          </button>
        </div>
      </div>
    </header>
  );
};
