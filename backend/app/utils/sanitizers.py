import re
import html
import unicodedata
from urllib.parse import urlparse
from typing import List


def clean_text(raw_text: str) -> str:
    """
    Normalizes whitespace, strips non-printable/zero-width Unicode characters,
    unescapes HTML entities, and sanitizes dangerous script/iframe tags.
    """
    if not raw_text:
        return ""
    
    # Remove script, style, and iframe tags along with their inner content
    sanitized = re.sub(r"<(script|style|iframe)[^>]*>.*?</\1>", "", raw_text, flags=re.DOTALL | re.IGNORECASE)
    
    # Strip remaining HTML tags
    sanitized = re.sub(r"<[^>]+>", " ", sanitized)
    
    # Unescape HTML entities
    sanitized = html.unescape(sanitized)
    
    # Strip zero-width spaces and control characters (except newline/tab)
    sanitized = "".join(
        ch for ch in sanitized
        if unicodedata.category(ch)[0] != "C" or ch in ("\n", "\r", "\t")
    )
    
    # Normalize line breaks and excess horizontal whitespace
    sanitized = re.sub(r"\r\n|\r", "\n", sanitized)
    sanitized = re.sub(r"[ \t]+", " ", sanitized)
    
    # Limit consecutive newlines to maximum of 2
    sanitized = re.sub(r"\n{3,}", "\n\n", sanitized)
    
    return sanitized.strip()


# Backwards compatibility alias
sanitize_text = clean_text


def extract_domain(url_or_domain: str) -> str:
    """
    Uses urllib.parse to extract clean root FQDN (hostname) from
    full URLs, email addresses, or raw domain strings.
    """
    if not url_or_domain:
        return ""
    
    raw = url_or_domain.strip().lower()
    
    # If text is an email address (e.g. user@domain.com), extract domain part
    if "@" in raw and not raw.startswith(("http://", "https://")):
        raw = raw.split("@")[-1]
    
    # Ensure scheme for proper urlparse handling
    if not raw.startswith(("http://", "https://")):
        raw = "https://" + raw
        
    parsed = urlparse(raw)
    hostname = parsed.hostname or ""
    
    # Remove port if present and strip leading/trailing dots
    hostname = hostname.split(":")[0].strip(".")
    return hostname


# Backwards compatibility alias
clean_domain_from_url = extract_domain


def extract_emails(text: str) -> List[str]:
    """
    Regex extractor for email addresses contained within text bodies.
    Returns deduplicated list of lowercase email addresses.
    """
    if not text:
        return []
    
    email_pattern = re.compile(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        re.IGNORECASE
    )
    matches = email_pattern.findall(text)
    return list(dict.fromkeys([m.lower() for m in matches]))


def extract_urls(text: str) -> List[str]:
    """
    Extracts all HTTP/HTTPS and bare domain URLs from a text payload.
    """
    if not text:
        return []
    
    url_pattern = re.compile(
        r"(?:https?://[^\s/$.?#].[^\s]*)|(?:\b[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.(?:com|org|net|xyz|top|info|biz|cc|io|co|in|live|shop|me|site|click|online|tech|app)(?:/[^\s]*)?)",
        re.IGNORECASE,
    )
    matches = url_pattern.findall(text)
    
    cleaned: List[str] = []
    for m in matches:
        m_clean = re.sub(r"[,\.\)\];\'\"]+$", "", m.strip())
        if m_clean and m_clean not in cleaned:
            cleaned.append(m_clean)
    return cleaned
