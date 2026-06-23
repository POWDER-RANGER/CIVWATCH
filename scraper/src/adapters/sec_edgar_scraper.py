"""
SEC EDGAR scraper adapter.
Fully open, no API key required.
Handles filing searches, full-text retrieval, and lobbying disclosure extraction.
"""

import re
from typing import Optional, List, Dict, Any
from bs4 import BeautifulSoup
import structlog

from src.utils.http import BaseScraper

logger = structlog.get_logger()

class SECEdgarScraper(BaseScraper):
    """Scraper for SEC EDGAR filings with lobbying extraction."""
    
    def __init__(self):
        super().__init__(
            base_url="https://www.sec.gov/Archives",
            rate_limit_delay=0.1,  # SEC requires 10 req/sec max
            max_retries=3,
            timeout=30.0,
            headers={
                "User-Agent": "CIVWATCH (github.com/POWDER-RANGER/CIVWATCH)"
            }
        )
        self.search_base = "https://efts.sec.gov/LATEST/search-index"
    
    async def search_filings(
        self,
        cik: Optional[str] = None,
        ticker: Optional[str] = None,
        form_type: Optional[str] = None,
        date_range: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Search SEC EDGAR filings."""
        # Use SEC full-text search
        params: Dict[str, Any] = {
            "q": "",
            "dateRange": date_range or "custom",
            "startdt": "2024-01-01",
            "enddt": "2024-12-31",
            "page": 1,
            "from": 0,
            "size": min(limit, 100),
        }
        
        if cik:
            params["ciks"] = cik
        if ticker:
            params["entityName"] = ticker
        if form_type:
            params["forms"] = form_type
        
        # EDGAR full-text search
        data = await self.get("https://efts.sec.gov/LATEST/search-index", params=params)
        hits = data.get("hits", {}).get("hits", [])
        
        normalized = []
        for hit in hits:
            source = hit.get("_source", {})
            normalized.append({
                "raw_id": hit.get("_id", ""),
                "title": f"{source.get('form', 'Filing')} - {source.get('displayNames', ['Unknown'])[0] if source.get('displayNames') else 'Unknown'}",
                "source_url": f"https://www.sec.gov/Archives/edgar/data/{source.get('ciks', [''])[0]}/{source.get('adsh', '').replace('-', '')}/{source.get('adsh', '')}-index.html" if source.get('ciks') and source.get('adsh') else "",
                "published_date": source.get("file_date"),
                "recorded_date": source.get("file_date"),
                "cik": source.get("ciks", [None])[0] if source.get("ciks") else None,
                "form_type": source.get("form"),
                "accession_number": source.get("adsh"),
                "entity_name": source.get("displayNames", [None])[0] if source.get("displayNames") else None,
                "entity_type": "sec_filing",
                "raw_text": str(source),
            })
        
        logger.info("SEC filings fetched", count=len(normalized), form_type=form_type)
        return normalized
    
    async def get_filing_with_lobbying(self, accession_number: str) -> Dict[str, Any]:
        """Get filing full text and extract lobbying disclosures."""
        # Get filing index
        # Format: accession-number without dashes for directory
        acc_no_dash = accession_number.replace("-", "")
        
        # We need CIK - try to get from the accession number via search
        # For simplicity, fetch the filing text directly if we have the URL
        # This is a simplified version - production would resolve CIK properly
        
        return {
            "accession_number": accession_number,
            "filing_text": "Filing text retrieval requires CIK resolution. Use search_filings first to get cik and source_url.",
            "lobbying_disclosures": [],
            "note": "For full lobbying extraction, fetch the filing HTML from source_url and parse for LD-1/LD-2 references"
        }
    
    async def search_lobbying_disclosures(
        self,
        registrant: Optional[str] = None,
        client: Optional[str] = None,
        date_range: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Search lobbying disclosures (LD-1/LD-2).
        These are filed with House/Senate but often referenced in EDGAR filings.
        Uses Senate Lobbying Disclosure Act database.
        """
        # Senate LDA search (public, no key)
        base = "https://lda.senate.gov/api/v1"
        params: Dict[str, Any] = {"page": 1, "page_size": min(limit, 100)}
        
        if registrant:
            params["registrant_name"] = registrant
        if client:
            params["client_name"] = client
        if date_range:
            dates = date_range.split(",")
            if len(dates) == 2:
                params["filing_date_from"] = dates[0]
                params["filing_date_to"] = dates[1]
        
        try:
            data = await self.get(f"{base}/filings/", params=params)
            results = data.get("results", [])
            
            normalized = []
            for r in results:
                normalized.append({
                    "raw_id": str(r.get("filing_uuid", "")),
                    "title": f"Lobbying Disclosure - {r.get('registrant', {}).get('name', 'Unknown')}",
                    "source_url": f"https://lda.senate.gov/filings/filing/{r.get('filing_uuid', '')}",
                    "published_date": r.get("filing_date"),
                    "recorded_date": r.get("filing_date"),
                    "registrant": r.get("registrant", {}).get("name"),
                    "client": r.get("client", {}).get("name"),
                    "income": r.get("income"),
                    "expenses": r.get("expenses"),
                    "filing_type": r.get("filing_type"),
                    "entity_type": "lobbying_disclosure",
                    "raw_text": str(r),
                })
            
            logger.info("Lobbying disclosures fetched", count=len(normalized))
            return normalized
            
        except Exception as e:
            logger.error("Lobbying disclosure search failed", error=str(e))
            # Return empty but log - Senate LDA may have availability issues
            return []
    
    def _extract_lobbying_mentions(self, text: str) -> List[Dict[str, Any]]:
        """Extract lobbying-related mentions from filing text."""
        mentions = []
        
        # Pattern: lobbying expenditures
        lobby_patterns = [
            r'\$[\d,]+\.?\d*\s+(?:for\s+)?lobbying',
            r'lobbying\s+expenses?\s+of\s+\$[\d,]+\.?\d*',
            r'Lobbying\s+Disclosure\s+Act',
            r'LD-1|LD-2',
        ]
        
        for pattern in lobby_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                # Get context around match
                start = max(0, match.start() - 100)
                end = min(len(text), match.end() + 100)
                context = text[start:end]
                
                mentions.append({
                    "match": match.group(),
                    "context": context.strip(),
                    "pattern": pattern,
                })
        
        return mentions
    
    async def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        """Generic fetch interface."""
        return await self.search_filings(**kwargs)
