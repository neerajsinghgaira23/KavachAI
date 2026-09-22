from typing import List, Dict, Any, Tuple
from app.config import settings
from app.api.v1.schemas import ThreatScoreBreakdown, SafeReplyItem, FlagItem


def calculate_threat_score(
    flags: List[Dict[str, Any]],
    domain_info: Dict[str, Any],
    has_mail_flag: bool,
    scan_type: str = "text"
) -> Tuple[int, str, str, ThreatScoreBreakdown, List[SafeReplyItem], List[str]]:
    """
    Computes weighted 0-100% Scam Threat Index based on:
    - Advance-Fee / Upfront Payment Demands (Weight 35%)
    - Domain Age & Typosquatting (Weight 25%)
    - Off-Platform Communication (Weight 20%)
    - Mail Reputation & Recruiter Webmail (Weight 20%)
    
    Returns:
    - final_score: int (0 - 100)
    - verdict: str ("SAFE", "SUSPICIOUS", "CRITICAL_SCAM")
    - verdict_label: str ("Safe / Verified", "Suspicious / Caution Advised", "Critical Scam Threat")
    - breakdown: ThreatScoreBreakdown model
    - safe_replies: List[SafeReplyItem] models
    - recommendations: List[str] actionable advice items
    """
    advance_fee_raw = 0
    off_platform_raw = 0
    urgency_raw = 0
    rental_raw = 0

    for flag in flags:
        cat = flag.get("category")
        wt = flag.get("weight", 10)
        if cat == "ADVANCE_FEE":
            advance_fee_raw += wt
        elif cat == "OFF_PLATFORM":
            off_platform_raw += wt
        elif cat == "URGENCY":
            urgency_raw += wt
        elif cat == "RENTAL_FRAUD":
            rental_raw += wt

    # --- 1. Advance-Fee & Rental Subscore (0 - 100) ---
    combined_fee = advance_fee_raw + rental_raw
    advance_fee_subscore = min(100, int((combined_fee / 35.0) * 100)) if combined_fee > 0 else 0

    # --- 2. Domain Subscore (0 - 100) ---
    domain_subscore = 0
    if domain_info:
        age_days = domain_info.get("age_days") if domain_info.get("age_days") is not None else domain_info.get("age_in_days")
        is_new = domain_info.get("is_newly_registered", False) or domain_info.get("is_fresh", False)
        tld_risk = domain_info.get("tld_risk", "LOW")
        typo_brand = domain_info.get("typosquatting_target")

        if is_new or (age_days is not None and age_days < 30):
            domain_subscore += 60
        elif age_days is not None and age_days < 90:
            domain_subscore += 35

        if typo_brand:
            domain_subscore += 35
        if tld_risk == "HIGH" or domain_info.get("is_suspicious_tld"):
            domain_subscore += 25
        elif tld_risk == "MEDIUM":
            domain_subscore += 15

    domain_subscore = min(100, domain_subscore)

    # --- 3. Off-Platform Subscore (0 - 100) ---
    off_platform_subscore = min(100, int((off_platform_raw / 20.0) * 100)) if off_platform_raw > 0 else 0

    # --- 4. Mail Subscore (0 - 100) ---
    mail_subscore = 85 if has_mail_flag else 0

    # --- Dynamic Weighted Composite Math ---
    if scan_type == "url" and not flags:
        weighted_total = (domain_subscore * 0.75) + (advance_fee_subscore * 0.25)
    else:
        weighted_total = (
            (advance_fee_subscore * settings.WEIGHT_ADVANCE_FEE) +
            (domain_subscore * settings.WEIGHT_DOMAIN_AGE) +
            (off_platform_subscore * settings.WEIGHT_OFF_PLATFORM) +
            (mail_subscore * settings.WEIGHT_MAIL_REPUTATION) +
            (min(20, urgency_raw) * 0.5)
        )

    final_score = max(0, min(100, int(round(weighted_total))))

    # Determine Verdict & Tier
    if final_score >= 70:
        verdict = "CRITICAL_SCAM"
        verdict_label = "Critical Scam Threat"
    elif final_score >= 30:
        verdict = "SUSPICIOUS"
        verdict_label = "Suspicious / Caution Advised"
    else:
        verdict = "SAFE"
        verdict_label = "Safe / Verified"

    breakdown = ThreatScoreBreakdown(
        payment_score=advance_fee_subscore,
        domain_score=domain_subscore,
        channel_score=off_platform_subscore,
        mail_score=mail_subscore,
        advance_fee_score=advance_fee_subscore,
        domain_age_score=domain_subscore,
        off_platform_score=off_platform_subscore,
        mail_reputation_score=mail_subscore,
    )

    # Recommendations & Safe Replies
    recommendations: List[str] = []
    safe_replies: List[SafeReplyItem] = []

    if rental_raw > 0:
        recommendations.append("Do NOT wire any funds or holding deposit before an in-person, physical inspection of the property.")
        safe_replies.append(
            SafeReplyItem(
                type="rental_escrow_inspection",
                label="Demand In-Person Lease & Escrow",
                content="Thank you for the details. In accordance with safe tenancy practices, I will not transfer any holding deposit or lease funds prior to an in-person walkthrough and verifying the property deed with the local registrar. Please provide the physical inspection schedule."
            )
        )

    if advance_fee_raw > 0:
        recommendations.append("Legitimate employers never demand candidate-borne equipment deposits, training fees, or check overpayments.")
        safe_replies.append(
            SafeReplyItem(
                type="employment_fee_refusal",
                label="Refuse Upfront Payment Mandate",
                content="Standard corporate hiring practices strictly prohibit candidate-borne equipment deposits, training fees, or background check payments. Please arrange to dispatch necessary enterprise equipment directly or confirm standard corporate procurement."
            )
        )

    if off_platform_raw > 0:
        recommendations.append("Refuse redirects to unmonitored Telegram/WhatsApp chats; demand official corporate communications.")

    if has_mail_flag:
        recommendations.append("Verify recruiter identity through official corporate telephone directories or verified domain email addresses.")
        safe_replies.append(
            SafeReplyItem(
                type="corporate_verification",
                label="Demand Official Corporate Email Verification",
                content="To satisfy standard cybersecurity verification protocols, please re-send this correspondence from your verified corporate domain email address (not free webmail or messaging platforms) and provide the direct phone extension of your Human Resources department."
            )
        )

    if domain_subscore >= 50:
        recommendations.append("The target domain was recently registered or mimics an established brand. Avoid entering credentials or personal data.")

    if not recommendations:
        recommendations.append("No immediate threat indicators detected. Continue verifying sender authentication headers and links.")

    if not safe_replies:
        safe_replies.append(
            SafeReplyItem(
                type="standard_inquiry",
                label="Confirm Written Offer Terms",
                content="Thank you for providing the written terms. I will review the documentation and follow up via official company channels."
            )
        )

    return final_score, verdict, verdict_label, breakdown, safe_replies, recommendations
