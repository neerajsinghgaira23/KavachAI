import React from 'react';
import { Shield, Zap, ArrowRight, ExternalLink, Lock, Globe, Cpu, FileSearch, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CyberOrb3D } from '../components/CyberOrb3D';

interface HomePageProps {
  onLaunchScanner: () => void;
  onNavigateAbout: () => void;
}

const STATS = [
  { value: '$45M+', label: 'Prevented Fraud' },
  { value: '99.2%', label: 'Detection Accuracy' },
  { value: '< 1.2s', label: 'Scan Latency' },
  { value: '14,200+', label: 'Threats Inspected' },
];

export const HomePage: React.FC<HomePageProps> = ({ onLaunchScanner, onNavigateAbout }) => {
  const { openAuthModal, isAuthenticated } = useAuth();

  const handleStart = () => {
    if (isAuthenticated) onLaunchScanner();
    else openAuthModal('login');
  };

  return (
    <div className="space-y-20 pb-16">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative pt-6">

        {/* Two-column hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT: Text */}
          <div className="space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-black text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              ADVANCE-FEE &amp; PHISHING DEFENSE ENGINE • RADAR v1.4.2
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-black tracking-tight leading-[1.08]">
              AI Shield Against{' '}
              <span className="underline decoration-2 underline-offset-8">Job Offer Fraud</span>{' '}
              &amp; Rental Phishing.
            </h1>

            {/* Sub */}
            <p className="text-base text-zinc-600 max-w-lg leading-relaxed">
              Inspect appointment letters, lease agreements, and spoofed domains in milliseconds.
              KavachAI calculates a dynamic{' '}
              <strong className="text-black font-bold">0–100% Scam Threat Index</strong> by
              cross-referencing RDAP domain age, advance-fee mandates, and off-platform channels.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Lock className="w-3 h-3" />, label: 'Zero-Trust RDAP Lookup' },
                { icon: <Globe className="w-3 h-3" />, label: 'Domain Age Forensics' },
                { icon: <Cpu className="w-3 h-3" />, label: 'Heuristic AI Engine' },
                { icon: <FileSearch className="w-3 h-3" />, label: 'PDF / OCR Scan' },
              ].map((f) => (
                <span key={f.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-zinc-300 text-zinc-800 text-[11px] font-mono shadow-sm hover:border-black transition-colors">
                  <span className="text-black">{f.icon}</span>{f.label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button id="hero-launch-scanner" onClick={handleStart}
                className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm uppercase tracking-wide shadow-md transition-all group">
                <Zap className="w-4 h-4 fill-white text-white" />
                Launch Security Scanner
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button id="hero-about-btn" onClick={onNavigateAbout}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-black border border-zinc-300 text-sm font-semibold transition-all shadow-sm">
                Read Architecture Specs
                <ExternalLink className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {STATS.map((s) => (
                <div key={s.label} className="p-3.5 rounded-2xl bg-white border border-cyber-border shadow-card text-left">
                  <div className="text-xl font-extrabold font-mono text-black">{s.value}</div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: 3D Orb */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-md rounded-3xl bg-white border border-cyber-border shadow-cardHover p-5">
              <CyberOrb3D />
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-600">
              <span className="flex items-center gap-1.5 font-bold text-black">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" /> 4 Threat Nodes
              </span>
              <span className="text-zinc-300">|</span>
              <span className="flex items-center gap-1.5 font-medium text-zinc-600">
                <span className="w-2 h-2 rounded-full bg-zinc-400" /> 14 Safe Channels
              </span>
              <span className="text-zinc-300">|</span>
              <span className="text-black font-semibold">18 Total Nodes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── THREAT PREVIEW (Monochrome) ─────────────────── */}
      <section className="max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-cyber-border shadow-card overflow-hidden">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="space-y-4 max-w-md text-left">
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-black text-white flex items-center gap-1.5 w-fit font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> LIVE FORENSIC DETECTOR
              </span>
              <h2 className="text-2xl font-black text-black tracking-tight">
                Simulated Detection: Fake AWS Job Offer ($450 Deposit Scam)
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                KavachAI correlates upfront equipment deposit, Telegram redirect, @gmail mailbox, and a 3-day-old typosquat domain into one decisive verdict.
              </p>
              <button onClick={handleStart}
                className="inline-flex items-center gap-2 text-xs font-bold font-mono text-black hover:text-zinc-700 uppercase tracking-wider transition-colors">
                Inspect in SOC Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mini scan card */}
            <div className="w-full md:w-80 p-5 rounded-2xl bg-zinc-50 border border-zinc-300 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase font-semibold">Threat Telemetry</span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-black text-white">
                  CRITICAL: 92%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
                <div className="h-full bg-black rounded-full w-[92%]" />
              </div>
              <div className="p-3 rounded-xl bg-white border border-zinc-200 text-[11px] font-mono leading-relaxed space-y-1.5 text-black">
                <p>"…deposit a <span className="bg-zinc-100 text-black border-b border-black px-1 font-bold">refundable deposit of $450</span> to our Bitcoin wallet…"</p>
                <p>"…Contact HR on <span className="bg-zinc-100 text-zinc-800 px-1 font-bold">Telegram @AmazonRecruiter</span>…"</p>
                <p>"Domain: <span className="text-black underline font-semibold">amazon-careers-verify.xyz</span> (3 days old)"</p>
              </div>
              <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-200 font-mono">
                <span>RDAP: Fresh Typosquat</span>
                <span className="text-black font-bold">+92 pts Penalty</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section id="how-it-works-section" className="max-w-6xl mx-auto space-y-10">
        <div className="text-left space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-black font-bold">[SYSTEM ARCHITECTURE]</span>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">How KavachAI Neutralizes Phishing in 3 Steps</h2>
          <p className="text-sm text-zinc-600 max-w-xl">Multi-layered heuristics combining domain age, payment channels, and off-platform evasion detection.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { step: '01', title: 'Multi-Modal Ingestion', desc: 'Paste emails, drop PDFs, or input URLs. The engine sanitizes HTML and extracts URLs, social handles, and monetary claims.' },
            { step: '02', title: 'Zero-Trust Forensic Audit', desc: 'Real-time RDAP WHOIS queries verify domain age. Pattern matchers identify irreversible payment vectors and Telegram/WhatsApp shifting.' },
            { step: '03', title: 'Explainable Risk Index', desc: 'Generates a 0–100% Threat Index with highlighted red flags, 1-click counter-inquiry templates, and downloadable PDF audit reports.' },
          ].map((s) => (
            <div key={s.step} className="p-6 rounded-3xl bg-white border border-cyber-border shadow-card hover:shadow-cardHover transition-all space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-mono font-bold text-sm">{s.step}</div>
              <h3 className="text-base font-bold text-black">{s.title}</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-zinc-950 text-white shadow-2xl border border-zinc-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Ready to inspect a suspicious offer or rental?
              </h3>
              <p className="text-sm text-zinc-400 max-w-lg">
                Test pre-loaded attack vectors with 1-click. Zero backend required.
              </p>
            </div>
            <button id="bottom-cta-scanner" onClick={handleStart}
              className="flex-shrink-0 flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm uppercase tracking-wide shadow-lg transition-all">
              <Zap className="w-4 h-4 fill-black text-black" />
              Launch Security Operations Center
            </button>
          </div>
          <div className="flex flex-wrap gap-5 pt-6 mt-4 border-t border-zinc-800">
            {[
              { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'No backend required' },
              { icon: <Shield className="w-3.5 h-3.5" />, label: 'Client-side heuristics' },
              { icon: <Lock className="w-3.5 h-3.5" />, label: 'Zero data retention' },
              { icon: <Zap className="w-3.5 h-3.5" />, label: 'Instant demo login' },
            ].map((t) => (
              <span key={t.label} className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                {t.icon}{t.label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
