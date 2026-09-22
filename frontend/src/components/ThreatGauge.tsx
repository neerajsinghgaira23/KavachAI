import React, { useEffect, useState } from 'react';
import { ShieldCheck, Radio } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const ThreatGauge: React.FC = () => {
  const { currentScan, isScanning, scanStep } = useScanContext();
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const targetScore = currentScan ? currentScan.threat_score : 0;

  useEffect(() => {
    if (!currentScan) { setAnimatedScore(0); return; }
    let current = 0;
    const step = Math.max(1, Math.ceil(targetScore / 30));
    const timer = setInterval(() => {
      current += step;
      if (current >= targetScore) { setAnimatedScore(targetScore); clearInterval(timer); }
      else setAnimatedScore(current);
    }, 20);
    return () => clearInterval(timer);
  }, [currentScan, targetScore]);

  const radius = 85;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getTierStyle = (s: number) => {
    if (s >= 70) {
      return {
        badgeClass: 'bg-black text-white border border-black shadow-sm',
        dotClass: 'bg-white',
        label: 'CRITICAL THREAT',
      };
    }
    if (s >= 30) {
      return {
        badgeClass: 'bg-zinc-100 text-zinc-900 border border-zinc-400',
        dotClass: 'bg-zinc-800',
        label: 'ELEVATED RISK',
      };
    }
    return {
      badgeClass: 'bg-zinc-50 text-zinc-700 border border-zinc-200',
      dotClass: 'bg-zinc-500',
      label: 'SAFE VERIFIED',
    };
  };

  if (isScanning) {
    return (
      <div className="relative p-6 rounded-3xl bg-white border border-cyber-border shadow-card overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border border-zinc-300 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-black animate-spin" />
          <div className="relative p-3 rounded-full bg-zinc-100 border border-zinc-300 shadow-sm">
            <Radio className="w-5 h-5 text-black animate-pulse" />
          </div>
        </div>
        <p className="text-sm font-bold text-black font-mono tracking-wider text-center uppercase">FORENSIC THREAT TELEMETRY INGESTION</p>
        <p className="text-xs text-zinc-500 mt-1 font-mono text-center">
          {scanStep === 1 && '[1/3] Extracting text streams & sanitizing payload...'}
          {scanStep === 2 && '[2/3] Querying RDAP registry & evaluating heuristic rules...'}
          {scanStep === 3 && '[3/3] Synthesizing dynamic 0–100% Scam Threat Index...'}
        </p>
      </div>
    );
  }

  if (!currentScan) {
    return (
      <div className="relative p-6 rounded-3xl bg-white border border-cyber-border shadow-card flex flex-col items-center justify-center min-h-[200px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-cyber-elevated border border-cyber-border flex items-center justify-center mb-3">
          <ShieldCheck className="w-7 h-7 text-zinc-400" />
        </div>
        <h3 className="text-sm font-bold text-black uppercase tracking-wider font-mono">THREAT TELEMETRY STANDBY</h3>
        <p className="text-xs text-zinc-500 max-w-sm mt-1.5 leading-relaxed">
          Select a 1-click preset or input suspicious letters, agreements, or URLs to compute the dynamic Scam Threat Index.
        </p>
      </div>
    );
  }

  const tier = getTierStyle(targetScore);

  return (
    <div className="relative p-6 rounded-3xl bg-white border border-cyber-border shadow-card overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* SVG Arc Gauge */}
        <div className="relative flex flex-col items-center shrink-0">
          <svg className="w-52 h-32" viewBox="0 0 220 130">
            <defs>
              <linearGradient id="monoDialGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#71717a" />
                <stop offset="50%" stopColor="#27272a" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>
            </defs>
            {/* Track */}
            <path d="M 25 110 A 85 85 0 0 1 195 110" fill="none" stroke="#e4e4e7" strokeWidth="13" strokeLinecap="round" />
            {/* Active Arc */}
            <path
              d="M 25 110 A 85 85 0 0 1 195 110"
              fill="none"
              stroke="url(#monoDialGrad)"
              strokeWidth="13"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute bottom-2 text-center">
            <div className="flex items-baseline justify-center font-extrabold">
              <span className="text-4xl sm:text-5xl text-black font-mono tracking-tight">{animatedScore}</span>
              <span className="text-lg text-zinc-400 font-mono ml-0.5">%</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block -mt-1 font-semibold">
              SCAM THREAT INDEX
            </span>
          </div>
        </div>

        {/* Verdict */}
        <div className="flex-1 text-center sm:text-left space-y-2.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 ${tier.badgeClass}`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${tier.dotClass}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${tier.dotClass}`} />
              </span>
              {currentScan.verdict.replace('_', ' ')}
            </span>
            <span className="text-xs text-zinc-400 font-mono">ID: {currentScan.scan_id}</span>
          </div>
          <h4 className="text-base sm:text-lg font-extrabold text-black tracking-tight">{currentScan.verdict_label}</h4>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-xl">{currentScan.executive_summary}</p>
        </div>
      </div>
    </div>
  );
};
