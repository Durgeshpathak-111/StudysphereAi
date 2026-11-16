import re
import io
import fitz
from docx import Document as DocxDocument
from typing import List, Dict

def clean_text(raw: str) -> str:
    return re.sub(r"\s+", " ", raw).strip()

def extract_pages_from_bytes(file_bytes: bytes, filename: str) -> List[Dict]:
    lower = filename.lower()
    pages = []

    if lower.endswith(".pdf"):
        pdf = fitz.open(stream=file_bytes, filetype="pdf")
        for idx, page in enumerate(pdf):
            cleaned = clean_text(page.get_text("text"))
            if cleaned:
                pages.append({"page_number": idx + 1, "text": cleaned})
        pdf.close()

    elif lower.endswith(".docx"):
        doc = DocxDocument(io.BytesIO(file_bytes))
        paragraphs = [clean_text(p.text) for p in doc.paragraphs if clean_text(p.text)]
        batch_size = 15
        for i in range(0, len(paragraphs), batch_size):
            combined = " ".join(paragraphs[i : i + batch_size])
            if combined:
                pages.append({"page_number": (i // batch_size) + 1, "text": combined})

    elif lower.endswith(".txt"):
        decoded = file_bytes.decode("utf-8", errors="ignore")
        cleaned = clean_text(decoded)
        if cleaned:
            pages.append({"page_number": 1, "text": cleaned})

    else:
        raise ValueError("Unsupported file extension.")

    if not pages:
        raise ValueError("Document contains no extractable text.")

    return pages

def chunk_pages(pages: List[Dict], chunk_size: int = 850, overlap: int = 150) -> List[Dict]:
    chunks = []
    chunk_idx = 0

    for page in pages:
        text = page["text"]
        page_num = page["page_number"]
        start = 0
        while start < len(text):
            end = start + chunk_size
            piece = text[start:end].strip()
            if len(piece) > 30:
                chunks.append({
                    "chunk_index": chunk_idx,
                    "page_number": page_num,
                    "text": piece
                })
                chunk_idx += 1
            start += chunk_size - overlap

    return chunks

def extract_keywords_and_topics(full_text: str) -> Dict[str, List[str]]:
    stopwords = {
        "the", "and", "for", "that", "this", "with", "from", "are", "was", "were",
        "have", "has", "had", "not", "but", "what", "when", "where", "which", "who",
        "will", "can", "into", "their", "they", "them", "these", "those", "such",
        "also", "used", "using", "each", "other", "than", "then", "more", "most"
    }
    words = re.findall(r"\b[A-Za-z][A-Za-z0-9\-]{3,}\b", full_text)
    freq = {}
    for w in words:
        lw = w.lower()
        if lw not in stopwords:
            freq[lw] = freq.get(lw, 0) + 1

    sorted_terms = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    keywords = [term.capitalize() for term, _ in sorted_terms[:10]]
    topics = [term.title() for term, _ in sorted_terms[:4]]
    return {"topics": topics, "keywords": keywords}