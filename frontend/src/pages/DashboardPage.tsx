import React, { useState } from 'react';
import {
  Shield, RotateCcw, Terminal, Cpu, Download,
  Radio, FileCode, MessageSquare, Brain,
} from 'lucide-react';
import { useScanContext } from '../context/ScanContext';
import { useAuth } from '../context/AuthContext';
import { InputForm } from '../components/InputForm';
import { ThreatGauge } from '../components/ThreatGauge';
import { ThreatBreakdown } from '../components/ThreatBreakdown';
import { DomainCard } from '../components/DomainCard';
import { TextHighlighter } from '../components/TextHighlighter';
import { FlagsList } from '../components/FlagsList';
import { SafeReplyModal } from '../components/SafeReplyModal';
import { AIDetectorModule } from '../components/AIDetectorModule';
import { ThreatRadarView } from '../components/ThreatRadarView';
import { VerificationLabView } from '../components/VerificationLabView';
import { AuditReportView } from '../components/AuditReportView';
import { downloadAuditReport } from '../services/api';

type ActiveModule = 'scanner' | 'ai_detector' | 'radar' | 'challenge' | 'report';

interface ModuleTab {
  id: ActiveModule;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

const MODULES: ModuleTab[] = [
  { id: 'scanner',     label: 'Threat Scanner',         shortLabel: 'Scanner',   icon: <Shield className="w-3.5 h-3.5" /> },
  { id: 'ai_detector', label: 'AI Synthetic Detector',  shortLabel: 'AI Detect', icon: <Brain className="w-3.5 h-3.5" /> },
  { id: 'radar',       label: 'Scam Radar & Simulator', shortLabel: 'Radar',     icon: <Radio className="w-3.5 h-3.5" /> },
  { id: 'challenge',   label: 'Challenge Lab',          shortLabel: 'Challenge', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { id: 'report',      label: 'Audit Report & IOCs',    shortLabel: 'Report',    icon: <FileCode className="w-3.5 h-3.5" /> },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { currentScan, resetScan } = useScanContext();
  const [activeModule, setActiveModule] = useState<ActiveModule>('scanner');

  return (
    <div className="space-y-6 pb-12">
      {/* ── Session Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-3xl bg-white border border-cyber-border shadow-card gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-black font-mono">SOC THREAT CONSOLE</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 text-black border border-zinc-300 font-bold">
                ● ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Analyst: <strong className="text-black">{user?.name || 'Guest Analyst'}</strong>{' '}
              <span className="text-zinc-400">({user?.role || 'Cyber Investigator'})</span>
            </p>
          </div>
        </div>

        {/* Module Tabs (Monochrome) */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-cyber-elevated border border-cyber-border overflow-x-auto w-full sm:w-auto">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              title={mod.label}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeModule === mod.id
                  ? 'bg-black text-white shadow-sm font-bold'
                  : 'text-zinc-600 hover:text-black hover:bg-white'
              }`}
            >
              {mod.icon}
              <span className="hidden lg:inline">{mod.label}</span>
              <span className="lg:hidden">{mod.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MODULE 1: THREAT SCANNER ───────────────────── */}
      {activeModule === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Input */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-black" /> Threat Ingestion Console
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">[INPUT BUFFER]</span>
            </div>
            <InputForm />
          </div>

          {/* Right: Forensic Telemetry */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-black" /> Live Defense Telemetry
              </span>
              {currentScan && (
                <div className="flex items-center gap-2">
                  <button onClick={() => downloadAuditReport(currentScan, 'json')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-[11px] font-mono font-bold transition-all shadow-sm">
                    <Download className="w-3 h-3" /> Export
                  </button>
                  <button onClick={resetScan}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 hover:text-black text-[11px] font-mono border border-zinc-300 transition-colors">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
              )}
            </div>
            <ThreatGauge />
            <ThreatBreakdown />
            <DomainCard />
            <TextHighlighter />
            <FlagsList />
          </div>
        </div>
      )}

      {/* ── MODULE 2: AI DETECTOR ──────────────────────── */}
      {activeModule === 'ai_detector' && <AIDetectorModule />}

      {/* ── MODULE 3: SCAM RADAR ───────────────────────── */}
      {activeModule === 'radar' && <ThreatRadarView />}

      {/* ── MODULE 4: CHALLENGE LAB ────────────────────── */}
      {activeModule === 'challenge' && <VerificationLabView />}

      {/* ── MODULE 5: AUDIT REPORT ─────────────────────── */}
      {activeModule === 'report' && (
        <AuditReportView onGoToScanner={() => setActiveModule('scanner')} />
      )}

      <SafeReplyModal />
    </div>
  );
};
