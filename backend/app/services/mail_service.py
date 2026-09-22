from typing import Dict, Any, Optional, Tuple
from app.api.v1.schemas import FlagItem

FREE_WEBMAIL_DOMAINS = {
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "ymail.com",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "aol.com",
    "icloud.com",
    "proton.me",
    "protonmail.com",
    "mail.com",
    "zoho.com",
    "gmx.com",
    "yandex.com",
}

DISPOSABLE_WEBMAIL_DOMAINS = {
    "yopmail.com",
    "tempmail.com",
    "temp-mail.org",
    "guerrillamail.com",
    "10minutemail.com",
    "mailinator.com",
    "trashmail.com",
    "sharklasers.com",
    "dispostable.com",
}


def analyze_sender_email(email: str, content_context: str = "") -> Optional[Dict[str, Any]]:
    """
    Evaluates whether an email address belongs to a free/disposable provider
    while pretending to originate from a corporate recruitment entity.
    """
    if not email or "@" not in email:
        return None

    email = email.strip().lower()
    local_part, domain_part = email.split("@", 1)

    is_disposable = domain_part in DISPOSABLE_WEBMAIL_DOMAINS
    is_free = domain_part in FREE_WEBMAIL_DOMAINS or is_disposable

    # Detect corporate impersonation keywords in email handle or associated body context
    impersonates_corporate = False
    flagged_keywords = [
        "recruitment", "hr", "talent", "careers", "google", "microsoft",
        "amazon", "apple", "hiring", "onboarding", "officer", "support", "billing"
    ]
    
    for kw in flagged_keywords:
        if kw in local_part or (content_context and kw in content_context.lower()):
            impersonates_corporate = True
            break

    if is_free or is_disposable:
        severity = "CRITICAL" if is_disposable else ("WARNING" if impersonates_corporate else "ADVISORY")
        title = (
            "Disposable / Anonymous Webmail Address Detected"
            if is_disposable
            else "Free Webmail Recruiter Address Detected"
        )
        recommendation = (
            "Enterprise recruitment, banking notices, and legal contracts originate from company-owned domain mailboxes (e.g., @company.com), never free or disposable consumer webmail accounts."
        )

        weight = 30 if is_disposable else (25 if impersonates_corporate else 15)

        return {
            "id": "MAIL_REPUTATION_UNVERIFIED",
            "category": "MAIL_REPUTATION",
            "is_free_webmail": is_free,
            "is_disposable": is_disposable,
            "impersonates_corporate": impersonates_corporate,
            "domain": domain_part,
            "severity": severity,
            "title": title,
            "detail": title,
            "matched_text": email,
            "snippet": email,
            "weight": weight,
            "recommendation": recommendation,
        }

    return None


def evaluate_recruiter_mail(email: str, context: str = "") -> Tuple[Optional[FlagItem], int]:
    """
    Evaluates sender email and returns a typed FlagItem (if flagged) along with the mail risk score.
    """
    res = analyze_sender_email(email, context)
    if not res:
        return None, 0

    flag = FlagItem(
        id=res["id"],
        category=res["category"],
        severity=res["severity"],
        title=res["title"],
        detail=res["detail"],
        matched_text=res["matched_text"],
        snippet=res["snippet"],
        start_index=context.lower().find(email.lower()) if context and email.lower() in context.lower() else -1,
        end_index=(context.lower().find(email.lower()) + len(email)) if context and email.lower() in context.lower() else -1,
        weight=res["weight"],
        recommendation=res["recommendation"],
    )
    # Mail risk score mapped to 0-100
    mail_score = 85 if res["is_disposable"] or res["impersonates_corporate"] else 50
    return flag, mail_score
