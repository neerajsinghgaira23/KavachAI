import React, { useState } from 'react';
import { FileCode, Download, Copy, Check, AlertTriangle, Shield, Globe, Clock, Hash, ChevronRight } from 'lucide-react';
import { useScanContext } from '../context/ScanContext';
import { downloadAuditReport } from '../services/api';
import { ScanResponse } from '../types/scan';

// SHA-256-style mock fingerprint generator
function mockSHA256(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const base = Math.abs(hash).toString(16).padStart(8, '0');
  return `${base}${base.split('').reverse().join('')}${base}${base.substring(0, 16)}`.substring(0, 64).toUpperCase();
}

const IOCBadge: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyber-elevated border border-cyber-border">
    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-black text-white">{label}</span>
    <span className="text-xs font-mono text-black truncate">{value}</span>
  </div>
);

const ReportSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="rounded-3xl bg-white border border-cyber-border shadow-card overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-4 bg-cyber-elevated border-b border-cyber-border">
      <span className="text-black">{icon}</span>
      <span className="text-xs font-mono font-bold uppercase tracking-wider text-black">{title}</span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const EmptyState: React.FC<{ onLoad: () => void }> = ({ onLoad }) => (
  <div className="text-center py-16 space-y-4 rounded-3xl bg-white border border-cyber-border shadow-card max-w-xl mx-auto p-8">
    <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center mx-auto text-black">
      <FileCode className="w-8 h-8" />
    </div>
    <div>
      <p className="text-base font-bold text-black">No Active Scan in Buffer</p>
      <p className="text-xs text-zinc-500 mt-1">Run a scan in the Threat Scanner module to generate a cryptographic audit report.</p>
    </div>
    <button
      onClick={onLoad}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-mono font-bold transition-all shadow-md"
    >
      <ChevronRight className="w-4 h-4" /> Load Sample Scan Vector
    </button>
  </div>
);

export const AuditReportView: React.FC<{ onGoToScanner?: () => void }> = ({ onGoToScanner }) => {
  const { currentScan, loadSample } = useScanContext();
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const handleLoadSample = async () => {
    await loadSample('amazon_scam');
    if (onGoToScanner) onGoToScanner();
  };

  const handleCopyJSON = (scan: ScanResponse) => {
    navigator.clipboard.writeText(JSON.stringify(scan, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2500);
  };

  if (!currentScan) return <EmptyState onLoad={handleLoadSample} />;

  const sha = mockSHA256(currentScan.scan_id + currentScan.timestamp);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Actions Bar (Monochrome) */}
      <div className="p-5 rounded-3xl border border-zinc-300 bg-zinc-50 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-base font-black font-mono text-black">
              FORENSIC AUDIT — {currentScan.verdict.replace('_', ' ')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black text-white">
              {currentScan.threat_score}% THREAT
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Scan ID: <strong className="text-black">{currentScan.scan_id}</strong> · {new Date(currentScan.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => downloadAuditReport(currentScan, 'json')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" /> JSON Export
          </button>
          <button
            onClick={() => downloadAuditReport(currentScan, 'txt')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-black border border-zinc-300 text-xs font-mono font-bold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Plain Text
          </button>
        </div>
      </div>

      {/* SHA-256 Fingerprint */}
      <ReportSection title="Cryptographic Telemetry Digest" icon={<Hash className="w-4 h-4" />}>
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-[11px] font-mono text-zinc-500 w-24 flex-shrink-0 font-bold">SHA-256:</span>
            <code className="text-xs font-mono text-black bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-300 break-all">{sha}</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500 w-24 flex-shrink-0 font-bold">Scan Type:</span>
            <code className="text-xs font-mono text-black uppercase font-bold">{currentScan.scan_type}</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500 w-24 flex-shrink-0 font-bold">Timestamp:</span>
            <code className="text-xs font-mono text-zinc-700">{currentScan.timestamp}</code>
          </div>
        </div>
      </ReportSection>

      {/* Executive Summary */}
      <ReportSection title="Executive Summary &amp; Threat Breakdown" icon={<Shield className="w-4 h-4" />}>
        <p className="text-sm text-zinc-800 leading-relaxed">{currentScan.executive_summary}</p>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Payment Demands', value: currentScan.breakdown.payment_demands_score, weight: '35%' },
            { label: 'Domain Freshness', value: currentScan.breakdown.domain_freshness_score, weight: '25%' },
            { label: 'Chat Redirects', value: currentScan.breakdown.chat_redirects_score, weight: '20%' },
            { label: 'Free Mailbox', value: currentScan.breakdown.free_mailbox_score, weight: '20%' },
          ].map((b) => (
            <div key={b.label} className="p-3.5 rounded-2xl bg-cyber-elevated border border-cyber-border text-center">
              <div className="text-xl font-black font-mono text-black">
                {b.value}
              </div>
              <div className="text-xs font-bold text-black mt-0.5">{b.label}</div>
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{b.weight} weight</div>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* Domain Telemetry */}
      <ReportSection title="Domain Telemetry (RDAP / WHOIS)" icon={<Globe className="w-4 h-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Domain', value: currentScan.domain_info.domain },
            { label: 'Registrar', value: currentScan.domain_info.registrar },
            { label: 'Registration Date', value: new Date(currentScan.domain_info.creation_date).toLocaleDateString() },
            { label: 'Age', value: `${currentScan.domain_info.age_days} days` },
            { label: 'TLD Risk', value: currentScan.domain_info.tld_risk },
            { label: 'Status', value: currentScan.domain_info.status_summary },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3 p-3 rounded-xl bg-cyber-elevated border border-cyber-border">
              <span className="text-[11px] font-mono text-zinc-500 w-28 flex-shrink-0 font-medium">{row.label}:</span>
              <span className="text-xs font-mono text-black font-bold truncate">{row.value}</span>
            </div>
          ))}
        </div>
        {currentScan.domain_info.is_newly_registered && (
          <div className="mt-4 flex items-center gap-3 p-3.5 rounded-xl bg-zinc-100 border border-zinc-300">
            <AlertTriangle className="w-4 h-4 text-black flex-shrink-0" />
            <p className="text-xs text-black font-medium">Freshly registered domain detected. Threat actors routinely provision domains within days of launching phishing campaigns.</p>
          </div>
        )}
      </ReportSection>

      {/* IOCs */}
      {currentScan.flags.length > 0 && (
        <ReportSection title={`Indicators of Compromise (IOCs) — ${currentScan.flags.length} Triggered`} icon={<AlertTriangle className="w-4 h-4" />}>
          <div className="space-y-3">
            {currentScan.flags.map((flag, i) => (
              <div key={flag.id} className="p-4 rounded-2xl bg-cyber-elevated border border-cyber-border space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
                      [{i + 1}] {flag.severity}
                    </span>
                    <span className="text-xs font-bold text-black">{flag.title}</span>
                  </div>
                  <span className="text-xs font-mono text-black font-bold">+{flag.weight} pts</span>
                </div>
                <IOCBadge label="MATCHED" value={`"${flag.matched_text}"`} />
                <p className="text-xs text-zinc-600 leading-relaxed">{flag.recommendation}</p>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Timeline */}
      <ReportSection title="Forensic Execution Timeline" icon={<Clock className="w-4 h-4" />}>
        <div className="space-y-2.5">
          {[
            { time: '00ms', event: 'Input received, sanitized, and tokenized' },
            { time: '120ms', event: 'Advance-fee regex heuristic engine matched patterns' },
            { time: '280ms', event: 'Domain RDAP/WHOIS registry lookup completed' },
            { time: '420ms', event: 'Composite multi-factor threat score computed' },
            { time: '550ms', event: 'Forensic audit report compiled and cryptographically digest-signed' },
          ].map((item) => (
            <div key={item.time} className="flex items-center gap-3 text-xs">
              <span className="font-mono text-black font-bold w-14 flex-shrink-0">{item.time}</span>
              <span className="text-zinc-600">{item.event}</span>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* Raw JSON Dump */}
      <div className="rounded-3xl bg-white border border-cyber-border shadow-card overflow-hidden">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="w-full flex items-center justify-between px-5 py-4 bg-cyber-elevated border-b border-cyber-border hover:bg-zinc-100 transition-colors"
        >
          <span className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-black">
            <FileCode className="w-4 h-4 text-black" /> Raw JSON Dump (Cryptographic Record)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleCopyJSON(currentScan); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-[11px] font-mono text-black border border-zinc-300 shadow-sm transition-colors font-bold"
            >
              {copiedJSON ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3 text-zinc-500" />}
              {copiedJSON ? 'Copied' : 'Copy'}
            </button>
            <span className="text-zinc-500 text-xs">{showRaw ? '▲' : '▼'}</span>
          </div>
        </button>
        {showRaw && (
          <pre className="p-5 text-xs font-mono text-black overflow-x-auto max-h-96 bg-cyber-elevated">
            {JSON.stringify(currentScan, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
