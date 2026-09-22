import pytest
from app.services.regex_rules import evaluate_regex_rules, scan_text_patterns
from app.services.mail_service import analyze_sender_email, evaluate_recruiter_mail
from app.utils.sanitizers import clean_text, extract_urls, extract_emails, extract_domain


def test_advance_fee_refundable_deposit_detection():
    sample = "You are required to deposit a refundable security deposit of $450 to our Bitcoin wallet."
    flags = evaluate_regex_rules(sample)
    categories = [f["category"] for f in flags]
    assert "ADVANCE_FEE" in categories
    assert any(f["severity"] == "CRITICAL" for f in flags)
    
    # Assert exact character offsets are valid
    for f in flags:
        assert f["start_index"] >= 0
        assert f["end_index"] > f["start_index"]
        assert sample[f["start_index"]:f["end_index"]] == f["matched_text"]


def test_fake_check_and_vendor_procurement_detection():
    sample = "We will send a cashier check for equipment. Please purchase from vendor immediately."
    flags, pay_score, chan_score, urg_score = scan_text_patterns(sample)
    assert len(flags) >= 1
    assert any("check" in f.snippet.lower() or "vendor" in f.snippet.lower() for f in flags)
    assert pay_score > 0


def test_off_platform_telegram_detection():
    sample = "Please message HR immediately on Telegram at @GoogleLeadRecruiter to confirm."
    flags = evaluate_regex_rules(sample)
    assert any(f["category"] == "OFF_PLATFORM" for f in flags)
    telegram_flag = next(f for f in flags if f["category"] == "OFF_PLATFORM")
    assert telegram_flag["start_index"] >= 0
    assert sample[telegram_flag["start_index"]:telegram_flag["end_index"]] == telegram_flag["matched_text"]


def test_rental_fraud_wire_before_viewing():
    sample = "The landlord is currently abroad. You must wire the first month rent before viewing the apartment."
    flags = evaluate_regex_rules(sample)
    assert any(f["category"] == "RENTAL_FRAUD" for f in flags)


def test_free_webmail_recruiter_detection():
    eval_res = analyze_sender_email("recruitment.google.dept@gmail.com", "Google hiring")
    assert eval_res is not None
    assert eval_res["is_free_webmail"] is True
    assert eval_res["impersonates_corporate"] is True
    assert eval_res["severity"] == "WARNING"

    # Test helper
    flag, score = evaluate_recruiter_mail("recruitment.google.dept@gmail.com", "Google hiring")
    assert flag is not None
    assert score > 50


def test_disposable_mail_detection():
    eval_res = analyze_sender_email("hr-department@yopmail.com", "Official Notice")
    assert eval_res is not None
    assert eval_res["is_disposable"] is True
    assert eval_res["severity"] == "CRITICAL"


def test_sanitizer_and_extractors():
    raw = "<script>alert('xss')</script>Check https://phish-domain.xyz/auth and contact hr@legit.com"
    clean = clean_text(raw)
    assert "<script>" not in clean
    assert "phish-domain.xyz" in clean

    urls = extract_urls(clean)
    assert any("phish-domain.xyz" in u for u in urls)

    emails = extract_emails(clean)
    assert "hr@legit.com" in emails

    domain = extract_domain("https://careers-google-verify.xyz/onboarding")
    assert domain == "careers-google-verify.xyz"
