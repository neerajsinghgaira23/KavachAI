import React, { useState } from 'react';
import { MessageSquare, Copy, Check, ChevronDown, ChevronUp, Shield, AlertTriangle, Building2 } from 'lucide-react';

interface ChallengeTemplate {
  id: string;
  category: 'Job Offer' | 'Rental Fraud' | 'Payment Demand' | 'Identity Verification';
  icon: React.ReactNode;
  badge: string;
  title: string;
  situation: string;
  template: string;
  tips: string[];
}

const TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'corp_domain',
    category: 'Job Offer',
    icon: <Building2 className="w-4 h-4 text-black" />,
    badge: 'Domain Verification',
    title: 'Demand Official Corporate Domain Re-Send',
    situation: 'Recruiter emailed from a Gmail / Yahoo address claiming to represent a major company.',
    template: `Dear Hiring Team,

Thank you for reaching out regarding this opportunity. In accordance with standard corporate security protocols, I respectfully request that all official correspondence, including this offer, be re-sent directly from a verified corporate email address ending in @[company].com, along with your direct corporate telephone extension listed on the company's official website.

This is a standard security practice I observe when processing employment communications. I look forward to continuing the process through authenticated channels.

Best regards,
[Your Name]`,
    tips: [
      'Never accept offer letters sent from Gmail or Yahoo addresses',
      'Cross-check the recruiter\'s name on LinkedIn via the official company page',
      'Call the company\'s main HR line to verify the recruiter exists',
    ],
  },
  {
    id: 'payment_refusal',
    category: 'Payment Demand',
    icon: <Shield className="w-4 h-4 text-black" />,
    badge: 'Payment Refusal',
    title: 'Refuse Upfront Equipment / Training Fee',
    situation: 'Offer letter demands you pay a "refundable" deposit for a laptop, training kit, or background check.',
    template: `Dear [Recruiter Name],

Thank you for the offer details. I must respectfully decline the request for an upfront equipment deposit or training fee. In accordance with standard employment law and corporate HR policy, candidates are not required to furnish personal funds for employer-provisioned equipment or onboarding materials.

Legitimate employers handle all hardware provisioning and onboarding costs through internal IT procurement channels. I would be happy to proceed once we can confirm the standard company-provided equipment delivery process.

Please clarify the official IT logistics procedure at your earliest convenience.

Sincerely,
[Your Name]`,
    tips: [
      'No legitimate employer ever asks candidates to buy their own equipment',
      '"Refundable" deposits from scammers are never returned',
      'Irreversible payment methods (Zelle, Bitcoin, Wire) are red flags',
    ],
  },
  {
    id: 'rental_escrow',
    category: 'Rental Fraud',
    icon: <AlertTriangle className="w-4 h-4 text-black" />,
    badge: 'Rental Verification',
    title: 'Insist on In-Person Walkthrough Before Any Transfer',
    situation: 'Landlord claims to be abroad and requests a wire transfer to secure the apartment before you can view it.',
    template: `Dear [Landlord / Agent Name],

Thank you for sharing details about the property. In accordance with standard tenancy regulations and best practices, I do not transfer security deposits, advance rent, or any other funds prior to completing an in-person physical walkthrough of the property and verifying the title deed with the local land registry.

I would be happy to schedule a viewing at your earliest convenience. If you are currently abroad, please arrange for a licensed local property management agent to conduct the walkthrough on your behalf.

Please provide the contact details of your local licensed real estate agent so we may proceed accordingly.

Regards,
[Your Name]`,
    tips: [
      'Never wire money to a landlord you have not met in person',
      'Verify property ownership via your local land registry',
      'Reverse-search listing photos on Google Images to detect reused fraudulent images',
    ],
  },
  {
    id: 'interview_channel',
    category: 'Identity Verification',
    icon: <MessageSquare className="w-4 h-4 text-black" />,
    badge: 'Channel Authentication',
    title: 'Reject Telegram / WhatsApp-Only Interview Requests',
    situation: 'Recruiter insists the interview must happen on Telegram or WhatsApp instead of email or video call.',
    template: `Dear [Recruiter Name],

Thank you for your message. I note that the interview process has been directed to a consumer messaging application. For security and professional compliance purposes, I conduct all formal employment interviews exclusively through authenticated corporate platforms — including official company email, Microsoft Teams, Zoom (with a verified company domain link), or a direct phone call to a corporate extension.

Please send a formal interview invitation from your corporate @[company].com email address with a verified video conferencing link.

I look forward to connecting through authenticated channels.

Best regards,
[Your Name]`,
    tips: [
      'Legitimate corporate recruiters always use company-authenticated platforms',
      'Telegram and WhatsApp are unmonitored and provide no accountability trail',
      'Request a Zoom link with a corporate domain (e.g., zoom.us/j/company_id)',
    ],
  },
];

const TemplateCard: React.FC<{ template: ChallengeTemplate }> = ({ template: t }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(t.template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-3xl bg-white border border-cyber-border shadow-card hover:shadow-cardHover transition-all overflow-hidden">
      {/* Card Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="p-2.5 rounded-2xl bg-zinc-100 border border-zinc-300 text-black flex-shrink-0">
            {t.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 text-black border border-zinc-300">
                {t.badge}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{t.category}</span>
            </div>
            <h4 className="text-sm font-bold text-black">{t.title}</h4>
            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{t.situation}</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Content */}
      {expanded && (
        <div className="border-t border-cyber-border space-y-4 p-5 bg-cyber-elevated">
          {/* Template Text */}
          <div className="relative">
            <pre className="p-4 rounded-2xl bg-white border border-cyber-border text-xs font-mono text-black leading-relaxed whitespace-pre-wrap overflow-x-auto shadow-sm">
              {t.template}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-xs font-mono text-white transition-colors shadow-sm font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Template'}
            </button>
          </div>

          {/* Security Tips */}
          <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-300 space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-black mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Security Intelligence Protocol
            </div>
            {t.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-black">
                <span className="text-black font-bold flex-shrink-0 mt-0.5">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const VerificationLabView: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const categories = ['All', 'Job Offer', 'Rental Fraud', 'Payment Demand', 'Identity Verification'];
  const filtered = filter === 'All' ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-white border border-cyber-border shadow-card">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-black text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black font-mono">RECRUITER CHALLENGE LAB &amp; COUNTERMEASURES</h3>
            <p className="text-xs text-zinc-500 mt-0.5 max-w-2xl leading-relaxed">
              Copy legally-grounded, firm verification inquiry templates to safely challenge suspicious recruiters or landlords without revealing personal information or making payment commitments.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === c
                ? 'bg-black text-white shadow-sm font-bold'
                : 'bg-white text-zinc-600 hover:text-black border border-cyber-border shadow-card'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Template Cards */}
      <div className="space-y-4">
        {filtered.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-3xl bg-white border border-cyber-border shadow-card flex items-start gap-3">
        <Shield className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-600 leading-relaxed">
          These templates are informational countermeasure tools. Always consult local consumer protection authorities (FTC, IC3, or national equivalents) if you believe you are a target of active fraud. Do not send personal identification documents or payment to any unverified party.
        </p>
      </div>
    </div>
  );
};
