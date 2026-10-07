from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


DEFAULT_GEEV_API_URL = "https://mobile.geev.com/api/v2/search/items"


@dataclass(frozen=True)
class AppConfig:
    discord_webhook_url: str
    scan_interval_seconds: int
    keywords: list[str]
    geev_latitude: float
    geev_longitude: float
    geev_radius_km: float
    geev_page_size: int
    geev_api_url: str
    seen_storage_path: Path
    debug: bool

    @property
    def accept_all_keywords(self) -> bool:
        return len(self.keywords) == 1 and self.keywords[0] == "*"


def _read_required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ValueError(f"Variable d'environnement obligatoire manquante: {name}")
    return value


def _read_float_env(name: str, default: float | None = None) -> float:
    raw = os.getenv(name)
    if raw is None:
        if default is None:
            raise ValueError(f"Variable d'environnement obligatoire manquante: {name}")
        return default
    try:
        return float(raw.strip())
    except ValueError as exc:
        raise ValueError(f"{name} doit être un nombre (reçu: {raw!r})") from exc


def _read_int_env(name: str, default: int) -> int:
    raw = os.getenv(name, str(default)).strip()
    try:
        value = int(raw)
    except ValueError as exc:
        raise ValueError(f"{name} doit être un entier (reçu: {raw!r})") from exc
    if value <= 0:
        raise ValueError(f"{name} doit être > 0")
    return value


def _read_bool_env(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    normalized = raw.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    raise ValueError(f"{name} doit être un booléen (true/false)")


def _read_keywords() -> list[str]:
    raw = os.getenv("KEYWORDS", "*").strip()
    if not raw:
        return ["*"]
    items = [x.strip().lower() for x in raw.split(",") if x.strip()]
    if not items:
        return ["*"]
    if "*" in items:
        return ["*"]
    return items


def load_config() -> AppConfig:
    webhook = _read_required_env("DISCORD_WEBHOOK_URL")
    latitude = _read_float_env("GEEV_LATITUDE")
    longitude = _read_float_env("GEEV_LONGITUDE")
    radius = _read_float_env("GEEV_RADIUS_KM")
    if radius <= 0:
        raise ValueError("GEEV_RADIUS_KM doit être > 0")

    seen_path = Path(os.getenv("SEEN_STORAGE_PATH", "data/seen_listings.json"))

    return AppConfig(
        discord_webhook_url=webhook,
        scan_interval_seconds=_read_int_env("SCAN_INTERVAL_SECONDS", 180),
        keywords=_read_keywords(),
        geev_latitude=latitude,
        geev_longitude=longitude,
        geev_radius_km=radius,
        geev_page_size=_read_int_env("GEEV_PAGE_SIZE", 40),
        geev_api_url=os.getenv("GEEV_API_URL", DEFAULT_GEEV_API_URL).strip() or DEFAULT_GEEV_API_URL,
        seen_storage_path=seen_path,
        debug=_read_bool_env("DEBUG", False),
    )
