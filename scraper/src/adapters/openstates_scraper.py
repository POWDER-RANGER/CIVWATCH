"""
OpenStates GraphQL API scraper adapter.
API key recommended but many queries work without.
"""

from typing import Optional, List, Dict, Any
import structlog

from src.utils.http import BaseScraper

logger = structlog.get_logger()

class OpenStatesScraper(BaseScraper):
    """Scraper for OpenStates state legislative data."""
    
    def __init__(self):
        super().__init__(
            base_url="https://v3.openstates.org",
            rate_limit_delay=0.5,
            max_retries=3,
            timeout=30.0,
            headers={"X-API-Key": ""}  # Add key if available
        )
    
    async def search_bills(
        self,
        state: Optional[str] = None,
        session: Optional[str] = None,
        query: Optional[str] = None,
        subject: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Search state bills via OpenStates GraphQL."""
        # Use REST-like search endpoint
        params: Dict[str, Any] = {
            "page": 1,
            "per_page": min(limit, 100),
            "sort": "updated_desc",
        }
        if state:
            params["jurisdiction"] = state
        if session:
            params["session"] = session
        if query:
            params["q"] = query
        if subject:
            params["subject"] = subject
        
        data = await self.get("/bills", params=params)
        results = data.get("results", [])
        
        normalized = []
        for r in results:
            normalized.append({
                "raw_id": r.get("identifier", ""),
                "title": r.get("title", "Untitled Bill"),
                "source_url": f"https://openstates.org/bill/{r.get('id', '')}",
                "published_date": r.get("created_at"),
                "recorded_date": r.get("updated_at"),
                "state": state or r.get("jurisdiction", {}).get("name"),
                "session": session or r.get("session"),
                "bill_number": r.get("identifier"),
                "classification": r.get("classification", []),
                "from_organization": r.get("from_organization", {}).get("name"),
                "entity_type": "state_bill",
                "raw_text": str(r),
            })
        
        logger.info("OpenStates bills fetched", count=len(normalized), state=state)
        return normalized
    
    async def get_legislators(
        self,
        state: Optional[str] = None,
        chamber: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get state legislators."""
        params: Dict[str, Any] = {
            "page": 1,
            "per_page": min(limit, 100),
        }
        if state:
            params["jurisdiction"] = state
        if chamber:
            params["org_classification"] = chamber.lower()
        
        data = await self.get("/people", params=params)
        results = data.get("results", [])
        
        return [{
            "name": r.get("name"),
            "party": r.get("party"),
            "chamber": r.get("current_role", {}).get("org_classification") if r.get("current_role") else None,
            "district": r.get("current_role", {}).get("district") if r.get("current_role") else None,
            "state": state,
        } for r in results]
    
    async def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        """Generic fetch interface."""
        return await self.search_bills(**kwargs)
