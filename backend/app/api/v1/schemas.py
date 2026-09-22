from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, model_validator


class ScanRequest(BaseModel):
    """
    Scan payload accommodating both frontend TypeScript interfaces:
    (text / url / content / target_url / sender_email / scan_type).
    """
    text: Optional[str] = Field(default=None, description="Input text to scan")
    url: Optional[str] = Field(default=None, description="Target domain or URL to inspect")
    content: Optional[str] = Field(default=None, description="Alias for text body")
    target_url: Optional[str] = Field(default=None, description="Alias for target URL")
    sender_email: Optional[str] = Field(default="", description="Sender email address if available")
    scan_type: Literal["text", "url", "file"] = Field(default="text", description="Scan input classification")
    uploaded_filename: Optional[str] = Field(default=None, description="Filename if submitted via document OCR")

    @model_validator(mode="before")
    @classmethod
    def unify_input_fields(cls, values: Any) -> Any:
        if isinstance(values, dict):
            # Normalize text/content
            raw_text = values.get("text") or values.get("content") or ""
            values["text"] = raw_text
            values["content"] = raw_text

            # Normalize url/target_url
            raw_url = values.get("url") or values.get("target_url") or ""
            values["url"] = raw_url
            values["target_url"] = raw_url
        return values


class FlagItem(BaseModel):
    id: str = Field(default="", description="Unique flag identifier")
    category: str = Field(..., description="Flag category: ADVANCE_FEE, OFF_PLATFORM, MAIL_REPUTATION, DOMAIN_AGE, URGENCY, RENTAL_FRAUD")
    severity: str = Field(..., description="Severity level: CRITICAL, WARNING, ADVISORY")
    detail: Optional[str] = Field(default="", description="Descriptive rationale of the triggered detection")
    snippet: Optional[str] = Field(default="", description="Extracted matched text slice")
    start_index: int = Field(default=-1, description="Start character offset in sanitized body")
    end_index: int = Field(default=-1, description="End character offset in sanitized body")
    title: Optional[str] = Field(default="", description="Human-readable threat rule title")
    matched_text: Optional[str] = Field(default="", description="Raw matched token/phrase")
    weight: int = Field(default=10, description="Risk weight score contribution (0-35)")
    recommendation: str = Field(default="", description="Protective action advice for user")

    @model_validator(mode="before")
    @classmethod
    def normalize_flag_fields(cls, values: Any) -> Any:
        if isinstance(values, dict):
            # Ensure title/detail synchronization
            title = values.get("title") or values.get("detail") or "Security Anomaly"
            values["title"] = title
            values["detail"] = values.get("detail") or title

            # Ensure matched_text/snippet synchronization
            snippet = values.get("snippet") or values.get("matched_text") or ""
            values["snippet"] = snippet
            values["matched_text"] = snippet
        return values


class DomainInfo(BaseModel):
    domain: Optional[str] = Field(default="", description="Domain name (FQDN)")
    age_in_days: Optional[int] = Field(default=None, description="Domain registration age in days")
    age_days: Optional[int] = Field(default=None, description="Domain registration age in days (alias)")
    registrar: Optional[str] = Field(default="Unknown Registrar", description="Domain registrar name")
    creation_date: Optional[str] = Field(default=None, description="ISO timestamp of domain creation")
    is_fresh: bool = Field(default=False, description="True if domain was created within the past 30 days")
    is_newly_registered: bool = Field(default=False, description="Alias for is_fresh")
    is_suspicious_tld: bool = Field(default=False, description="True if domain uses high-risk/abuse-prone TLD")
    tld: Optional[str] = Field(default="", description="Top-level domain extension (.xyz, .com, etc.)")
    tld_risk: Literal["LOW", "MEDIUM", "HIGH"] = Field(default="LOW", description="TLD risk level")
    typosquatting_target: Optional[str] = Field(default=None, description="Brand impersonated via typosquatting")
    similarity_ratio: Optional[float] = Field(default=None, description="Levenshtein similarity score to brand")
    status_summary: Optional[str] = Field(default=None, description="Brief status of RDAP lookup")

    @model_validator(mode="before")
    @classmethod
    def sync_domain_fields(cls, values: Any) -> Any:
        if isinstance(values, dict):
            # Synchronize age fields
            age = values.get("age_days") if values.get("age_days") is not None else values.get("age_in_days")
            values["age_in_days"] = age
            values["age_days"] = age

            # Synchronize freshness
            is_new = values.get("is_newly_registered") if "is_newly_registered" in values else values.get("is_fresh", False)
            values["is_fresh"] = bool(is_new)
            values["is_newly_registered"] = bool(is_new)
        return values


# Alias for DomainInfo
DomainIntelligence = DomainInfo


class ThreatScoreBreakdown(BaseModel):
    domain_score: int = Field(default=0, ge=0, le=100, description="Score for domain age & typosquatting (25% wt)")
    payment_score: int = Field(default=0, ge=0, le=100, description="Score for upfront payment/deposit demands (35% wt)")
    channel_score: int = Field(default=0, ge=0, le=100, description="Score for shifting to unmonitored channels (20% wt)")
    mail_score: int = Field(default=0, ge=0, le=100, description="Score for free/unverified webmail usage (20% wt)")
    
    # Aliases for frontend compatibility
    advance_fee_score: int = Field(default=0, ge=0, le=100)
    domain_age_score: int = Field(default=0, ge=0, le=100)
    off_platform_score: int = Field(default=0, ge=0, le=100)
    mail_reputation_score: int = Field(default=0, ge=0, le=100)

    @model_validator(mode="before")
    @classmethod
    def sync_breakdown(cls, values: Any) -> Any:
        if isinstance(values, dict):
            pay = values.get("payment_score") if values.get("payment_score") is not None else values.get("advance_fee_score", 0)
            dom = values.get("domain_score") if values.get("domain_score") is not None else values.get("domain_age_score", 0)
            chan = values.get("channel_score") if values.get("channel_score") is not None else values.get("off_platform_score", 0)
            mail = values.get("mail_score") if values.get("mail_score") is not None else values.get("mail_reputation_score", 0)

            values["payment_score"] = pay
            values["advance_fee_score"] = pay
            values["domain_score"] = dom
            values["domain_age_score"] = dom
            values["channel_score"] = chan
            values["off_platform_score"] = chan
            values["mail_score"] = mail
            values["mail_reputation_score"] = mail
        return values


# Alias for ThreatScoreBreakdown
ThreatBreakdown = ThreatScoreBreakdown


class SafeReplyItem(BaseModel):
    type: str = Field(..., description="Reply strategy code")
    label: str = Field(..., description="Actionable button title")
    content: str = Field(..., description="Pre-composed defensive counter-inquiry message")


class ScanResponse(BaseModel):
    threat_index: int = Field(default=0, ge=0, le=100, description="Aggregated Scam Threat Index (0-100%)")
    threat_score: int = Field(default=0, ge=0, le=100, description="Alias for threat_index")
    verdict: str = Field(..., description="Verdict: SAFE, SUSPICIOUS, or CRITICAL_SCAM")
    verdict_label: Optional[str] = Field(default="", description="Descriptive verdict tag")
    domain_info: Optional[DomainInfo] = Field(default=None, description="Domain intelligence metadata")
    domain_intelligence: Optional[DomainInfo] = Field(default=None, description="Alias for domain_info")
    flags: List[FlagItem] = Field(default_factory=list, description="List of triggered forensic flags with character offsets")
    breakdown: ThreatScoreBreakdown = Field(..., description="Categorical risk score breakdown")
    recommendations: List[str] = Field(default_factory=list, description="Prioritized recommendations")
    safe_replies: List[SafeReplyItem] = Field(default_factory=list, description="Defensive counter-response templates")
    
    # Audit trail metadata
    scan_id: str = Field(default="", description="Unique scan session ID")
    timestamp: str = Field(default="", description="UTC timestamp of inspection")
    scan_type: str = Field(default="text", description="Input type scanned")
    executive_summary: str = Field(default="", description="Executive cybersecurity assessment synopsis")
    sanitized_content: Optional[str] = Field(default=None, description="Normalized input content")

    @model_validator(mode="before")
    @classmethod
    def sync_response(cls, values: Any) -> Any:
        if isinstance(values, dict):
            score = values.get("threat_index") if values.get("threat_index") is not None else values.get("threat_score", 0)
            values["threat_index"] = score
            values["threat_score"] = score

            dom = values.get("domain_info") or values.get("domain_intelligence")
            values["domain_info"] = dom
            values["domain_intelligence"] = dom
        return values


class AIDetectRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Text snippet to evaluate for synthetic/AI origin")


class FlaggedSentence(BaseModel):
    sentence: str = Field(..., description="Extracted sentence analyzed for perplexity and burstiness")
    perplexity_score: float = Field(..., description="Low score indicates high synthetic predictability")
    is_synthetic: bool = Field(..., description="Flagged as likely AI-generated")
    reason: str = Field(..., description="Rationale for synthetic sentence classification")


class AIDetectResponse(BaseModel):
    ai_probability: float = Field(..., ge=0.0, le=100.0, description="Overall percentage likelihood of AI/synthetic generation")
    burstiness_score: float = Field(..., description="Measure of sentence length and structure variance (low = AI, high = Human)")
    verdict: str = Field(..., description="Verdict: AI_GENERATED, MIXED_SYNTHETIC, or HUMAN_WRITTEN")
    flagged_sentences: List[Dict[str, Any]] = Field(default_factory=list, description="Sentences with elevated synthetic patterns")
    summary_rationale: str = Field(..., description="Detailed forensic rationale of AI detection heuristics")


class SampleScenario(BaseModel):
    id: str
    title: str
    subtitle: str
    category: str
    scan_type: Literal["text", "url"]
    content: str
    target_url: Optional[str] = None
    sender_email: Optional[str] = None
    expected_threat_tier: str


class ReportExportRequest(BaseModel):
    scan_result: ScanResponse
    format: Literal["pdf", "json", "markdown"] = "pdf"
