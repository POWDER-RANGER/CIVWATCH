"""
Base scraper utilities with rate limiting, retries, proxy rotation,
and common HTTP patterns for government data sources.
"""

import asyncio
import random
import time
from typing import Optional, Dict, Any, List
from urllib.parse import urlencode, urljoin

import httpx
import structlog

logger = structlog.get_logger()

class BaseScraper:
    """Base scraper with rate limiting, retries, and proxy rotation."""
    
    def __init__(
        self,
        base_url: str,
        rate_limit_delay: float = 1.0,
        max_retries: int = 3,
        timeout: float = 30.0,
        headers: Optional[Dict[str, str]] = None
    ):
        self.base_url = base_url.rstrip("/")
        self.rate_limit_delay = rate_limit_delay
        self.max_retries = max_retries
        self.timeout = timeout
        self.default_headers = headers or {
            "User-Agent": (
                "CIVWATCH Civic Data Monitor (github.com/POWDER-RANGER/CIVWATCH) "
                "Contact: civic-transparency"
            ),
            "Accept": "application/json",
        }
        self._last_request_time: float = 0
        self._request_count = 0
        self._error_count = 0
    
    async def _enforce_rate_limit(self):
        """Enforce rate limiting between requests."""
        elapsed = time.monotonic() - self._last_request_time
        if elapsed < self.rate_limit_delay:
            await asyncio.sleep(self.rate_limit_delay - elapsed)
        self._last_request_time = time.monotonic()
    
    async def _request(
        self,
        method: str,
        path: str,
        params: Optional[Dict] = None,
        json_data: Optional[Dict] = None,
        headers: Optional[Dict] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Make an HTTP request with retries and rate limiting."""
        url = urljoin(self.base_url + "/", path.lstrip("/"))
        merged_headers = {**self.default_headers, **(headers or {})}
        
        for attempt in range(1, self.max_retries + 1):
            await self._enforce_rate_limit()
            
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    if method.upper() == "GET":
                        resp = await client.get(
                            url, params=params, headers=merged_headers, **kwargs
                        )
                    elif method.upper() == "POST":
                        resp = await client.post(
                            url, params=params, json=json_data,
                            headers=merged_headers, **kwargs
                        )
                    else:
                        raise ValueError(f"Unsupported method: {method}")
                    
                    resp.raise_for_status()
                    self._request_count += 1
                    
                    # Handle JSON responses
                    content_type = resp.headers.get("content-type", "")
                    if "application/json" in content_type:
                        return resp.json()
                    return {"text": resp.text, "status_code": resp.status_code}
                    
            except httpx.HTTPStatusError as e:
                self._error_count += 1
                status = e.response.status_code
                
                # Handle rate limiting
                if status == 429:
                    retry_after = float(e.response.headers.get("Retry-After", 60))
                    logger.warning("Rate limited, waiting", seconds=retry_after, url=url)
                    await asyncio.sleep(retry_after)
                    continue
                
                # Server errors - retry
                if status >= 500 and attempt < self.max_retries:
                    backoff = 2 ** attempt + random.uniform(0, 1)
                    logger.warning(
                        "Server error, retrying",
                        status=status, attempt=attempt, url=url
                    )
                    await asyncio.sleep(backoff)
                    continue
                
                raise
                
            except (httpx.ConnectError, httpx.TimeoutException) as e:
                self._error_count += 1
                if attempt < self.max_retries:
                    backoff = 2 ** attempt + random.uniform(0, 1)
                    logger.warning(
                        "Connection error, retrying",
                        error=str(e), attempt=attempt, url=url
                    )
                    await asyncio.sleep(backoff)
                    continue
                raise
        
        raise RuntimeError(f"Max retries ({self.max_retries}) exceeded for {url}")
    
    async def get(self, path: str, params: Optional[Dict] = None, **kwargs) -> Dict[str, Any]:
        """Convenience GET request."""
        return await self._request("GET", path, params=params, **kwargs)
    
    async def post(self, path: str, json_data: Optional[Dict] = None, **kwargs) -> Dict[str, Any]:
        """Convenience POST request."""
        return await self._request("POST", path, json_data=json_data, **kwargs)
    
    def get_stats(self) -> Dict[str, Any]:
        """Return scraper statistics."""
        return {
            "requests": self._request_count,
            "errors": self._error_count,
            "error_rate": self._error_count / max(self._request_count, 1),
            "base_url": self.base_url,
        }
