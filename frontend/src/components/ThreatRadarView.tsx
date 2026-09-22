import React, { useState, useCallback } from 'react';
import { Radio, RotateCcw, TrendingUp } from 'lucide-react';

interface RadarState {
  demandsZelle: boolean;
  demandsBitcoin: boolean;
  telegramInterview: boolean;
  gmailRecruiter: boolean;
  urgencyLanguage: boolean;
  domainAgeDays: number;
  requestsSSN: boolean;
  offersAboveMarket: boolean;
}

const DEFAULT_STATE: RadarState = {
  demandsZelle: false,
  demandsBitcoin: false,
  telegramInterview: false,
  gmailRecruiter: false,
  urgencyLanguage: false,
  domainAgeDays: 365,
  requestsSSN: false,
  offersAboveMarket: false,
};

function computeScore(s: RadarState): { score: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {
    'Zelle Payment Demand': s.demandsZelle ? 30 : 0,
    'Bitcoin/Crypto Request': s.demandsBitcoin ? 35 : 0,
    'Telegram-Only Interview': s.telegramInterview ? 20 : 0,
    'Gmail Recruiter Identity': s.gmailRecruiter ? 15 : 0,
    'Urgency / FOMO Language': s.urgencyLanguage ? 12 : 0,
    'Fresh Domain (<30 days)': s.domainAgeDays < 30 ? 25 : s.domainAgeDays < 90 ? 12 : 0,
    'Requests SSN Upfront': s.requestsSSN ? 18 : 0,
    'Salary >3x Market Rate': s.offersAboveMarket ? 10 : 0,
  };
  const raw = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { score: Math.min(100, raw), breakdown };
}

function getScoreColor(score: number) {
  if (score >= 70) {
    return {
      badgeClass: 'bg-black text-white border border-black',
      label: '[CRITICAL SCAM]',
    };
  }
  if (score >= 40) {
    return {
      badgeClass: 'bg-zinc-100 text-zinc-900 border border-zinc-400',
      label: '[SUSPICIOUS RISK]',
    };
  }
  return {
    badgeClass: 'bg-zinc-50 text-zinc-600 border border-zinc-200',
    label: '[SAFE PATTERN]',
  };
}

const Toggle: React.FC<{ label: string; sublabel: string; checked: boolean; onChange: (v: boolean) => void; weight: number }> = ({
  label, sublabel, checked, onChange, weight,
}) => (
  <div
    onClick={() => onChange(!checked)}
    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all shadow-sm ${
      checked
        ? 'bg-zinc-100 border-black shadow-sm'
        : 'bg-white border-cyber-border hover:border-zinc-400'
    }`}
  >
    <div className="flex-1 min-w-0">
      <div className="text-xs font-bold text-black">{label}</div>
      <div className="text-[10px] text-zinc-500 font-mono">{sublabel}</div>
    </div>
    <div className="flex items-center gap-2.5 ml-3 flex-shrink-0">
      <span className={`text-[11px] font-mono font-bold ${checked ? 'text-black' : 'text-zinc-400'}`}>
        +{weight}pts
      </span>
      <div className={`w-10 h-5 rounded-full transition-all relative ${checked ? 'bg-black' : 'bg-zinc-200'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </div>
    </div>
  </div>
);

export const ThreatRadarView: React.FC = () => {
  const [state, setState] = useState<RadarState>(DEFAULT_STATE);
  const { score, breakdown } = computeScore(state);
  const colors = getScoreColor(score);

  const set = useCallback(<K extends keyof RadarState>(key: K, val: RadarState[K]) => {
    setState((prev) => ({ ...prev, [key]: val }));
  }, []);

  const reset = () => setState(DEFAULT_STATE);

  const loadScenario = (preset: Partial<RadarState>) => setState({ ...DEFAULT_STATE, ...preset });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-3xl bg-white border border-cyber-border shadow-card gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-black text-white">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black font-mono">SCAM RADAR &amp; LIVE SIMULATOR</h3>
            <p className="text-xs text-zinc-500">Toggle attack vectors — watch the Threat Index update in real time</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-600 hover:text-black text-xs font-mono border border-zinc-300 shadow-sm transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset All
        </button>
      </div>

      {/* Quick-load presets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Max Threat Scenario', sub: 'Deposit + Telegram + Typosquat', preset: { demandsZelle: true, demandsBitcoin: true, telegramInterview: true, gmailRecruiter: true, urgencyLanguage: true, domainAgeDays: 3, requestsSSN: true, offersAboveMarket: true } },
          { label: 'Medium Risk Pattern', sub: 'Telegram + Gmail + Rush', preset: { telegramInterview: true, gmailRecruiter: true, urgencyLanguage: true, domainAgeDays: 45 } },
          { label: 'Clean Corporate Offer', sub: 'Established domain + Direct HR', preset: { domainAgeDays: 3650 } },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => loadScenario(s.preset as Partial<RadarState>)}
            className="p-4 rounded-3xl bg-white border border-cyber-border hover:border-black shadow-card hover:shadow-cardHover text-left transition-all group"
          >
            <div className="text-xs font-bold text-black group-hover:underline transition-colors">{s.label}</div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{s.sub}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Controls */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 px-1">Attack Vector Toggles</h4>

          <Toggle label="Demands Zelle Payment" sublabel="Irreversible domestic P2P wire" checked={state.demandsZelle} onChange={(v) => set('demandsZelle', v)} weight={30} />
          <Toggle label="Demands Bitcoin / Crypto" sublabel="Untraceable payment channel" checked={state.demandsBitcoin} onChange={(v) => set('demandsBitcoin', v)} weight={35} />
          <Toggle label="Telegram-Only Interview" sublabel="Off-platform communication shift" checked={state.telegramInterview} onChange={(v) => set('telegramInterview', v)} weight={20} />
          <Toggle label="Gmail Recruiter Identity" sublabel="No corporate domain email" checked={state.gmailRecruiter} onChange={(v) => set('gmailRecruiter', v)} weight={15} />
          <Toggle label="Urgency / FOMO Language" sublabel='"Act now" / "Limited slots"' checked={state.urgencyLanguage} onChange={(v) => set('urgencyLanguage', v)} weight={12} />
          <Toggle label="Requests SSN Upfront" sublabel="PII harvesting before hire" checked={state.requestsSSN} onChange={(v) => set('requestsSSN', v)} weight={18} />
          <Toggle label="Salary >3× Market Rate" sublabel="Too-good-to-be-true bait" checked={state.offersAboveMarket} onChange={(v) => set('offersAboveMarket', v)} weight={10} />

          {/* Domain age slider */}
          <div className="p-4 rounded-3xl bg-white border border-cyber-border shadow-card space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-black font-bold">Domain Registration Age</span>
              <span className="font-mono font-bold text-black">
                {state.domainAgeDays} days
                {state.domainAgeDays < 30 ? ' [FRESH]' : state.domainAgeDays < 90 ? ' [RECENT]' : ' [ESTABLISHED]'}
              </span>
            </div>
            <input
              type="range" min={1} max={3650} step={1}
              value={state.domainAgeDays}
              onChange={(e) => set('domainAgeDays', Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-zinc-200 accent-black"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>1 day</span><span>30 days</span><span>1 year</span><span>10 years</span>
            </div>
          </div>
        </div>

        {/* Right — Live Score */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 px-1">Live Threat Index</h4>

          {/* Big Score Display */}
          <div className="p-8 rounded-3xl bg-white border border-cyber-border shadow-card text-center space-y-4">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold">Composite Scam Threat Index</div>
            <div className="text-7xl font-black font-mono text-black tracking-tight transition-all duration-500">{score}</div>
            <div className="text-xs font-mono text-zinc-400">/ 100 POINTS</div>
            <div>
              <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold font-mono ${colors.badgeClass}`}>
                {colors.label}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-zinc-200 overflow-hidden mt-2">
              <div
                className="h-full bg-black rounded-full transition-all duration-500"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="p-5 rounded-3xl bg-white border border-cyber-border shadow-card space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-black pb-2 border-b border-cyber-border">
              <TrendingUp className="w-4 h-4 text-black" /> Score Breakdown &amp; Weight Factors
            </div>
            <div className="space-y-2">
              {Object.entries(breakdown).map(([label, pts]) => (
                <div key={label} className="flex items-center justify-between text-xs py-1">
                  <span className={pts > 0 ? 'text-black font-semibold' : 'text-zinc-400'}>{label}</span>
                  <span className={`font-mono font-bold ${pts > 0 ? 'text-black' : 'text-zinc-300'}`}>
                    {pts > 0 ? `+${pts} pts` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
