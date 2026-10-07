from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any

import requests


@dataclass(frozen=True)
class Listing:
    listing_id: str
    title: str
    url: str
    image_url: str | None
    city: str | None
    distance_km: float | None
    created_at: str | None


class GeevClient:
    def __init__(self, base_url: str, timeout_seconds: int = 20) -> None:
        self.base_url = base_url
        self.timeout_seconds = timeout_seconds
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/127.0.0.0 Safari/537.36"
                ),
                "Accept": "application/json, text/plain, */*",
                "Referer": "https://www.geev.com/",
                "Origin": "https://www.geev.com",
            }
        )

    def fetch_recent_listings(
        self,
        latitude: float,
        longitude: float,
        radius_km: float,
        page_size: int,
    ) -> list[Listing]:
        params = {
            "type": "donation",
            "latitude": latitude,
            "longitude": longitude,
            "distance": int(radius_km),
            "limit": page_size,
            "offset": 0,
            "sort": "recent",
        }

        response = self.session.get(self.base_url, params=params, timeout=self.timeout_seconds)
        response.raise_for_status()
        payload = response.json()

        raw_items = self._extract_items(payload)
        listings: list[Listing] = []
        for item in raw_items:
            listing = self._to_listing(item)
            if listing is not None:
                listings.append(listing)
        return listings

    def _extract_items(self, payload: Any) -> list[dict[str, Any]]:
        if isinstance(payload, list):
            return [x for x in payload if isinstance(x, dict)]

        if not isinstance(payload, dict):
            return []

        candidates = [
            payload.get("items"),
            payload.get("results"),
            payload.get("data"),
            payload.get("listings"),
            payload.get("offers"),
        ]

        for candidate in candidates:
            if isinstance(candidate, list):
                return [x for x in candidate if isinstance(x, dict)]
            if isinstance(candidate, dict):
                nested = candidate.get("items")
                if isinstance(nested, list):
                    return [x for x in nested if isinstance(x, dict)]

        return []

    def _to_listing(self, item: dict[str, Any]) -> Listing | None:
        raw_id = item.get("id") or item.get("_id") or item.get("uuid")
        if raw_id is None:
            return None

        listing_id = str(raw_id)
        title = str(item.get("title") or item.get("name") or "Annonce Geev").strip()
        if not title:
            title = "Annonce Geev"

        url = self._extract_url(item, listing_id)
        image_url = self._extract_image(item)
        city = self._extract_city(item)
        distance_km = self._extract_distance(item)
        created_at = self._extract_created_at(item)

        return Listing(
            listing_id=listing_id,
            title=title,
            url=url,
            image_url=image_url,
            city=city,
            distance_km=distance_km,
            created_at=created_at,
        )

    def _extract_url(self, item: dict[str, Any], listing_id: str) -> str:
        url = item.get("url") or item.get("link")
        if isinstance(url, str) and url.strip():
            return url.strip()

        slug = item.get("slug")
        if isinstance(slug, str) and slug.strip():
            return f"https://www.geev.com/fr/annonce/{slug.strip()}"

        return f"https://www.geev.com/fr/annonce/{listing_id}"

    def _extract_image(self, item: dict[str, Any]) -> str | None:
        direct_candidates = ["image", "image_url", "photo", "thumbnail"]
        for key in direct_candidates:
            value = item.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

        media = item.get("images") or item.get("photos")
        if isinstance(media, list):
            for entry in media:
                if isinstance(entry, str) and entry.strip():
                    return entry.strip()
                if isinstance(entry, dict):
                    nested = entry.get("url") or entry.get("src")
                    if isinstance(nested, str) and nested.strip():
                        return nested.strip()

        return None

    def _extract_city(self, item: dict[str, Any]) -> str | None:
        for key in ["city", "town", "location"]:
            value = item.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

        place = item.get("place")
        if isinstance(place, dict):
            for key in ["city", "name"]:
                value = place.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()

        return None

    def _extract_distance(self, item: dict[str, Any]) -> float | None:
        value = item.get("distance") or item.get("distance_km")
        if value is None:
            return None
        try:
            return round(float(value), 2)
        except (TypeError, ValueError):
            return None

    def _extract_created_at(self, item: dict[str, Any]) -> str | None:
        value = item.get("created_at") or item.get("createdAt") or item.get("date")
        if not value:
            return None
        if isinstance(value, (int, float)):
            try:
                return datetime.utcfromtimestamp(float(value)).isoformat() + "Z"
            except (OverflowError, ValueError):
                return None
        if isinstance(value, str):
            stripped = value.strip()
            return stripped or None
        return None
