import re
from typing import List, Dict, Any, Tuple
from app.api.v1.schemas import FlagItem


RULE_DEFINITIONS = [
    # -------------------------------------------------------------------------
    # 1. ADVANCE-FEE & EQUIPMENT CHEQUE TRAPS
    # -------------------------------------------------------------------------
    {
        "id": "ADV_FEE_EQUIPMENT_DEPOSIT",
        "category": "ADVANCE_FEE",
        "severity": "CRITICAL",
        "title": "Refundable Security or Equipment Deposit Demanded",
        "regex": re.compile(
            r"(?:refundable\s+(?:security\s+)?deposit|equipment\s+deposit|refundable\s+training\s+fee|"
            r"laptop\s+deposit|onboarding\s+fee|insurance\s+fee|mandatory\s+refundable\s+amount|"
            r"deposit\s+required\s+prior\s+to|holding\s+deposit|application\s+fee|equipment\s+fee|"
            r"purchase\s+(?:equipment\s+)?from\s+(?:our\s+)?(?:approved\s+)?vendor|vendor\s+procurement\s+fee)",
            re.IGNORECASE,
        ),
        "weight": 35,
        "recommendation": "Legitimate enterprise employers NEVER require candidates to pay upfront deposits or training fees for company equipment.",
    },
    {
        "id": "ADV_FEE_FAKE_CHECK_TRAP",
        "category": "ADVANCE_FEE",
        "severity": "CRITICAL",
        "title": "Cashier Check / Overpayment Reimbursement Trap",
        "regex": re.compile(
            r"(?:deposit\s+(?:a\s+|our\s+)?(?:cashier\'?s?\s+)?check|send\s+(?:a\s+)?check|mail\s+you\s+a\s+check|"
            r"check\s+will\s+be\s+issued\s+for\s+equipment|deposit\s+the\s+check\s+and\s+(?:wire|send|forward)|"
            r"deduct\s+your\s+pay\s+and\s+send\s+the\s+rest|reimburse\s+the\s+vendor\s+with\s+the\s+difference)",
            re.IGNORECASE,
        ),
        "weight": 35,
        "recommendation": "Scammers issue fraudulent checks and instruct victims to deposit them, transferring money back before the bank discovers the forged check.",
    },
    {
        "id": "ADV_FEE_PAYMENT_VECTORS",
        "category": "ADVANCE_FEE",
        "severity": "CRITICAL",
        "title": "Irreversible / Non-Corporate Payment Vector Demanded",
        "regex": re.compile(
            r"(?:bitcoin|btc\s+wallet|ethereum|usdt|crypto\s+wallet|zelle|cash\s*app|venmo|"
            r"western\s+union|moneygram|gift\s+cards?|apple\s+gift\s+card|steam\s+wallet|"
            r"google\s+play\s+card|wire\s+transfer\s+to\s+personal|wire\s+the\s+funds)",
            re.IGNORECASE,
        ),
        "weight": 30,
        "recommendation": "Demands for payments via cryptocurrency, Zelle, CashApp, or gift cards are near-certain indicators of advance-fee scams.",
    },
    {
        "id": "ADV_FEE_SPECIFIC_AMOUNT",
        "category": "ADVANCE_FEE",
        "severity": "CRITICAL",
        "title": "Monetary Advance Payment Conditioned for Employment",
        "regex": re.compile(
            r"(?:(?:deposit|pay|wire|transfer|send)\s+(?:an?\s+amount\s+of\s+)?(?:\$|€|£|₹|inr|usd)\s*(\d{2,6})|"
            r"(?:(?:\$|€|£|₹|inr|usd)\s*(\d{2,6})\s+(?:refundable|deposit|processing\s+fee|training\s+fee)))",
            re.IGNORECASE,
        ),
        "weight": 25,
        "recommendation": "Official corporate hiring never conditions employment on the candidate transferring money.",
    },

    # -------------------------------------------------------------------------
    # 2. OFF-PLATFORM COMMUNICATION REDIRECTS
    # -------------------------------------------------------------------------
    {
        "id": "OFF_PLATFORM_TELEGRAM",
        "category": "OFF_PLATFORM",
        "severity": "WARNING",
        "title": "Redirection to Unmonitored Telegram Channel",
        "regex": re.compile(
            r"(?:telegram\s*(?::|at|@|\.me/)|t\.me/[a-zA-Z0-9_]+|@\w{3,}(?=\s+(?:on\s+telegram|telegram\s+handle|hr\s+telegram|recruiter)))",
            re.IGNORECASE,
        ),
        "weight": 20,
        "recommendation": "Legitimate recruiters do not conduct official HR interviews or finalize employment contracts via Telegram channels.",
    },
    {
        "id": "OFF_PLATFORM_WHATSAPP_SIGNAL",
        "category": "OFF_PLATFORM",
        "severity": "WARNING",
        "title": "Redirection to Consumer Mobile Messaging (WhatsApp / Signal)",
        "regex": re.compile(
            r"(?:wa\.me/[0-9]+|whatsapp(?:\s+interview|\s+recruiter|\s+chat|\s+number|\s+me)|signal\s+messenger|viber\s+chat|discord\.gg/[a-zA-Z0-9]+)",
            re.IGNORECASE,
        ),
        "weight": 15,
        "recommendation": "Directing candidates away from corporate email or official portals to consumer messaging apps is a standard scam evasion tactic.",
    },

    # -------------------------------------------------------------------------
    # 3. RENTAL FRAUD PATTERNS
    # -------------------------------------------------------------------------
    {
        "id": "RENTAL_WIRE_BEFORE_VIEWING",
        "category": "RENTAL_FRAUD",
        "severity": "CRITICAL",
        "title": "Rental Wire Transfer Demanded Prior to Physical Viewing",
        "regex": re.compile(
            r"(?:wire\s+(?:the\s+)?(?:first\s+month|deposit|rent)\s+before\s+(?:viewing|inspecting|moving\s+in)|"
            r"keys?\s+will\s+be\s+(?:dispatched|mailed|couriered|sent\s+by\s+fedex)|"
            r"landlord\s+is\s+(?:currently\s+abroad|out\s+of\s+(?:the\s+)?country|on\s+a\s+missionary|in\s+the\s+military)|"
            r"deposit\s+required\s+prior\s+to\s+viewing)",
            re.IGNORECASE,
        ),
        "weight": 35,
        "recommendation": "Never wire money or rental deposits for properties you or an authorized representative have not physically inspected in person.",
    },

    # -------------------------------------------------------------------------
    # 4. ARTIFICIAL URGENCY & UNREALISTIC OFFERS
    # -------------------------------------------------------------------------
    {
        "id": "URGENCY_PRESSURE_TACTICS",
        "category": "URGENCY",
        "severity": "WARNING",
        "title": "Coercive Time Urgency & Immediate Forfeiture Pressure",
        "regex": re.compile(
            r"(?:offer\s+(?:will\s+expire|expires)\s+in\s+(?:\d{1,2}\s+hours?|immediately|24\s+hours)|"
            r"failure\s+to\s+(?:pay|deposit|respond)\s+will\s+(?:forfeit|cancel)\s+your\s+(?:position|offer|candidacy)|"
            r"transfer\s+within\s+\d{1,2}\s+hours|immediate\s+action\s+required\s+to\s+claim)",
            re.IGNORECASE,
        ),
        "weight": 15,
        "recommendation": "Scammers enforce tight artificial deadlines to induce panic and prevent victims from conducting due diligence.",
    },
    {
        "id": "UNREALISTIC_OFFER_TRAP",
        "category": "URGENCY",
        "severity": "WARNING",
        "title": "Unrealistic Compensation / Hired Without Interview",
        "regex": re.compile(
            r"(?:hired\s+without\s+(?:an?\s+)?interview|no\s+experience\s+(?:required\s+)?(?:\$|€|£|₹)\s*[5-9]\d{1,2}\s*/\s*hr|"
            r"earn\s+(?:\$|€|£|₹)\s*\d{3,5}\s+daily\s+from\s+home|immediate\s+job\s+offer\s+without\s+application)",
            re.IGNORECASE,
        ),
        "weight": 20,
        "recommendation": "Offers with exorbitant compensation for entry-level tasks or positions without formal interviews are typical phishing hooks.",
    },
]


def evaluate_regex_rules(text: str) -> List[Dict[str, Any]]:
    """
    Scans input text against pre-compiled heuristic regex patterns.
    Returns list of matched flag dictionaries with exact character start and end indices.
    """
    if not text:
        return []

    flags: List[Dict[str, Any]] = []
    seen_matches = set()

    for rule in RULE_DEFINITIONS:
        for match in rule["regex"].finditer(text):
            matched_span_text = match.group(0)
            start_idx = match.start()
            end_idx = match.end()

            dedup_key = (rule["id"], start_idx, end_idx)
            if dedup_key in seen_matches:
                continue
            seen_matches.add(dedup_key)

            flags.append({
                "id": f"{rule['id']}_{len(flags) + 1}",
                "category": rule["category"],
                "severity": rule["severity"],
                "title": rule["title"],
                "detail": rule["title"],
                "matched_text": matched_span_text,
                "snippet": matched_span_text,
                "start_index": start_idx,
                "end_index": end_idx,
                "weight": rule["weight"],
                "recommendation": rule["recommendation"],
            })

    return flags


def scan_text_patterns(text: str) -> Tuple[List[FlagItem], int, int, int]:
    """
    High-level pattern scanner returning:
    - flags: List[FlagItem] models with exact offsets
    - payment_score: Contribution score from advance-fee/rental payment patterns
    - channel_score: Contribution score from off-platform redirects
    - urgency_score: Contribution score from urgency/unrealistic traps
    """
    raw_flags = evaluate_regex_rules(text)
    
    payment_raw = 0
    channel_raw = 0
    urgency_raw = 0

    flag_models: List[FlagItem] = []
    for f in raw_flags:
        cat = f["category"]
        wt = f["weight"]
        if cat in ("ADVANCE_FEE", "RENTAL_FRAUD"):
            payment_raw += wt
        elif cat == "OFF_PLATFORM":
            channel_raw += wt
        elif cat == "URGENCY":
            urgency_raw += wt
            
        flag_models.append(FlagItem(**f))

    # Calculate normalized category scores (0-100)
    payment_score = min(100, int((payment_raw / 35.0) * 100)) if payment_raw > 0 else 0
    channel_score = min(100, int((channel_raw / 20.0) * 100)) if channel_raw > 0 else 0
    urgency_score = min(100, int((urgency_raw / 20.0) * 100)) if urgency_raw > 0 else 0

    return flag_models, payment_score, channel_score, urgency_score
