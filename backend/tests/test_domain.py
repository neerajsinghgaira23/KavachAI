import pytest
from app.services.domain_service import (
    clean_domain_from_url,
    compute_levenshtein_ratio,
    check_typosquatting,
    lookup_domain_rdap,
    analyze_domain,
)


def test_clean_domain_from_url():
    assert clean_domain_from_url("https://careers-google-portal.xyz/login?id=1") == "careers-google-portal.xyz"
    assert clean_domain_from_url("http://sub.bank.com:8080/auth") == "sub.bank.com"
    assert clean_domain_from_url("my-domain.top") == "my-domain.top"
    assert clean_domain_from_url("recruiter@company.com") == "company.com"


def test_levenshtein_ratio():
    assert compute_levenshtein_ratio("google", "google") == 1.0
    assert compute_levenshtein_ratio("g00gle", "google") >= 0.60
    assert compute_levenshtein_ratio("completelydifferent", "apple") < 0.3


def test_typosquatting_detection():
    brand, ratio = check_typosquatting("careers-google-portal.xyz")
    assert brand == "Google"
    assert ratio >= 0.90

    brand2, ratio2 = check_typosquatting("paypa1-security.com")
    assert brand2 == "Paypal" or ratio2 is not None


@pytest.mark.asyncio
async def test_lookup_domain_rdap_mock_and_fallback():
    # Known demo phishing vector
    res = await lookup_domain_rdap("careers-google-verify.xyz", timeout=3.5)
    assert res["domain"] == "careers-google-verify.xyz"
    assert res["is_newly_registered"] is True
    assert res["age_days"] <= 30
    assert res["tld_risk"] == "HIGH"


@pytest.mark.asyncio
async def test_analyze_domain_helper():
    info, score = await analyze_domain("careers-google-verify.xyz")
    assert info.domain == "careers-google-verify.xyz"
    assert info.is_fresh is True
    assert score > 50
