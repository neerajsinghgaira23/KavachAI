export type ScanType = 'text' | 'url' | 'file';

export type VerdictTier = 'SAFE' | 'SUSPICIOUS' | 'CRITICAL_SCAM';

export type FlagSeverity = 'CRITICAL' | 'WARNING' | 'ADVISORY';

export type FlagCategory =
  | 'ADVANCE_FEE'
  | 'OFF_PLATFORM'
  | 'MAIL_REPUTATION'
  | 'DOMAIN_AGE'
  | 'URGENCY'
  | 'RENTAL_FRAUD';

export interface ThreatScoreBreakdown {
  domain_freshness_score: number; // 25% weight (Domain age, TLD risk, typosquat)
  payment_demands_score: number;  // 35% weight (Refundable deposit, wire, crypto, Zelle)
  chat_redirects_score: number;   // 20% weight (Telegram, WhatsApp, Signal)
  free_mailbox_score: number;     // 20% weight (@gmail, @yahoo recruiter impersonation)
}

export interface DomainInfo {
  domain: string;
  registrar: string;
  creation_date: string;
  age_days: number;
  is_newly_registered: boolean;
  tld: string;
  tld_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  typosquatting_target?: string;
  similarity_ratio?: number;
  status_summary: string;
}

export interface FlagItem {
  id: string;
  category: FlagCategory;
  severity: FlagSeverity;
  title: string;
  matched_text: string;
  start_index: number;
  end_index: number;
  weight: number;
  recommendation: string;
}

export interface SafeReplyItem {
  type: string;
  label: string;
  content: string;
}

export interface ScanResponse {
  scan_id: string;
  timestamp: string;
  scan_type: ScanType;
  threat_score: number; // 0 to 100
  verdict: VerdictTier;
  verdict_label: string;
  executive_summary: string;
  breakdown: ThreatScoreBreakdown;
  domain_info: DomainInfo;
  flags: FlagItem[];
  safe_replies: SafeReplyItem[];
  raw_content: string;
}

export interface ScanRequest {
  scan_type: ScanType;
  content?: string;
  target_url?: string;
  sender_email?: string;
  uploaded_filename?: string | null;
}

export interface SampleScenario {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  scan_type: 'text' | 'url';
  content: string;
  target_url?: string;
  sender_email?: string;
  threat_score: number;
}
