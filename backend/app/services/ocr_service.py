import io
from typing import Tuple
from pypdf import PdfReader
from PIL import Image
from app.utils.sanitizers import clean_text


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, str]:
    """
    Extracts selectable text content from a PDF document using pypdf.
    """
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_pages.append(page_text.strip())

        full_text = "\n\n".join(extracted_pages)
        if not full_text.strip():
            return "", "PDF parsed successfully but contained no embedded text streams (may be a scanned image)."
        
        normalized = clean_text(full_text)
        return normalized, f"Successfully parsed {len(reader.pages)} PDF page(s)."
    except Exception as e:
        return "", f"Failed to parse PDF document: {str(e)}"


def extract_text_from_image(file_bytes: bytes) -> Tuple[str, str]:
    """
    Extracts text from an image (PNG, JPG, WEBP) using pytesseract with graceful fallback.
    """
    try:
        import pytesseract
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        if text.strip():
            normalized = clean_text(text)
            return normalized, "Successfully extracted text via OCR optical recognition."
        return "", "Image processed via OCR but no legible text was recognized."
    except Exception as e:
        return "", f"OCR binary unavailable or image parse error: {str(e)}"


def extract_document_text(file_bytes: bytes, filename: str) -> Tuple[str, str]:
    """
    Dispatches document to appropriate text extractor based on file extension.
    """
    fn_lower = filename.lower()
    if fn_lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif fn_lower.endswith((".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff")):
        return extract_text_from_image(file_bytes)
    elif fn_lower.endswith((".txt", ".md", ".csv", ".json")):
        try:
            decoded = file_bytes.decode("utf-8", errors="replace")
            return clean_text(decoded), "Plaintext document decoded successfully."
        except Exception as e:
            return "", f"Failed to decode text document: {str(e)}"
    else:
        return "", f"Unsupported file type: '{filename}'. Supported formats: PDF, PNG, JPG, TXT."
