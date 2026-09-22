import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert "KavachAI" in data["engine"]


def test_samples_endpoint():
    response = client.get("/api/v1/samples")
    assert response.status_code == 200
    samples = response.json()
    assert len(samples) >= 3
    assert any(s["id"] == "sample-fake-job-offer" for s in samples)


def test_scan_advance_fee_text():
    payload = {
        "text": (
            "Congratulations on your job offer! Please deposit a refundable equipment fee of $500 "
            "via Zelle or Bitcoin to receive your work laptop. Contact @HRRecruiter on Telegram."
        ),
        "sender_email": "hr.google.careers@gmail.com",
        "url": "https://careers-google-verify.xyz/login",
    }
    response = client.post("/api/v1/scan", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["threat_score"] >= 70
    assert res["verdict"] == "CRITICAL_SCAM"
    assert len(res["flags"]) >= 2
    assert len(res["safe_replies"]) >= 1


def test_detect_ai_endpoint():
    payload = {
        "text": (
            "Furthermore, it is important to note that technology plays a pivotal role in modern society. "
            "Moreover, to summarize, this serves as a testament to human innovation. "
            "In conclusion, we must delve into the nuanced tapestry of artificial intelligence."
        )
    }
    response = client.post("/api/v1/detect-ai", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["ai_probability"] > 50.0
    assert res["verdict"] in ("AI_GENERATED", "MIXED_SYNTHETIC")
    assert len(res["flagged_sentences"]) > 0


def test_export_report_json():
    # Run a scan first
    scan_resp = client.post("/api/v1/scan", json={"text": "Standard legitimate message with no payment demands."})
    scan_data = scan_resp.json()

    export_req = {
        "scan_result": scan_data,
        "format": "json"
    }
    response = client.post("/api/v1/export-report", json=export_req)
    assert response.status_code == 200
    data = response.json()
    assert "audit_metadata" in data
    assert data["audit_metadata"]["sha256_fingerprint"] is not None


def test_export_report_markdown():
    scan_resp = client.post("/api/v1/scan", json={"text": "Standard legitimate message with no payment demands."})
    scan_data = scan_resp.json()

    export_req = {
        "scan_result": scan_data,
        "format": "markdown"
    }
    response = client.post("/api/v1/export-report", json=export_req)
    assert response.status_code == 200
    assert "KAVACH-AI — FORENSIC THREAT INSPECTION AUDIT REPORT" in response.text
