import React, { useState, useCallback } from 'react';
import { Brain, Zap, RotateCcw, Copy, Check, ChevronRight, AlertCircle, Cpu } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SentenceResult {
  text: string;
  syntheticScore: number; // 0–100
  label: 'SYNTHETIC' | 'HUMAN' | 'AMBIGUOUS';
}

interface AIAnalysisResult {
  syntheticProbability: number;       // 0–100 overall
  perplexityIndex: number;            // 0–100 (higher = more uniform = more AI)
  structuralUniformity: number;       // 0–100
  corporateTokenDensity: number;      // 0–100
  hallucinationMarkers: number;       // count of suspect phrases
  burstinessVariance: number;         // low = AI, high = human
  verdict: 'AI_GENERATED' | 'LIKELY_AI' | 'AMBIGUOUS' | 'LIKELY_HUMAN' | 'HUMAN';
  verdictLabel: string;
  verdictColor: string;
  sentences: SentenceResult[];
  tokenCount: number;
}

// ─── Mock presets (Monochrome) ─────────────────────────────────────────────
const PRESETS = [
  {
    id: 'gpt_job',
    label: 'GPT-4 Synthesized Job Offer',
    badge: '96% Synthetic',
    content: `Dear Candidate, we are pleased to extend this exceptional employment opportunity to you at Amazon Web Services. Your qualifications align perfectly with our organizational objectives and strategic initiatives. This position offers comprehensive compensation packages including competitive salary structures, performance-based incentives, and industry-leading benefits. Our dynamic team environment fosters professional growth and development. Please transfer the refundable equipment deposit of $450 via Bitcoin to secure your workstation allocation. Contact our dedicated HR specialist on Telegram @AWSRecruiter for further onboarding documentation. We look forward to your immediate response to this time-sensitive offer.`,
  },
  {
    id: 'human_casual',
    label: 'Human Drafted Casual Phish',
    badge: '22% Synthetic',
    content: `hey so i saw ur resume online and was wondering if u might be interested in a position we have available. its remote work, pretty decent pay. my boss runs this logistics company out of texas and we need someone asap. its mostly data entry and some light admin stuff. pay is around $28/hr. if ur interested just dm me on whatsapp at +1-555-2948 and we can talk more. no interview needed just send ur details and we get u started like next week maybe`,
  },
  {
    id: 'authentic_corporate',
    label: 'Authentic Corporate HR Letter',
    badge: '38% Synthetic',
    content: `Dear Ms. Priya Sharma, Following your interview with our engineering team on September 18th, we are delighted to offer you the position of Software Development Engineer II within the Azure Infrastructure division. Your base compensation will be $145,000 annually, with eligibility for our annual performance review cycle. Reporting to the hiring manager, you will be joining a cross-functional team working on distributed systems. Please review the attached formal offer letter and return the signed copy via your DocuSign link by September 28th. Your provisioned MacBook Pro will be shipped to your registered address upon contract completion by our IT logistics team.`,
  },
];

// ─── AI Burstiness & Synthetic Analysis Engine ────────────────────────────────
function analyzeAIContent(text: string): AIAnalysisResult {
  const rawSentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const sentences = rawSentences.map((s) => s.trim()).filter(Boolean);

  // Token count (word approximation)
  const tokenCount = text.split(/\s+/).filter(Boolean).length;

  // Corporate buzzword density
  const buzzwords = [
    'exceptional', 'comprehensive', 'competitive', 'dynamic', 'strategic',
    'objectives', 'initiatives', 'facilitate', 'leverage', 'synergy',
    'aligned', 'qualifications', 'foster', 'dedicated', 'industry-leading',
    'performance-based', 'professional growth', 'organizational',
  ];
  const buzzMatches = buzzwords.filter((w) => text.toLowerCase().includes(w)).length;
  const corporateTokenDensity = Math.min(100, Math.round((buzzMatches / Math.max(1, tokenCount / 10)) * 150));

  // Sentence length variance (burstiness) — AI has LOW variance
  const lengths = sentences.map((s) => s.split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length);
  const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, lengths.length);
  const burstinessVariance = Math.round(variance);
  const perplexityIndex = Math.max(0, Math.min(100, 100 - Math.round(Math.sqrt(variance) * 4)));

  // Structural uniformity — similar starting words
  const starters = sentences.map((s) => s.split(' ')[0]?.toLowerCase() || '');
  const uniqueStarters = new Set(starters).size;
  const structuralUniformity = Math.min(100, Math.round((1 - uniqueStarters / Math.max(1, sentences.length)) * 120));

  // Hallucination markers
  const hallucinationPhrases = [
    'immediately respond', 'time-sensitive', 'guaranteed', 'ensure your slot',
    'limited positions', 'act now', 'on Telegram', 'via Bitcoin', 'refundable deposit',
    'secure your position', 'no interview needed',
  ];
  const hallucinationMarkers = hallucinationPhrases.filter((p) =>
    text.toLowerCase().includes(p.toLowerCase())
  ).length;

  // Overall synthetic probability
  const syntheticProbability = Math.min(
    100,
    Math.round(
      corporateTokenDensity * 0.3 +
      perplexityIndex * 0.3 +
      structuralUniformity * 0.2 +
      hallucinationMarkers * 8
    )
  );

  let verdict: AIAnalysisResult['verdict'];
  let verdictLabel: string;
  let verdictColor: string;

  if (syntheticProbability >= 80) {
    verdict = 'AI_GENERATED';
    verdictLabel = '[SYNTHETIC LLM GENERATED]';
    verdictColor = 'text-black';
  } else if (syntheticProbability >= 60) {
    verdict = 'LIKELY_AI';
    verdictLabel = '[HIGH PROBABILITY AI-ASSISTED]';
    verdictColor = 'text-black';
  } else if (syntheticProbability >= 40) {
    verdict = 'AMBIGUOUS';
    verdictLabel = '[AMBIGUOUS / MIXED SIGNATURE]';
    verdictColor = 'text-zinc-700';
  } else if (syntheticProbability >= 20) {
    verdict = 'LIKELY_HUMAN';
    verdictLabel = '[LIKELY HUMAN DRAFTED]';
    verdictColor = 'text-zinc-600';
  } else {
    verdict = 'HUMAN';
    verdictLabel = '[AUTHENTIC HUMAN TEXT]';
    verdictColor = 'text-zinc-500';
  }

  // Per-sentence analysis
  const sentenceResults: SentenceResult[] = sentences.map((s) => {
    const sLen = s.split(/\s+/).length;
    const hasBuzz = buzzwords.some((w) => s.toLowerCase().includes(w));
    const hasHal = hallucinationPhrases.some((p) => s.toLowerCase().includes(p.toLowerCase()));
    let score = Math.round(
      (sLen > 15 && sLen < 30 ? 40 : 15) +
      (hasBuzz ? 35 : 0) +
      (hasHal ? 30 : 0)
    );
    score = Math.min(99, Math.max(5, score));
    const label: SentenceResult['label'] = score >= 65 ? 'SYNTHETIC' : score >= 40 ? 'AMBIGUOUS' : 'HUMAN';
    return { text: s, syntheticScore: score, label };
  });

  return {
    syntheticProbability,
    perplexityIndex,
    structuralUniformity,
    corporateTokenDensity,
    hallucinationMarkers,
    burstinessVariance,
    verdict,
    verdictLabel,
    verdictColor,
    sentences: sentenceResults,
    tokenCount,
  };
}

// ─── Mini Arc Gauge (Monochrome) ───────────────────────────────────────────────
const ArcGauge: React.FC<{ value: number; label: string; sublabel: string }> = ({
  value, label, sublabel,
}) => {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-20 overflow-hidden">
        <svg width="144" height="80" viewBox="0 0 144 80" className="overflow-visible">
          {/* background track */}
          <path
            d="M 16 72 A 56 56 0 0 1 128 72"
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* filled arc */}
          <path
            d="M 16 72 A 56 56 0 0 1 128 72"
            fill="none"
            stroke="#09090b"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 175.9} 175.9`}
            className="transition-all duration-700"
          />
          {/* value text */}
          <text x="72" y="68" textAnchor="middle" fill="#09090b" fontSize="18" fontWeight="800" fontFamily="monospace">
            {pct}%
          </text>
        </svg>
      </div>
      <div className="text-center">
        <div className="text-xs font-bold text-black">{label}</div>
        <div className="text-[10px] text-zinc-500 font-mono">{sublabel}</div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const AIDetectorModule: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const runAnalysis = useCallback(async (inputText: string) => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 600));
    setResult(analyzeAIContent(inputText));
    setIsAnalyzing(false);
  }, []);

  const handleAnalyze = () => runAnalysis(text);

  const loadPreset = (content: string) => {
    setText(content);
    runAnalysis(content);
  };

  const handleReset = () => {
    setText('');
    setResult(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSentenceStyle = (label: SentenceResult['label']) => {
    switch (label) {
      case 'SYNTHETIC': return 'bg-zinc-100 text-black border-l-4 border-black font-semibold';
      case 'AMBIGUOUS': return 'bg-zinc-50 text-zinc-800 border-l-4 border-zinc-400';
      default: return 'bg-white text-zinc-600 border-l-4 border-zinc-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-3xl bg-white border border-cyber-border shadow-card gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-black text-white">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black font-mono">AI &amp; LLM SYNTHETIC CONTENT DETECTOR</h3>
            <p className="text-xs text-zinc-500">Detects ChatGPT/Claude phishing letters bypassing grammar filters</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-100 text-black border border-zinc-300">
          BURSTINESS ENGINE v2
        </span>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => loadPreset(p.content)}
            className="p-4 rounded-2xl bg-white border border-cyber-border hover:border-black text-left space-y-2 transition-all shadow-card hover:shadow-cardHover group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 text-black border border-zinc-300">
                {p.badge}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black transition-colors" />
            </div>
            <p className="text-xs font-bold text-black group-hover:text-black transition-colors">{p.label}</p>
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-black" /> Paste Suspicious Content for Analysis
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400">{text.split(/\s+/).filter(Boolean).length} tokens</span>
            {text && (
              <button onClick={handleCopy} className="text-[10px] font-mono text-zinc-600 hover:text-black flex items-center gap-1">
                {copied ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a suspicious job offer, recruitment email, or rental agreement here to detect AI-generated phishing content..."
          rows={6}
          className="w-full px-4 py-3.5 rounded-2xl bg-cyber-elevated border border-cyber-border focus:border-black text-sm text-black placeholder-zinc-400 outline-none resize-none font-mono leading-relaxed transition-all"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAnalyze}
          disabled={!text.trim() || isAnalyzing}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-bold text-sm uppercase tracking-wide shadow-md transition-all"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Running Burstiness Analysis...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white text-white" />
              Analyze for AI Synthesis
            </>
          )}
        </button>
        {result && (
          <button onClick={handleReset} className="px-4 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-600 hover:text-black border border-zinc-300 shadow-sm transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Panel */}
      {result && (
        <div className="space-y-5 animate-fadeIn">
          {/* Verdict Banner */}
          <div className="p-5 rounded-3xl bg-zinc-50 border border-zinc-300 shadow-card flex items-center justify-between">
            <div>
              <div className="text-base font-extrabold font-mono text-black">{result.verdictLabel}</div>
              <div className="text-xs text-zinc-500 mt-1 font-mono">
                {result.tokenCount} tokens analyzed · {result.hallucinationMarkers} hallucination markers · burstiness σ²={result.burstinessVariance}
              </div>
            </div>
            <div className="text-3xl font-black font-mono text-black">{result.syntheticProbability}%</div>
          </div>

          {/* Dual Gauges */}
          <div className="p-6 rounded-3xl bg-white border border-cyber-border shadow-card space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">Telemetry Gauges</h4>
            <div className="flex flex-wrap justify-around gap-6">
              <ArcGauge
                value={result.syntheticProbability}
                label="Synthetic LLM Probability"
                sublabel="Overall AI Origin Score"
              />
              <ArcGauge
                value={result.perplexityIndex}
                label="Perplexity &amp; Uniformity"
                sublabel="Sentence Length Uniformity"
              />
            </div>
          </div>

          {/* Heuristic Breakdown Bars */}
          <div className="p-6 rounded-3xl bg-white border border-cyber-border shadow-card space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">Heuristic Breakdown</h4>
            {[
              { label: 'Structural Uniformity', value: result.structuralUniformity, color: 'bg-black', desc: 'Repetitive sentence structure patterns' },
              { label: 'Corporate Token Density', value: result.corporateTokenDensity, color: 'bg-zinc-800', desc: 'Buzzword & jargon saturation' },
              { label: 'Hallucination Markers', value: Math.min(100, result.hallucinationMarkers * 15), color: 'bg-zinc-600', desc: `${result.hallucinationMarkers} suspect phrases detected` },
              { label: 'Perplexity Index (Inverse)', value: result.perplexityIndex, color: 'bg-zinc-400', desc: 'Low variance = AI uniformity' },
            ].map((bar) => (
              <div key={bar.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-black font-semibold">{bar.label}</span>
                  <span className="font-mono text-zinc-500 text-[11px]">{bar.desc}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className={`h-full ${bar.color} rounded-full transition-all duration-700`}
                    style={{ width: `${bar.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Sentence Classifier */}
          <div className="p-6 rounded-3xl bg-white border border-cyber-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">Sentence Classifier</h4>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 font-bold text-black"><span className="w-2 h-2 rounded-full bg-black" />AI Synthetic</span>
                <span className="flex items-center gap-1.5 text-zinc-700"><span className="w-2 h-2 rounded-full bg-zinc-500" />Ambiguous</span>
                <span className="flex items-center gap-1.5 text-zinc-400"><span className="w-2 h-2 rounded-full bg-zinc-300" />Human</span>
              </div>
            </div>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {result.sentences.map((s, i) => (
                <div key={i} className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${getSentenceStyle(s.label)}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex-1">{s.text}</span>
                    <span className={`flex-shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      s.label === 'SYNTHETIC' ? 'bg-black text-white' :
                      s.label === 'AMBIGUOUS' ? 'bg-zinc-200 text-zinc-800' :
                      'bg-zinc-100 text-zinc-500'
                    }`}>
                      {s.syntheticScore}% AI
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {result.hallucinationMarkers > 0 && (
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-zinc-100 border border-zinc-300">
                <AlertCircle className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                <p className="text-xs text-black">
                  <strong>{result.hallucinationMarkers} hallucination markers</strong> detected — phrases commonly generated by LLMs when fabricating job offers, payment demands, or urgency triggers.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
