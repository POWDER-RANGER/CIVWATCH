"""
Municipal PDF parser for agendas, meeting minutes, ordinances, and contracts.
Uses pdfplumber for text extraction with document-type-specific structuring.
"""

import re
import io
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse

import httpx
import pdfplumber
import structlog

logger = structlog.get_logger()

class PDFParser:
    """Parse municipal PDFs into structured CIVWATCH records."""
    
    # Document type detection patterns
    DOC_PATTERNS = {
        "agenda": [r'agenda', r'call to order', r'roll call', r'old business', r'new business'],
        "minutes": [r'minutes', r'minute of', r'call to order.*\d{1,2}:\d{2}', r'present:', r'absent:'],
        "ordinance": [r'ordinance', r'be it ordained', r'an ordinance'],
        "contract": [r'contract', r'agreement', r'this agreement', r'contractor', r'purchase order'],
    }
    
    # Vote extraction patterns
    VOTE_PATTERNS = [
        r'(\w+(?:\s+\w+)?)\s*[-–—]\s*(aye|yes|no|nay|abstain|absent|present)',
        r'(aye|yes|no|nay|abstain)\s*[:;]?\s*([\w\s,]+)',
        r'vote\s*[:;]?\s*(\d+)\s*[-–—]\s*(\d+)',
        r'(unanimous|carried|defeated|approved|denied)',
    ]
    
    def __init__(self):
        self.stats = {"parsed": 0, "errors": 0}
    
    def detect_doc_type(self, text: str) -> str:
        """Auto-detect document type from content."""
        text_lower = text.lower()
        scores = {}
        
        for doc_type, patterns in self.DOC_PATTERNS.items():
            score = sum(1 for p in patterns if re.search(p, text_lower))
            scores[doc_type] = score
        
        if max(scores.values(), default=0) > 0:
            return max(scores, key=scores.get)
        return "document"
    
    def extract_votes(self, text: str) -> List[Dict[str, Any]]:
        """Extract vote records from meeting minutes."""
        votes = []
        for pattern in self.VOTE_PATTERNS:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                groups = match.groups()
                if len(groups) >= 2:
                    votes.append({
                        "person": groups[0].strip(),
                        "vote": groups[1].lower(),
                        "context": text[max(0, match.start()-50):match.end()+50]
                    })
                elif len(groups) == 1:
                    votes.append({
                        "result": groups[0].lower(),
                        "context": text[max(0, match.start()-50):match.end()+50]
                    })
        return votes
    
    def extract_dates(self, text: str) -> List[str]:
        """Extract dates mentioned in document."""
        date_patterns = [
            r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',
            r'\b\d{1,2}-\d{1,2}-\d{2,4}\b',
            r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b',
        ]
        dates = []
        for pattern in date_patterns:
            dates.extend(re.findall(pattern, text))
        return dates
    
    def extract_money(self, text: str) -> List[Dict[str, Any]]:
        """Extract dollar amounts from document."""
        money_pattern = r'\$[\d,]+\.?\d*\s*(?:million|billion|thousand)?'
        matches = re.finditer(money_pattern, text, re.IGNORECASE)
        return [{"amount": m.group(), "context": text[max(0, m.start()-30):m.end()+30]} for m in matches]
    
    def extract_agenda_items(self, text: str) -> List[Dict[str, Any]]:
        """Extract numbered agenda items."""
        items = []
        # Pattern: numbered items like "1.", "II.", "A."
        pattern = r'(?:^|\n)\s*(\d+\.|[IVX]+\.|[A-Z]\.)\s+(.+?)(?=\n\s*(?:\d+\.|[IVX]+\.|[A-Z]\.)|\Z)'
        matches = re.finditer(pattern, text, re.MULTILINE | re.DOTALL)
        for m in matches:
            items.append({
                "number": m.group(1),
                "text": m.group(2).strip().replace('\n', ' ')
            })
        return items
    
    async def parse_from_url(self, url: str, doc_type: str = "auto") -> Dict[str, Any]:
        """Download and parse a PDF from a URL."""
        logger.info("Downloading PDF", url=url)
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            
        return await self.parse_bytes(resp.content, doc_type=doc_type, source_url=url)
    
    async def parse_bytes(
        self,
        pdf_bytes: bytes,
        doc_type: str = "auto",
        source_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Parse PDF bytes into structured data."""
        try:
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                # Extract all text
                full_text_parts = []
                tables = []
                
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text_parts.append(text)
                    
                    # Extract tables
                    page_tables = page.extract_tables()
                    for table in page_tables:
                        tables.append(table)
                
                full_text = "\n".join(full_text_parts)
                
                # Detect document type
                detected_type = self.detect_doc_type(full_text) if doc_type == "auto" else doc_type
                
                # Build structured data
                structured = {
                    "doc_type": detected_type,
                    "page_count": len(pdf.pages),
                    "word_count": len(full_text.split()),
                    "extracted_dates": self.extract_dates(full_text),
                    "tables_found": len(tables),
                }
                
                # Type-specific extractions
                if detected_type in ("agenda", "minutes"):
                    structured["agenda_items"] = self.extract_agenda_items(full_text)
                    structured["votes"] = self.extract_votes(full_text)
                
                if detected_type in ("minutes",):
                    structured["attendance"] = self._extract_attendance(full_text)
                
                if detected_type == "contract":
                    structured["monetary_values"] = self.extract_money(full_text)
                    structured["parties"] = self._extract_parties(full_text)
                
                if detected_type == "ordinance":
                    structured["ordinance_number"] = self._extract_ordinance_number(full_text)
                    structured["monetary_values"] = self.extract_money(full_text)
                
                # Build normalized CIVWATCH record
                record = {
                    "title": self._extract_title(full_text, detected_type),
                    "source_url": source_url or "",
                    "published_date": structured["extracted_dates"][0] if structured["extracted_dates"] else None,
                    "doc_type": detected_type,
                    "entity_type": "municipal_document",
                    "full_text": full_text,
                    "structured_data": structured,
                }
                
                self.stats["parsed"] += 1
                
                return {
                    "success": True,
                    "record": record,
                    "stats": self.stats,
                }
                
        except Exception as e:
            self.stats["errors"] += 1
            logger.error("PDF parse failed", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "stats": self.stats,
            }
    
    def _extract_attendance(self, text: str) -> Dict[str, List[str]]:
        """Extract attendance lists from meeting minutes."""
        attendance = {"present": [], "absent": [], "excused": []}
        
        # Look for attendance sections
        present_match = re.search(r'[Pp]resent[:;]\s*([\w\s,]+?)(?:\n|$)', text)
        absent_match = re.search(r'[Aa]bsent[:;]\s*([\w\s,]+?)(?:\n|$)', text)
        
        if present_match:
            attendance["present"] = [n.strip() for n in present_match.group(1).split(",") if n.strip()]
        if absent_match:
            attendance["absent"] = [n.strip() for n in absent_match.group(1).split(",") if n.strip()]
        
        return attendance
    
    def _extract_parties(self, text: str) -> List[str]:
        """Extract party names from contracts."""
        parties = []
        party_patterns = [
            r'between\s+(.+?)\s+and\s+(.+?)(?:,|\n)',
            r'(City\s+of\s+[\w\s]+)',
            r'(County\s+of\s+[\w\s]+)',
        ]
        for pattern in party_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for m in matches:
                parties.extend(m.groups())
        return list(set(p.strip() for p in parties if len(p.strip()) > 3))
    
    def _extract_ordinance_number(self, text: str) -> Optional[str]:
        """Extract ordinance number."""
        match = re.search(r'[Oo]rdinance\s+[#]?\s*(\d+[-\w]*)', text)
        return match.group(1) if match else None
    
    def _extract_title(self, text: str, doc_type: str) -> str:
        """Extract document title from first lines."""
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        if not lines:
            return f"Untitled {doc_type}"
        
        # First non-short line is usually the title
        for line in lines[:5]:
            if len(line) > 10 and len(line) < 200:
                return line
        
        return lines[0][:200] if lines else f"Untitled {doc_type}"
