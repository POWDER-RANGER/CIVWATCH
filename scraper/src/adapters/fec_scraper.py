"""
FEC.gov / OpenFEC API scraper adapter.
No API key required for most endpoints (rate limited).
"""

from typing import Optional, List, Dict, Any
import structlog

from src.utils.http import BaseScraper

logger = structlog.get_logger()

class FECScraper(BaseScraper):
    """Scraper for Federal Election Commission data."""
    
    def __init__(self):
        super().__init__(
            base_url="https://api.open.fec.gov/v1",
            rate_limit_delay=0.5,
            max_retries=3,
            timeout=30.0
        )
        self.api_key = ""  # OpenFEC allows limited access without key
    
    def _add_key(self, params: Optional[Dict]) -> Dict:
        """Add API key to params if available."""
        p = params or {}
        if self.api_key:
            p["api_key"] = self.api_key
        return p
    
    async def fetch_contributions(
        self,
        committee_id: Optional[str] = None,
        candidate_id: Optional[str] = None,
        min_date: Optional[str] = None,
        max_date: Optional[str] = None,
        per_page: int = 100
    ) -> List[Dict[str, Any]]:
        """Fetch individual contributions from FEC API."""
        params = self._add_key({
            "per_page": per_page,
            "sort": "-contribution_receipt_date",
        })
        
        if committee_id:
            params["committee_id"] = committee_id
        if candidate_id:
            params["candidate_id"] = candidate_id
        if min_date:
            params["min_date"] = min_date
        if max_date:
            params["max_date"] = max_date
        
        data = await self.get("/schedules/schedule_a/", params=params)
        results = data.get("results", [])
        
        # Normalize to CIVWATCH record format
        normalized = []
        for r in results:
            normalized.append({
                "raw_id": r.get("transaction_id", ""),
                "title": f"Contribution from {r.get('contributor_name', 'Unknown')}",
                "source_url": f"https://www.fec.gov/data/receipts/individual-contributions/",
                "published_date": r.get("contribution_receipt_date"),
                "recorded_date": r.get("contribution_receipt_date"),
                "amount": r.get("contribution_receipt_amount"),
                "contributor_name": r.get("contributor_name"),
                "contributor_occupation": r.get("contributor_occupation"),
                "contributor_employer": r.get("contributor_employer"),
                "committee_name": r.get("committee_name"),
                "committee_id": r.get("committee_id"),
                "candidate_id": candidate_id,
                "entity_type": "individual_contribution",
                "raw_text": str(r),
            })
        
        logger.info("FEC contributions fetched", count=len(normalized))
        return normalized
    
    async def search_committees(
        self,
        query: Optional[str] = None,
        per_page: int = 100
    ) -> List[Dict[str, Any]]:
        """Search FEC committees."""
        params = self._add_key({
            "per_page": per_page,
            "sort": "name",
        })
        if query:
            params["q"] = query
        
        data = await self.get("/committees/", params=params)
        results = data.get("results", [])
        
        return [{
            "committee_id": r.get("committee_id"),
            "name": r.get("name"),
            "party": r.get("party"),
            "committee_type": r.get("committee_type"),
            "state": r.get("state"),
            "filing_frequency": r.get("filing_frequency"),
        } for r in results]
    
    async def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        """Generic fetch interface."""
        if kwargs.get("type") == "committees":
            return await self.search_committees(
                query=kwargs.get("query"),
                per_page=kwargs.get("per_page", 100)
            )
        return await self.fetch_contributions(**kwargs)
