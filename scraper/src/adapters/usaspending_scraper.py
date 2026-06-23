"""
USASpending.gov API scraper adapter.
Fully open, no API key required.
"""

from typing import Optional, List, Dict, Any
import structlog

from src.utils.http import BaseScraper

logger = structlog.get_logger()

class USASpendingScraper(BaseScraper):
    """Scraper for USASpending.gov federal contract and award data."""
    
    def __init__(self):
        super().__init__(
            base_url="https://api.usaspending.gov/api/v2",
            rate_limit_delay=0.3,
            max_retries=3,
            timeout=30.0
        )
    
    async def search_awards(
        self,
        keyword: Optional[str] = None,
        awarding_agency: Optional[str] = None,
        date_range: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Search federal awards/contracts via USASpending API."""
        # Build filter payload
        filters = {"award_type_codes": ["A", "B", "C", "D"]}  # Contracts + IDVs
        
        if keyword:
            filters["keyword_search"] = [keyword]
        if awarding_agency:
            filters["agencies"] = [{"type": "awarding", "tier": "toplevel", "name": awarding_agency}]
        if date_range:
            # date_range format: "2024-01-01,2024-12-31"
            dates = date_range.split(",")
            if len(dates) == 2:
                filters["time_period"] = [{"start_date": dates[0], "end_date": dates[1]}]
        if min_amount or max_amount:
            filters["award_amount"] = {}
            if min_amount:
                filters["award_amount"]["lower_bound"] = min_amount
            if max_amount:
                filters["award_amount"]["upper_bound"] = max_amount
        
        payload = {
            "filters": filters,
            "fields": [
                "Award ID", "Recipient Name", "Start Date", "End Date",
                "Award Amount", "Awarding Agency", "Awarding Sub Agency",
                "Contract Award Type", "Description", "Place of Performance State Code"
            ],
            "page": 1,
            "limit": min(limit, 500),
            "sort": "Award Amount",
            "order": "desc"
        }
        
        data = await self.post("/search/spending_by_award/", json_data=payload)
        results = data.get("results", [])
        
        # Normalize
        normalized = []
        for r in results:
            normalized.append({
                "raw_id": r.get("Award ID", ""),
                "title": r.get("Description", "Federal Award"),
                "source_url": f"https://www.usaspending.gov/award/{r.get('Award ID', '')}",
                "published_date": r.get("Start Date"),
                "recorded_date": r.get("Start Date"),
                "amount": r.get("Award Amount"),
                "recipient_name": r.get("Recipient Name"),
                "awarding_agency": r.get("Awarding Agency"),
                "awarding_sub_agency": r.get("Awarding Sub Agency"),
                "contract_type": r.get("Contract Award Type"),
                "place_of_performance": r.get("Place of Performance State Code"),
                "entity_type": "federal_contract",
                "raw_text": str(r),
            })
        
        logger.info("USASpending awards fetched", count=len(normalized))
        return normalized
    
    async def get_recipient_detail(self, recipient_id: str) -> Dict[str, Any]:
        """Get detailed information about a contract recipient."""
        data = await self.get(f"/recipient/duns/{recipient_id}/")
        return data
    
    async def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        """Generic fetch interface."""
        return await self.search_awards(**kwargs)
