import React from 'react';
import { CreditCard, Globe, MessageSquare, Mail, Activity } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const ThreatBreakdown: React.FC = () => {
  const { currentScan } = useScanContext();

  if (!currentScan) return null;

  const { breakdown } = currentScan;

  const metrics = [
    {
      title: 'Payment Demands',
      subtitle: 'Refundable deposits, wire, crypto, Zelle, training fees',
      score: breakdown.payment_demands_score,
      weight: '35% Weight',
      icon: <CreditCard className="w-4 h-4 text-rose-400" />,
      barColor: 'from-rose-500 to-rose-600',
    },
    {
      title: 'Domain Freshness',
      subtitle: 'RDAP age in days, high-risk TLDs, typosquatting brand likeness',
      score: breakdown.domain_freshness_score,
      weight: '25% Weight',
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
      barColor: 'from-cyan-400 to-blue-500',
    },
    {
      title: 'Chat Redirects',
      subtitle: 'Telegram handles, WhatsApp chat links, unmonitored channels',
      score: breakdown.chat_redirects_score,
      weight: '20% Weight',
      icon: <MessageSquare className="w-4 h-4 text-amber-400" />,
      barColor: 'from-amber-400 to-orange-500',
    },
    {
      title: 'Free Mailbox',
      subtitle: 'Generic consumer webmail (@gmail.com, @yahoo) impersonation',
      score: breakdown.free_mailbox_score,
      weight: '20% Weight',
      icon: <Mail className="w-4 h-4 text-violet-400" />,
      barColor: 'from-violet-400 to-purple-500',
    },
  ];

  return (
    <div className="p-5 rounded-xl bg-[#0f172a]/90 border border-[#1e293b] shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
          <Activity className="w-4 h-4 text-cyan-400" />
          Weighted Threat Vector Breakdown
        </h4>
        <span className="text-[11px] text-slate-500 font-mono">Normalized 0–100 Scale</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-[#020617]/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800">{m.icon}</div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block leading-tight">{m.title}</span>
                  <span className="text-[10px] text-slate-500 block font-mono">{m.weight}</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-200 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {m.score}/100
              </span>
            </div>

            {/* Sub-Score Progress Track */}
            <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${m.barColor} transition-all duration-700`}
                style={{ width: `${Math.max(4, m.score)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-1 font-sans">{m.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
