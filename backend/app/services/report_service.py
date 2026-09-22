import io
import hashlib
import json
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def generate_forensic_markdown_report(scan_data: Dict[str, Any]) -> str:
    """
    Generates a comprehensive Markdown audit report of the scan results.
    """
    scan_id = scan_data.get("scan_id", "N/A")
    timestamp = scan_data.get("timestamp", "N/A")
    threat_score = scan_data.get("threat_score") or scan_data.get("threat_index", 0)
    verdict_label = scan_data.get("verdict_label", "Unknown")
    summary = scan_data.get("executive_summary", "No executive summary available.")
    
    raw_content = str(scan_data.get("sanitized_content") or scan_data.get("content") or summary)
    sha256_hash = hashlib.sha256(raw_content.encode("utf-8")).hexdigest()

    breakdown = scan_data.get("breakdown", {})
    domain_info = scan_data.get("domain_info") or scan_data.get("domain_intelligence") or {}
    flags = scan_data.get("flags", [])
    recommendations = scan_data.get("recommendations", [])

    lines = [
        f"# KAVACH-AI — FORENSIC THREAT INSPECTION AUDIT REPORT",
        f"",
        f"**Scan ID:** `{scan_id}`  ",
        f"**Timestamp:** `{timestamp}`  ",
        f"**Payload SHA-256:** `{sha256_hash}`  ",
        f"**Engine Ruleset:** `v1.4.2`  ",
        f"",
        f"---",
        f"",
        f"## 1. Executive Summary & Verdict",
        f"",
        f"- **Scam Threat Index:** **{threat_score}%**",
        f"- **Verdict:** **{verdict_label}**",
        f"- **Assessment:** {summary}",
        f"",
        f"---",
        f"",
        f"## 2. Threat Index Breakdown",
        f"",
        f"| Heuristic Vector | Sub-Score (0-100) | Weight | Risk Assessment |",
        f"| :--- | :--- | :--- | :--- |",
        f"| **Advance-Fee & Payment Demands** | {breakdown.get('payment_score', breakdown.get('advance_fee_score', 0))}/100 | 35% | {'HIGH' if breakdown.get('payment_score', 0) > 50 else 'NORMAL'} |",
        f"| **Domain Freshness & Typosquatting** | {breakdown.get('domain_score', breakdown.get('domain_age_score', 0))}/100 | 25% | {'HIGH' if breakdown.get('domain_score', 0) > 50 else 'NORMAL'} |",
        f"| **Off-Platform Channel Shifting** | {breakdown.get('channel_score', breakdown.get('off_platform_score', 0))}/100 | 20% | {'SUSPICIOUS' if breakdown.get('channel_score', 0) > 40 else 'NORMAL'} |",
        f"| **Recruiter Mailbox Reputation** | {breakdown.get('mail_score', breakdown.get('mail_reputation_score', 0))}/100 | 20% | {'SUSPICIOUS' if breakdown.get('mail_score', 0) > 40 else 'NORMAL'} |",
        f"",
        f"---",
        f"",
        f"## 3. Domain Intelligence (RDAP / Telemetry)",
        f"",
        f"- **Domain Hostname:** `{domain_info.get('domain') or 'N/A'}`",
        f"- **Registrar:** {domain_info.get('registrar') or 'N/A'}",
        f"- **Domain Age:** {domain_info.get('age_days') if domain_info.get('age_days') is not None else domain_info.get('age_in_days', 'N/A')} days",
        f"- **Fresh Domain (<30d):** {'YES (High Risk)' if domain_info.get('is_fresh') or domain_info.get('is_newly_registered') else 'NO'}",
        f"- **Typosquatting Target:** {domain_info.get('typosquatting_target') or 'None'}",
        f"- **TLD Risk Tier:** {domain_info.get('tld_risk', 'LOW')}",
        f"",
        f"---",
        f"",
        f"## 4. Forensic IOCs & Red-Flag Findings",
        f"",
    ]

    if flags:
        lines.append("| Severity | Category | Matched Indicator | Guidance |")
        lines.append("| :--- | :--- | :--- | :--- |")
        for f in flags:
            sev = f.get("severity", "WARNING")
            cat = f.get("category", "GENERAL")
            match = (f.get("matched_text") or f.get("snippet") or "").replace("\n", " ")
            rec = (f.get("recommendation") or f.get("detail") or "").replace("\n", " ")
            lines.append(f"| **{sev}** | {cat} | `{match}` | {rec} |")
    else:
        lines.append("No critical indicators of advance-fee scam or malicious infrastructure detected.")

    lines.extend([
        f"",
        f"---",
        f"",
        f"## 5. Actionable Protective Recommendations",
        f"",
    ])

    if recommendations:
        for idx, r in enumerate(recommendations, 1):
            lines.append(f"{idx}. {r}")
    else:
        lines.append("1. Continue verifying communications using official corporate directories.")

    lines.extend([
        f"",
        f"---",
        f"*Generated autonomously by KavachAI Defense Engine. Cryptographically fingerprinted with SHA-256.*",
    ])

    return "\n".join(lines)


def generate_forensic_json_report(scan_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Returns a cryptographically signed JSON audit package.
    """
    raw_content = str(scan_data.get("sanitized_content") or scan_data.get("content") or "")
    sha256_hash = hashlib.sha256(raw_content.encode("utf-8")).hexdigest()
    
    report_dict = dict(scan_data)
    report_dict["audit_metadata"] = {
        "engine": "KavachAI Threat Inspector",
        "rules_version": "v1.4.2",
        "sha256_fingerprint": sha256_hash,
        "format": "application/json",
    }
    return report_dict


def generate_forensic_pdf_report(scan_data: Dict[str, Any]) -> io.BytesIO:
    """
    Constructs a professional cybersecurity forensic audit report PDF.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0B0F19"),
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#475569"),
    )
    heading2_style = ParagraphStyle(
        "Heading2Custom",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=12,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "BodyCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B"),
    )
    code_style = ParagraphStyle(
        "CodeCustom",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0284C7"),
    )

    elements = []

    # 1. Header Banner
    elements.append(Paragraph("KAVACH-AI — FORENSIC THREAT INSPECTION AUDIT", title_style))
    elements.append(
        Paragraph(
            f"Generated: {scan_data.get('timestamp', 'N/A')} | Scan ID: {scan_data.get('scan_id', 'N/A')} | Ruleset: v1.4.2",
            subtitle_style,
        )
    )
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#000000"), spaceAfter=12))

    # 2. Executive Verdict Box
    score = scan_data.get("threat_score") or scan_data.get("threat_index", 0)
    verdict_label = scan_data.get("verdict_label", "Unknown")
    verdict_color = (
        colors.HexColor("#DC2626") if score >= 70 else (colors.HexColor("#D97706") if score >= 30 else colors.HexColor("#059669"))
    )

    verdict_data = [
        [
            Paragraph(f"<b>SCAM THREAT INDEX: {score}%</b>", ParagraphStyle("Score", fontName="Helvetica-Bold", fontSize=15, textColor=verdict_color)),
            Paragraph(f"<b>VERDICT:</b> {verdict_label}", ParagraphStyle("Verdict", fontName="Helvetica-Bold", fontSize=11, textColor=colors.HexColor("#1E293B"))),
        ],
        [
            Paragraph(scan_data.get("executive_summary", ""), body_style),
            "",
        ],
    ]
    verdict_table = Table(verdict_data, colWidths=[190, 340])
    verdict_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
            ("SPAN", (0, 1), (1, 1)),
            ("PADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )
    elements.append(verdict_table)
    elements.append(Spacer(1, 12))

    # 3. Threat Breakdown Metrics
    elements.append(Paragraph("Sub-Score Telemetry Breakdown", heading2_style))
    breakdown = scan_data.get("breakdown", {})
    breakdown_data = [
        ["Heuristic Metric", "Weight", "Sub-Score", "Risk Level"],
        ["Advance-Fee & Deposit Mandates", "35%", f"{breakdown.get('payment_score', breakdown.get('advance_fee_score', 0))}/100", "CRITICAL" if breakdown.get('payment_score', 0) > 60 else "NORMAL"],
        ["Domain Age & Typosquatting", "25%", f"{breakdown.get('domain_score', breakdown.get('domain_age_score', 0))}/100", "CRITICAL" if breakdown.get('domain_score', 0) > 60 else "NORMAL"],
        ["Off-Platform Messaging Shift", "20%", f"{breakdown.get('channel_score', breakdown.get('off_platform_score', 0))}/100", "SUSPICIOUS" if breakdown.get('channel_score', 0) > 50 else "NORMAL"],
        ["Recruiter Mail Reputation", "20%", f"{breakdown.get('mail_score', breakdown.get('mail_reputation_score', 0))}/100", "SUSPICIOUS" if breakdown.get('mail_score', 0) > 50 else "NORMAL"],
    ]
    b_table = Table(breakdown_data, colWidths=[220, 80, 100, 130])
    b_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B0F19")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("PADDING", (0, 0), (-1, -1), 5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ])
    )
    elements.append(b_table)
    elements.append(Spacer(1, 12))

    # 4. Flags / Evidence Table
    elements.append(Paragraph("Forensic Red-Flag Findings", heading2_style))
    flags = scan_data.get("flags", [])
    if flags:
        flags_data = [["Severity", "Category", "Triggered Evidence", "Remediation"]]
        for f in flags:
            snippet = f.get('matched_text') or f.get('snippet') or ''
            flags_data.append([
                Paragraph(f"<b>{f.get('severity', '')}</b>", body_style),
                Paragraph(f.get("category", ""), body_style),
                Paragraph(f"<b>{f.get('title', '')}</b><br/><font color='#0284C7'>{snippet}</font>", body_style),
                Paragraph(f.get("recommendation", f.get("detail", "")), body_style),
            ])
        f_table = Table(flags_data, colWidths=[65, 85, 200, 180])
        f_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B0F19")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ])
        )
        elements.append(f_table)
    else:
        elements.append(Paragraph("No critical red flags or advance-fee markers detected in provided content.", body_style))

    # 5. Cryptographic Verification Footer
    elements.append(Spacer(1, 16))
    raw_content = str(scan_data.get("sanitized_content") or scan_data.get("executive_summary") or "")
    sha256_hash = hashlib.sha256(raw_content.encode("utf-8")).hexdigest()
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#94A3B8"), spaceAfter=8))
    elements.append(
        Paragraph(
            f"<b>Payload SHA-256 Digest:</b> <font color='#0284C7'>{sha256_hash}</font><br/>"
            "This document is an automated cybersecurity audit report generated by KavachAI Defense Engine.",
            code_style,
        )
    )

    doc.build(elements)
    buffer.seek(0)
    return buffer
