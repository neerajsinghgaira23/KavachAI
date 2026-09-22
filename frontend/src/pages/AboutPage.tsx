import React from 'react';
import {
  Shield,
  AlertOctagon,
  Lock,
  Globe,
  CreditCard,
  MessageSquare,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AboutPageProps {
  onLaunchScanner: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onLaunchScanner }) => {
  const { openAuthModal, isAuthenticated } = useAuth();

  const handleStart = () => {
    if (isAuthenticated) {
      onLaunchScanner();
    } else {
      openAuthModal('login');
    }
  };

  const layers = [
    {
      num: '01',
      title: 'RDAP Domain Intelligence & WHOIS Telemetry',
      icon: <Globe className="w-5 h-5 text-black" />,
      desc: 'Most scam campaigns deploy domains registered fewer than 30 days prior to attack launch. KavachAI interrogates authoritative ICANN RDAP endpoints to compute domain age in days, flags high-risk TLDs (.xyz, .top, .click), and executes string similarity comparisons against top global corporate brands.',
    },
    {
      num: '02',
      title: 'Advance-Fee & Irreversible Payment Matching',
      icon: <CreditCard className="w-5 h-5 text-black" />,
      desc: 'Legitimate employers never demand candidate-borne equipment deposits, laptop transit insurance, or background verification payments. KavachAI analyzes text for specific advance-fee language patterns and payment vectors including cryptocurrency wallets, Zelle, CashApp, and Western Union.',
    },
    {
      num: '03',
      title: 'Off-Platform Channel Shift Detection',
      icon: <MessageSquare className="w-5 h-5 text-black" />,
      desc: 'Threat actors deliberately guide victims away from monitored corporate email systems to unmonitored consumer chat applications like Telegram and WhatsApp. KavachAI detects evasion links (t.me/, wa.me/) and flags the transition to untraceable channels.',
    },
    {
      num: '04',
      title: 'Recruiter Mailbox Authenticity & Impersonation',
      icon: <Mail className="w-5 h-5 text-black" />,
      desc: 'Scammers frequently use free consumer email providers (e.g. google.recruitment.dept@gmail.com) while claiming to represent Fortune 500 corporations. The engine flags this identity mismatch and advises the candidate on demanding authenticated corporate email verification.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-14">
      {/* Title Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-300 text-black text-xs font-mono font-bold">
          <Shield className="w-3.5 h-3.5" />
          <span>CYBER DEFENSE INTELLIGENCE WHITE PAPER</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight font-sans">
          The Mechanics of Modern Advance-Fee Fraud &amp; Phishing
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          Why traditional corporate email gateways fail to protect job candidates and tenants from psychological extortion, and how KavachAI closes the defensive gap.
        </p>
      </div>

      {/* Deep-Dive Problem Statement */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-cyber-border space-y-5 shadow-card">
        <div className="flex items-center space-x-3 text-black">
          <AlertOctagon className="w-6 h-6 shrink-0" />
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
            The Threat: Evasion of Traditional Anti-Spam Gateways
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
          Traditional corporate email filtering systems are optimized for malware payloads, malicious attachments, and established blocklists. However, modern <strong className="text-black font-bold">Advance-Fee Employment Scams</strong> and <strong className="text-black font-bold">Rental Deposit Fraud</strong> utilize clean text, benign-looking PDFs, and fresh domains with zero prior negative reputation.
        </p>
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
          By combining artificial time pressure (e.g., "offer expires in 24 hours"), realistic corporate branding, and promises of high compensation ($140,000+ USD), attackers induce cognitive overload. They convince candidates to wire $300–$1,500 under the pretext of refundable laptop insurance, background checks, or lease holding fees before the victim realizes the company or landlord is fictitious.
        </p>
      </section>

      {/* The 4 Detection Layers */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono text-black font-bold uppercase tracking-widest">[DETECTION TAXONOMY]</span>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            The KavachAI 4-Layer Forensic Engine
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {layers.map((layer) => (
            <div
              key={layer.num}
              className="p-6 rounded-3xl bg-white border border-cyber-border space-y-3 relative group hover:border-black shadow-card hover:shadow-cardHover transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-cyber-elevated border border-cyber-border">
                  {layer.icon}
                </div>
                <span className="text-xs font-mono font-bold text-zinc-400">{layer.num}</span>
              </div>
              <h3 className="text-base font-bold text-black">{layer.title}</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">{layer.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hackathon Mission & Security Ethics */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-cyber-border space-y-4 shadow-card">
        <h3 className="text-lg font-bold text-black flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Hackathon Mission &amp; Responsible Security Ethics
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
          KavachAI was engineered with a strict <strong className="text-black font-bold">zero-trust candidate empowerment</strong> philosophy. The platform does not require candidates to upload private identification numbers, and all analysis operates transparently with explainable heuristic weighting. Our safe reply templates provide candidates with legally backed, polite, and uncompromising verification language.
        </p>
      </section>

      {/* Call to Action */}
      <div className="text-center pt-2">
        <button
          onClick={handleStart}
          className="inline-flex items-center space-x-2.5 px-8 py-4 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm tracking-wide shadow-md transition-all group"
        >
          <span>Launch SOC Threat Scanner</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
