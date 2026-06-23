"""
Congress.gov API scraper adapter.
No API key required (rate limited to 5000/day).
"""

from typing import Optional, List, Dict, Any
import structlog

from src.utils.http import BaseScraper

logger = structlog.get_logger()

class CongressScraper(BaseScraper):
    """Scraper for Congress.gov legislative data."""
    
    def __init__(self):
        super().__init__(
            base_url="https://api.congress.gov/v3",
            rate_limit_delay=1.0,  # 5000/day = ~1 req/17s, but we burst
            max_retries=3,
            timeout=30.0
        )
        self.api_key = ""  # Optional, higher limits with key
    
    def _add_key(self, params: Optional[Dict]) -> Dict:
        p = params or {}
        if self.api_key:
            p["api_key"] = self.api_key
        p["format"] = "json"
        return p
    
    async def search_bills(
        self,
        congress: Optional[int] = None,
        query: Optional[str] = None,
        subject: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Search bills on Congress.gov."""
        params = self._add_key({
            "limit": min(limit, 250),
            "sort": "updateDate+desc",
        })
        if congress:
            path = f"/bill/{congress}"
        else:
            path = "/bill"
        if query:
            params["q"] = query
        
        data = await self.get(path, params=params)
        bills = data.get("bills", [])
        
        normalized = []
        for b in bills:
            bill_obj = b if isinstance(b, dict) else {}
            normalized.append({
                "raw_id": bill_obj.get("number", ""),
                "title": bill_obj.get("title", "Untitled Bill"),
                "source_url": bill_obj.get("url", ""),
                "published_date": bill_obj.get("updateDate"),
                "recorded_date": bill_obj.get("latestAction", {}).get("actionDate") if isinstance(bill_obj.get("latestAction"), dict) else None,
                "congress": congress or bill_obj.get("congress"),
                "bill_number": bill_obj.get("number"),
                "bill_type": bill_obj.get("type"),
                "latest_action": bill_obj.get("latestAction", {}),
                "entity_type": "federal_bill",
                "raw_text": str(bill_obj),
            })
        
        logger.info("Congress bills fetched", count=len(normalized))
        return normalized
    
    async def get_bill_detail(self, congress: int, bill_type: str, bill_number: int) -> Dict[str, Any]:
        """Get detailed bill information with actions and amendments."""
        params = self._add_key({})
        
        # Main bill data
        bill_data = await self.get(
            f"/bill/{congress}/{bill_type.lower()}/{bill_number}",
            params=params
        )
        
        # Actions
        actions_data = await self.get(
            f"/bill/{congress}/{bill_type.lower()}/{bill_number}/actions",
            params=self._add_key({"limit": 100})
        )
        
        return {
            "bill": bill_data,
            "actions": actions_data.get("actions", []),
            "action_count": len(actions_data.get("actions", [])),
        }
    
    async def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        """Generic fetch interface."""
        return await self.search_bills(**kwargs)
