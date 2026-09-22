import React from 'react';
import { Globe, AlertOctagon, ShieldAlert } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';

export const DomainCard: React.FC = () => {
  const { currentScan } = useScanContext();

  if (!currentScan || !currentScan.domain_info) return null;

  const domain = currentScan.domain_info;

  return (
    <div className="p-5 rounded-xl bg-[#0f172a]/90 border border-[#1e293b] shadow-2xl space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Target Domain Overview & WHOIS Telemetry
          </h4>
        </div>
        {domain.is_newly_registered && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 animate-pulse">
            <AlertOctagon className="w-3 h-3" />
            FRESH DOMAIN (&lt;30 DAYS)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Domain Name & TLD Risk */}
        <div className="p-3 rounded-lg bg-[#020617]/60 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 block">Inspected Host</span>
          <span className="text-xs font-mono font-bold text-cyan-400 truncate block">{domain.domain}</span>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
              TLD: {domain.tld}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${domain.tld_risk === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
            >
              Risk: {domain.tld_risk}
            </span>
          </div>
        </div>

        {/* Domain Registration Age */}
        <div className="p-3 rounded-lg bg-[#020617]/60 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 block">Registration Age</span>
          <div className="flex items-baseline space-x-1">
            <span className={`text-base font-bold font-mono ${domain.is_newly_registered ? 'text-rose-400' : 'text-emerald-400'}`}>
              {domain.age_days !== undefined ? `${domain.age_days} days old` : 'Active'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono truncate">
            {domain.status_summary}
          </span>
        </div>

        {/* Registrar & Brand Typosquatting */}
        <div className="p-3 rounded-lg bg-[#020617]/60 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 block">Registrar & Typosquat Brand</span>
          <span className="text-xs text-slate-300 font-medium truncate block">
            {domain.registrar || 'ICANN Accredited Registrar'}
          </span>
          {domain.typosquatting_target ? (
            <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
              Mimics {domain.typosquatting_target} ({(domain.similarity_ratio! * 100).toFixed(0)}%)
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 font-mono">No known typosquatting stem</span>
          )}
        </div>
      </div>
    </div>
  );
};
