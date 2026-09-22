import pytest
from app.services.scorer import calculate_threat_score


def test_scorer_high_threat_advance_fee():
    mock_flags = [
        {"category": "ADVANCE_FEE", "weight": 35, "severity": "CRITICAL"},
        {"category": "OFF_PLATFORM", "weight": 20, "severity": "WARNING"},
    ]
    mock_domain = {
        "domain": "careers-google-verify.xyz",
        "age_days": 4,
        "is_newly_registered": True,
        "tld_risk": "HIGH",
        "typosquatting_target": "Google",
    }

    score, verdict, label, breakdown, safe_replies, recommendations = calculate_threat_score(
        flags=mock_flags,
        domain_info=mock_domain,
        has_mail_flag=True,
        scan_type="text",
    )

    assert 0 <= score <= 100
    assert score >= 70
    assert verdict == "CRITICAL_SCAM"
    assert "Critical Scam" in label
    assert breakdown.payment_score > 0
    assert breakdown.domain_score > 0
    assert len(safe_replies) > 0
    assert len(recommendations) > 0


def test_scorer_suspicious_tier():
    mock_flags = [
        {"category": "OFF_PLATFORM", "weight": 20, "severity": "WARNING"},
    ]
    mock_domain = {
        "domain": "freelance-board.com",
        "age_days": 200,
        "is_newly_registered": False,
        "tld_risk": "LOW",
        "typosquatting_target": None,
    }

    score, verdict, label, breakdown, safe_replies, recommendations = calculate_threat_score(
        flags=mock_flags,
        domain_info=mock_domain,
        has_mail_flag=True,
        scan_type="text",
    )

    assert 30 <= score <= 69
    assert verdict == "SUSPICIOUS"


def test_scorer_clean_corporate_offer():
    mock_flags = []
    mock_domain = {
        "domain": "microsoft.com",
        "age_days": 10000,
        "is_newly_registered": False,
        "tld_risk": "LOW",
        "typosquatting_target": None,
    }

    score, verdict, label, breakdown, safe_replies, recommendations = calculate_threat_score(
        flags=mock_flags,
        domain_info=mock_domain,
        has_mail_flag=False,
        scan_type="text",
    )

    assert 0 <= score <= 100
    assert score < 30
    assert verdict == "SAFE"
    assert "Safe / Verified" in label
    assert len(safe_replies) > 0
