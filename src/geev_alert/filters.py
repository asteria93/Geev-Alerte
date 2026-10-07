from __future__ import annotations

from .geev_client import Listing


def keyword_match(listing: Listing, keywords: list[str], accept_all: bool) -> bool:
    if accept_all:
        return True
    haystack = f"{listing.title}".lower()
    return any(keyword in haystack for keyword in keywords)


def filter_listings(listings: list[Listing], keywords: list[str], accept_all: bool) -> list[Listing]:
    return [listing for listing in listings if keyword_match(listing, keywords, accept_all)]
