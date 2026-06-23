"""
CIVWATCH Scraper Service
FastAPI-based scraper microservice with CIVWATCH backend integration.
Provides scraping endpoints for all government data sources with
rate limiting, proxy rotation, and automatic data forwarding.
"""

import os
import httpx
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel, HttpUrl
import structlog

from src.adapters.fec_scraper import FECScraper
from src.adapters.usaspending_scraper import USASpendingScraper
from src.adapters.congress_scraper import CongressScraper
from src.adapters.openstates_scraper import OpenStatesScraper
from src.adapters.sec_edgar_scraper import SECEdgarScraper
from src.adapters.state_campaign_finance import StateCampaignFinanceScraper
from src.parsers.pdf_parser import PDFParser

logger = structlog.get_logger()

app = FastAPI(title="CIVWATCH Scraper Service", version="1.0.0")

# --- Configuration ---
CIVWATCH_BACKEND = os.getenv("CIVWATCH_BACKEND_URL", "http://backend:3000/api")
CIVWATCH_API_KEY = os.getenv("CIVWATCH_API_KEY", "")

# --- Pydantic Models ---
class ScrapeRequest(BaseModel):
    source: str
    params: Dict[str, Any] = {}
    forward_to_backend: bool = True

class PDFParseRequest(BaseModel):
    url: HttpUrl
    doc_type: str = "auto"  # auto, agenda, minutes, ordinance, contract

class ImportResponse(BaseModel):
    success: bool
    records_scraped: int
    records_imported: int
    errors: List[str]

# --- Helper ---
async def forward_to_ingest(records: List[Dict], source: str, category: str):
    """Forward scraped records to CIVWATCH backend ingest endpoint."""
    if not CIVWATCH_API_KEY:
        logger.warning("No CIVWATCH_API_KEY set, skipping backend forward")
        return
    
    headers = {"Authorization": f"Bearer {CIVWATCH_API_KEY}"}
    payload = {
        "records": records,
        "source": source,
        "category": category,
        "tags": ["scraper", source, category]
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{CIVWATCH_BACKEND}/ingest/batch",
                json=payload,
                headers=headers
            )
            resp.raise_for_status()
            logger.info("Forwarded records to backend", count=len(records), source=source)
    except Exception as e:
        logger.error("Failed to forward to backend", error=str(e), source=source)

# --- Health ---
@app.get("/health")
async def health():
    return {"status": "ok", "service": "scraper"}

# --- FEC Campaign Finance ---
@app.get("/scrape/fec/contributions")
async def scrape_fec_contributions(
    committee_id: Optional[str] = None,
    candidate_id: Optional[str] = None,
    min_date: Optional[str] = None,
    max_date: Optional[str] = None,
    per_page: int = Query(100, le=500),
    forward: bool = True
):
    """Scrape FEC individual contributions."""
    scraper = FECScraper()
    try:
        records = await scraper.fetch_contributions(
            committee_id=committee_id,
            candidate_id=candidate_id,
            min_date=min_date,
            max_date=max_date,
            per_page=per_page
        )
        if forward and records:
            await forward_to_ingest(records, "fec", "campaign_finance")
        return {"records": records, "count": len(records)}
    except Exception as e:
        logger.error("FEC scrape failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scrape/fec/committees")
async def scrape_fec_committees(
    query: Optional[str] = None,
    per_page: int = Query(100, le=500)
):
    """Search FEC committees."""
    scraper = FECScraper()
    records = await scraper.search_committees(query=query, per_page=per_page)
    return {"records": records, "count": len(records)}

# --- USASpending ---
@app.get("/scrape/usaspending/awards")
async def scrape_usaspending_awards(
    keyword: Optional[str] = None,
    awarding_agency: Optional[str] = None,
    date_range: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    limit: int = Query(100, le=500),
    forward: bool = True
):
    """Scrape USASpending contract awards."""
    scraper = USASpendingScraper()
    try:
        records = await scraper.search_awards(
            keyword=keyword,
            awarding_agency=awarding_agency,
            date_range=date_range,
            min_amount=min_amount,
            max_amount=max_amount,
            limit=limit
        )
        if forward and records:
            await forward_to_ingest(records, "usaspending", "contracts")
        return {"records": records, "count": len(records)}
    except Exception as e:
        logger.error("USASpending scrape failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scrape/usaspending/recipient/{recipient_id}")
async def scrape_usaspending_recipient(recipient_id: str):
    """Get detailed recipient (contractor) information."""
    scraper = USASpendingScraper()
    data = await scraper.get_recipient_detail(recipient_id)
    return data

# --- Congress.gov ---
@app.get("/scrape/congress/bills")
async def scrape_congress_bills(
    congress: Optional[int] = None,
    query: Optional[str] = None,
    subject: Optional[str] = None,
    limit: int = Query(50, le=250),
    forward: bool = True
):
    """Scrape Congress.gov bills."""
    scraper = CongressScraper()
    try:
        records = await scraper.search_bills(
            congress=congress,
            query=query,
            subject=subject,
            limit=limit
        )
        if forward and records:
            await forward_to_ingest(records, "congress", "legislation")
        return {"records": records, "count": len(records)}
    except Exception as e:
        logger.error("Congress.gov scrape failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scrape/congress/bill/{congress}/{bill_type}/{bill_number}")
async def scrape_congress_bill_detail(congress: int, bill_type: str, bill_number: int):
    """Get detailed bill information with amendments and actions."""
    scraper = CongressScraper()
    data = await scraper.get_bill_detail(congress, bill_type, bill_number)
    return data

# --- OpenStates ---
@app.get("/scrape/openstates/bills")
async def scrape_openstates_bills(
    state: Optional[str] = None,
    session: Optional[str] = None,
    query: Optional[str] = None,
    subject: Optional[str] = None,
    limit: int = Query(50, le=250),
    forward: bool = True
):
    """Scrape OpenStates state legislation."""
    scraper = OpenStatesScraper()
    try:
        records = await scraper.search_bills(
            state=state,
            session=session,
            query=query,
            subject=subject,
            limit=limit
        )
        if forward and records:
            await forward_to_ingest(records, "openstates", "state_legislation")
        return {"records": records, "count": len(records)}
    except Exception as e:
        logger.error("OpenStates scrape failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scrape/openstates/people")
async def scrape_openstates_people(
    state: Optional[str] = None,
    chamber: Optional[str] = None,
    limit: int = Query(100, le=500)
):
    """Scrape OpenStates legislators."""
    scraper = OpenStatesScraper()
    records = await scraper.get_legislators(state=state, chamber=chamber, limit=limit)
    return {"records": records, "count": len(records)}

# --- SEC EDGAR ---
@app.get("/scrape/sec/filings")
async def scrape_sec_filings(
    cik: Optional[str] = None,
    ticker: Optional[str] = None,
    form_type: Optional[str] = None,  # 10-K, 10-Q, 8-K, etc.
    date_range: Optional[str] = None,
    limit: int = Query(50, le=200),
    forward: bool = True
):
    """Scrape SEC EDGAR filings. Extracts lobbying disclosure when present."""
    scraper = SECEdgarScraper()
    try:
        records = await scraper.search_filings(
            cik=cik,
            ticker=ticker,
            form_type=form_type,
            date_range=date_range,
            limit=limit
        )
        if forward and records:
            await forward_to_ingest(records, "sec_edgar", "financial_disclosure")
        return {"records": records, "count": len(records)}
    except Exception as e:
        logger.error("SEC EDGAR scrape failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scrape/sec/filing/{accession_number}")
async def scrape_sec_filing_detail(accession_number: str):
    """Get full filing text with lobbying extraction."""
    scraper = SECEdgarScraper()
    data = await scraper.get_filing_with_lobbying(accession_number)
    return data

@app.get("/scrape/sec/lobbying")
async def scrape_sec_lobbying(
    registrant: Optional[str] = None,
    client: Optional[str] = None,
    date_range: Optional[str] = None,
    limit: int = Query(50, le=200)
):
    """Search LD-1/LD-2 lobbying disclosures from House/Senate portals via EDGAR."""
    scraper = SECEdgarScraper()
    records = await scraper.search_lobbying_disclosures(
        registrant=registrant,
        client=client,
        date_range=date_range,
        limit=limit
    )
    return {"records": records, "count": len(records)}

# --- State Campaign Finance (multi-state framework) ---
@app.get("/scrape/state-finance/contributions")
async def scrape_state_contributions(
    state: str = Query(..., description="Two-letter state code"),
    year: Optional[int] = None,
    candidate: Optional[str] = None,
    contributor: Optional[str] = None,
    limit: int = Query(100, le=500),
    forward: bool = True
):
    """Scrape state-level campaign finance contributions."""
    scraper = StateCampaignFinanceScraper()
    try:
        records = await scraper.fetch_contributions(
            state=state,
            year=year,
            candidate=candidate,
            contributor=contributor,
            limit=limit
        )
        if forward and records:
            await forward_to_ingest(records, f"state_{state}", "campaign_finance")
        return {"records": records, "count": len(records), "state": state}
    except Exception as e:
        logger.error("State campaign finance scrape failed", error=str(e), state=state)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scrape/state-finance/states")
async def list_supported_states():
    """List states with implemented scrapers."""
    scraper = StateCampaignFinanceScraper()
    return {"supported_states": scraper.list_supported_states()}

# --- Municipal PDF Parser ---
@app.post("/parse/pdf")
async def parse_pdf(request: PDFParseRequest):
    """Parse a municipal PDF (agenda, minutes, ordinance, contract)."""
    parser = PDFParser()
    try:
        result = await parser.parse_from_url(str(request.url), doc_type=request.doc_type)
        return result
    except Exception as e:
        logger.error("PDF parse failed", error=str(e), url=str(request.url))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/parse/pdf/upload")
async def parse_pdf_upload(
    file: bytes,
    doc_type: str = "auto",
    forward: bool = True
):
    """Parse uploaded PDF file."""
    parser = PDFParser()
    try:
        result = await parser.parse_bytes(file, doc_type=doc_type)
        if forward and result.get("structured_data"):
            await forward_to_ingest(
                [result["structured_data"]],
                "municipal_pdf",
                result.get("doc_type", "document")
            )
        return result
    except Exception as e:
        logger.error("PDF upload parse failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

# --- Generic scrape endpoint ---
@app.post("/scrape")
async def generic_scrape(request: ScrapeRequest, background_tasks: BackgroundTasks):
    """Generic scrape endpoint that dispatches to the appropriate adapter."""
    adapter_map = {
        "fec": FECScraper,
        "usaspending": USASpendingScraper,
        "congress": CongressScraper,
        "openstates": OpenStatesScraper,
        "sec_edgar": SECEdgarScraper,
        "state_finance": StateCampaignFinanceScraper,
    }
    
    adapter_class = adapter_map.get(request.source)
    if not adapter_class:
        raise HTTPException(status_code=400, detail=f"Unknown source: {request.source}")
    
    scraper = adapter_class()
    # Dispatch to generic fetch method if available
    if hasattr(scraper, 'fetch'):
        records = await scraper.fetch(**request.params)
    else:
        raise HTTPException(status_code=400, detail=f"Generic fetch not supported for {request.source}")
    
    if request.forward_to_backend and records:
        background_tasks.add_task(
            forward_to_ingest,
            records,
            request.source,
            request.params.get("category", "general")
        )
    
    return {"records": records, "count": len(records), "source": request.source}

# --- Run status ---
@app.get("/status")
async def scraper_status():
    """Get scraper service status and rate limit info."""
    return {
        "status": "healthy",
        "sources": ["fec", "usaspending", "congress", "openstates", "sec_edgar", "state_finance"],
        "features": ["pdf_parsing", "lobbying_extraction", "auto_forward"],
        "backend_forwarding": bool(CIVWATCH_API_KEY),
        "backend_url": CIVWATCH_BACKEND
    }
