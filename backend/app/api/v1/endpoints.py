import uuid
import re
import datetime
import math
import asyncio
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, JSONResponse, PlainTextResponse

from app.config import settings
from app.api.v1.schemas import (
    ScanRequest,
    ScanResponse,
    SampleScenario,
    DomainInfo,
    FlagItem,
    ReportExportRequest,
    AIDetectRequest,
    AIDetectResponse,
)
from app.utils.sanitizers import clean_text, extract_urls, extract_emails, extract_domain
from app.utils.sample_data import MOCK_SAMPLES
from app.services.regex_rules import evaluate_regex_rules
from app.services.domain_service import analyze_domain, lookup_domain_rdap
from app.services.mail_service import analyze_sender_email
from app.services.scorer import calculate_threat_score
from app.services.ocr_service import extract_document_text
from app.services.report_service import (
    generate_forensic_pdf_report,
    generate_forensic_markdown_report,
    generate_forensic_json_report,
)

router = APIRouter()


@router.get("/health", tags=["Telemetry"])
async def get_health_status():
    """Returns real-time engine health, ruleset version, and runtime status."""
    return {
        "status": "ONLINE",
        "engine": "KavachAI Threat Inspector",
        "rules_version": settings.DEFAULT_RULES_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }


@router.get("/samples", response_model=List[SampleScenario], tags=["Samples"])
async def get_sample_scenarios():
    """Returns pre-loaded attack vector scenarios for single-click judging."""
    return MOCK_SAMPLES


@router.post("/scan", response_model=ScanResponse, tags=["Inspection"])
async def scan_payload(payload: ScanRequest):
    """
    High-Performance Multi-Vector Threat Inspection Pipeline:
    - Parallelized domain RDAP intelligence & sender mailbox reputation
    - Sub-millisecond pre-compiled regex engine
    - Dynamic Scam Threat Index calculation & safe counter-inquiry templates
    """
    scan_id = f"kavach-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    input_text = payload.text or payload.content or ""
    sanitized_body = clean_text(input_text)
    
    target_url = (payload.url or payload.target_url or "").strip()
    sender_email = (payload.sender_email or "").strip()

    # Extract target URL if not provided directly
    if not target_url and sanitized_body:
        extracted_urls = extract_urls(sanitized_body)
        if extracted_urls:
            target_url = extracted_urls[0]

    # Extract sender email if not provided directly
    if not sender_email and sanitized_body:
        extracted_emails = extract_emails(sanitized_body)
        if extracted_emails:
            sender_email = extracted_emails[0]

    domain_name = extract_domain(target_url) if target_url else ""

    # Concurrent execution of Regex analysis, Sender Mail evaluation, and RDAP Domain Lookup
    async def fetch_rdap():
        if domain_name:
            return await lookup_domain_rdap(domain_name, timeout=settings.RDAP_TIMEOUT_SECONDS)
        return None

    def run_mail_eval():
        if sender_email:
            return analyze_sender_email(sender_email, sanitized_body)
        return None

    def run_regex():
        return evaluate_regex_rules(sanitized_body)

    # Execute CPU and Async I/O tasks concurrently
    rdap_res, mail_eval, flags_raw = await asyncio.gather(
        fetch_rdap(),
        asyncio.to_thread(run_mail_eval),
        asyncio.to_thread(run_regex),
    )

    # Process sender email flag
    has_mail_flag = False
    if mail_eval:
        has_mail_flag = True
        flags_raw.append({
            "id": f"MAIL_REP_{len(flags_raw) + 1}",
            "category": "MAIL_REPUTATION",
            "severity": mail_eval["severity"],
            "title": mail_eval["title"],
            "detail": mail_eval["detail"],
            "matched_text": mail_eval["matched_text"],
            "snippet": mail_eval["snippet"],
            "start_index": sanitized_body.lower().find(sender_email.lower()) if sanitized_body and sender_email.lower() in sanitized_body.lower() else -1,
            "end_index": (sanitized_body.lower().find(sender_email.lower()) + len(sender_email)) if sanitized_body and sender_email.lower() in sanitized_body.lower() else -1,
            "weight": mail_eval["weight"],
            "recommendation": mail_eval["recommendation"],
        })

    # Process domain intelligence
    domain_obj: Optional[DomainInfo] = None
    if rdap_res:
        domain_obj = DomainInfo(**rdap_res)
        if rdap_res.get("is_newly_registered") or rdap_res.get("is_fresh"):
            flags_raw.append({
                "id": f"DOMAIN_AGE_{len(flags_raw) + 1}",
                "category": "DOMAIN_AGE",
                "severity": "CRITICAL",
                "title": f"Newly Registered Domain (<30 Days: {rdap_res.get('age_days', 0)} days)",
                "detail": "Fresh domain registered recently to evade reputation filters.",
                "matched_text": domain_name,
                "snippet": domain_name,
                "start_index": sanitized_body.lower().find(domain_name.lower()) if sanitized_body and domain_name.lower() in sanitized_body.lower() else -1,
                "end_index": (sanitized_body.lower().find(domain_name.lower()) + len(domain_name)) if sanitized_body and domain_name.lower() in sanitized_body.lower() else -1,
                "weight": 25,
                "recommendation": "The destination domain was recently registered. Threat actors routinely leverage fresh domains to evade reputation blocklists.",
            })
        if rdap_res.get("typosquatting_target"):
            flags_raw.append({
                "id": f"TYPOSQUAT_{len(flags_raw) + 1}",
                "category": "DOMAIN_AGE",
                "severity": "CRITICAL",
                "title": f"Typosquatting Brand Impersonation ({rdap_res.get('typosquatting_target')})",
                "detail": f"Domain mimics the legitimate brand {rdap_res.get('typosquatting_target')}.",
                "matched_text": domain_name,
                "snippet": domain_name,
                "start_index": sanitized_body.lower().find(domain_name.lower()) if sanitized_body and domain_name.lower() in sanitized_body.lower() else -1,
                "end_index": (sanitized_body.lower().find(domain_name.lower()) + len(domain_name)) if sanitized_body and domain_name.lower() in sanitized_body.lower() else -1,
                "weight": 25,
                "recommendation": f"Domain closely mimics the legitimate brand {rdap_res.get('typosquatting_target')}.",
            })

    # Calculate Threat Score & Remediations
    domain_dict = domain_obj.model_dump() if domain_obj else {}
    score, verdict, verdict_label, breakdown, safe_replies, recommendations = calculate_threat_score(
        flags=flags_raw,
        domain_info=domain_dict,
        has_mail_flag=has_mail_flag,
        scan_type=payload.scan_type,
    )

    # Build Executive Summary
    summary_parts = []
    if score >= 70:
        summary_parts.append("Critical scam indicators detected.")
    elif score >= 30:
        summary_parts.append("Suspicious markers present requiring verification.")
    else:
        summary_parts.append("Communication appears consistent with standard corporate communications.")

    if any(f["category"] == "ADVANCE_FEE" for f in flags_raw):
        summary_parts.append("Demands upfront payments or refundable security deposits under the guise of onboarding fees.")
    if any(f["category"] == "RENTAL_FRAUD" for f in flags_raw):
        summary_parts.append("Demands deposit wire transfer before in-person property walkthrough.")
    if any(f["category"] == "OFF_PLATFORM" for f in flags_raw):
        summary_parts.append("Shifts communication to unmonitored consumer messaging channels (e.g. Telegram/WhatsApp).")
    if has_mail_flag:
        summary_parts.append("Originates from generic consumer webmail rather than authenticated corporate servers.")
    if domain_obj and (domain_obj.is_newly_registered or domain_obj.is_fresh):
        summary_parts.append(f"Directs to an unverified domain registered only {domain_obj.age_days or '<30'} days ago.")

    executive_summary = " ".join(summary_parts)
    flags_models = [FlagItem(**f) for f in flags_raw]

    return ScanResponse(
        scan_id=scan_id,
        timestamp=now_iso,
        scan_type=payload.scan_type,
        threat_index=score,
        threat_score=score,
        verdict=verdict,
        verdict_label=verdict_label,
        executive_summary=executive_summary,
        breakdown=breakdown,
        domain_info=domain_obj,
        domain_intelligence=domain_obj,
        flags=flags_models,
        recommendations=recommendations,
        safe_replies=safe_replies,
        sanitized_content=sanitized_body,
    )


@router.post("/scan-file", response_model=ScanResponse, tags=["Inspection"])
async def scan_uploaded_document(
    file: UploadFile = File(...),
    target_url: Optional[str] = Form(default=""),
    sender_email: Optional[str] = Form(default=""),
):
    """
    Accepts uploaded PDF/Image appointment letters or rental agreements,
    runs OCR text extraction, and processes through the threat inspection pipeline.
    """
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds maximum allowed upload size (10 MB).")

    extracted_text, parse_status = extract_document_text(contents, file.filename or "uploaded_file.pdf")
    if not extracted_text:
        raise HTTPException(status_code=422, detail=f"Text extraction failed: {parse_status}")

    req = ScanRequest(
        scan_type="file",
        text=extracted_text,
        content=extracted_text,
        target_url=target_url or "",
        sender_email=sender_email or "",
        uploaded_filename=file.filename,
    )
    return await scan_payload(req)


@router.post("/export-report", tags=["Reporting"])
async def export_forensic_report(req: ReportExportRequest):
    """
    Generates and streams a forensic PDF audit report, Markdown report, or JSON dump of the scan results.
    """
    scan_dict = req.scan_result.model_dump()
    scan_id = req.scan_result.scan_id or "audit"

    if req.format == "pdf":
        pdf_stream = generate_forensic_pdf_report(scan_dict)
        filename = f"KavachAI_Audit_{scan_id}.pdf"
        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    elif req.format == "markdown":
        md_text = generate_forensic_markdown_report(scan_dict)
        filename = f"KavachAI_Audit_{scan_id}.md"
        return PlainTextResponse(
            content=md_text,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    else:
        json_data = generate_forensic_json_report(scan_dict)
        filename = f"KavachAI_Audit_{scan_id}.json"
        return JSONResponse(
            content=json_data,
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )


@router.post("/detect-ai", response_model=AIDetectResponse, tags=["AI Detection"])
async def detect_ai_generated_text(req: AIDetectRequest):
    """
    Evaluates synthetic NLP heuristics, burstiness, and sentence predictability
    to determine if text was authored by an LLM or human.
    """
    text = clean_text(req.text)
    if len(text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text must be at least 20 characters for reliable NLP analysis.")

    # Split into sentences using punctuation boundaries
    raw_sentences = re.split(r"(?<=[.!?])\s+", text)
    sentences = [s.strip() for s in raw_sentences if len(s.strip()) > 5]

    if not sentences:
        sentences = [text]

    # 1. Burstiness: variance of sentence length (in words)
    word_counts = [len(s.split()) for s in sentences]
    mean_wc = sum(word_counts) / len(word_counts) if word_counts else 1.0
    variance_wc = sum((x - mean_wc) ** 2 for x in word_counts) / len(word_counts) if len(word_counts) > 1 else 0.0
    std_dev_wc = math.sqrt(variance_wc)
    burstiness_score = round(std_dev_wc / (mean_wc + 0.001), 2)

    # 2. AI Cliché & Transitional Marker Catalog
    ai_cliche_patterns = [
        (r"\b(furthermore|moreover|in conclusion|to summarize|in summary)\b", "Stereotypical AI transitional formula"),
        (r"\b(it is important to note|it is crucial to understand|it is essential to)\b", "AI conversational filler & framing"),
        (r"\b(delve|tapestry|beacon|testament|seamlessly|paramount|foster|nuanced)\b", "Over-represented LLM vocabulary tokens"),
        (r"\b(plays a pivotal role|serves as a testament|in today's fast-paced world)\b", "Generic synthetic stock phrasing"),
        (r"\b(not only\s+[^,]+,\s+but also)\b", "Rigid parallel rhetorical construction"),
    ]

    flagged_sentences = []
    total_ai_markers = 0

    for s in sentences:
        s_lower = s.lower()
        s_words = len(s.split())
        
        marker_hits = []
        for pat, reason in ai_cliche_patterns:
            if re.search(pat, s_lower):
                marker_hits.append(reason)
                total_ai_markers += 1

        length_deviation = abs(s_words - mean_wc)
        base_perplexity = 45.0 + min(50.0, length_deviation * 3.0)
        if marker_hits:
            base_perplexity -= len(marker_hits) * 15.0

        pseudo_perplexity = max(5.0, min(100.0, base_perplexity))
        is_synthetic = pseudo_perplexity < 40.0 or len(marker_hits) > 0

        if is_synthetic:
            flagged_sentences.append({
                "sentence": s,
                "perplexity_score": round(pseudo_perplexity, 1),
                "is_synthetic": True,
                "reason": marker_hits[0] if marker_hits else "High syntactic uniformity and low perplexity",
            })

    # 3. Overall AI Probability Composite
    marker_ratio = total_ai_markers / max(1, len(sentences))
    synthetic_sentence_ratio = len(flagged_sentences) / max(1, len(sentences))

    raw_ai_prob = (
        (synthetic_sentence_ratio * 45.0) +
        (min(1.0, marker_ratio * 1.5) * 35.0) +
        (max(0.0, (0.5 - min(0.5, burstiness_score)) / 0.5) * 20.0)
    )

    ai_probability = round(max(5.0, min(98.5, raw_ai_prob)), 1)

    if ai_probability >= 70.0:
        verdict = "AI_GENERATED"
        rationale = f"High probability of AI authoring ({ai_probability}%). The text displays characteristic synthetic uniformity (burstiness: {burstiness_score}) and repeated LLM transitional markers across {len(flagged_sentences)} flagged sentence(s)."
    elif ai_probability >= 40.0:
        verdict = "MIXED_SYNTHETIC"
        rationale = f"Moderate likelihood of synthetic editing ({ai_probability}%). Analysis detected mixed human and machine-generated traits with {len(flagged_sentences)} repetitive structural cadence(s)."
    else:
        verdict = "HUMAN_WRITTEN"
        rationale = f"High human authoring markers detected ({100.0 - ai_probability}% human confidence). The text features natural syntactic variance (burstiness: {burstiness_score}) and minimal formulaic cliches."

    return AIDetectResponse(
        ai_probability=ai_probability,
        burstiness_score=burstiness_score,
        verdict=verdict,
        flagged_sentences=flagged_sentences,
        summary_rationale=rationale,
    )
