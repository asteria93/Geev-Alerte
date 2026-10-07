from __future__ import annotations

from datetime import datetime

import requests

from .geev_client import Listing


class DiscordNotifier:
    def __init__(self, webhook_url: str, timeout_seconds: int = 15) -> None:
        self.webhook_url = webhook_url
        self.timeout_seconds = timeout_seconds

    def send_listing_alert(self, listing: Listing) -> None:
        location_text = listing.city or "Localisation inconnue"
        if listing.distance_km is not None:
            location_text = f"{location_text} ({listing.distance_km} km)"

        embed = {
            "title": listing.title[:256],
            "url": listing.url,
            "description": "Nouveau don Geev détecté",
            "color": 0x2ECC71,
            "fields": [
                {"name": "Localisation / Distance", "value": location_text[:1024], "inline": False},
                {"name": "Lien", "value": f"[Voir l'annonce]({listing.url})", "inline": False},
            ],
            "footer": {"text": f"ID: {listing.listing_id}"},
            "timestamp": _to_discord_timestamp(listing.created_at),
        }

        if listing.image_url:
            embed["image"] = {"url": listing.image_url}

        payload = {
            "username": "Geev Alerte",
            "embeds": [embed],
        }

        response = requests.post(self.webhook_url, json=payload, timeout=self.timeout_seconds)
        response.raise_for_status()


def _to_discord_timestamp(created_at: str | None) -> str:
    if created_at:
        cleaned = created_at.strip()
        if cleaned:
            if cleaned.endswith("Z"):
                return cleaned
            return cleaned + "Z"
    return datetime.utcnow().isoformat() + "Z"
