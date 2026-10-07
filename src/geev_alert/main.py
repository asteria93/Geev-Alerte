from __future__ import annotations

import argparse
import logging
import time

from dotenv import load_dotenv

from .config import AppConfig, load_config
from .filters import filter_listings
from .geev_client import GeevClient, Listing
from .notifier import DiscordNotifier
from .store import SeenStore


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Surveillance Geev + alertes Discord")
    parser.add_argument("--once", action="store_true", help="Exécuter un seul scan puis quitter")
    return parser


def setup_logging(debug: bool) -> None:
    level = logging.DEBUG if debug else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)s | %(message)s",
    )


def run_scan(
    config: AppConfig,
    geev_client: GeevClient,
    notifier: DiscordNotifier,
    seen_store: SeenStore,
) -> int:
    listings = geev_client.fetch_recent_listings(
        latitude=config.geev_latitude,
        longitude=config.geev_longitude,
        radius_km=config.geev_radius_km,
        page_size=config.geev_page_size,
    )

    filtered = filter_listings(
        listings=listings,
        keywords=config.keywords,
        accept_all=config.accept_all_keywords,
    )

    notified_count = 0
    for listing in filtered:
        if seen_store.has(listing.listing_id):
            continue

        try:
            notifier.send_listing_alert(listing)
        except Exception as exc:  # noqa: BLE001
            logging.exception("Erreur envoi Discord pour %s: %s", listing.listing_id, exc)
            continue

        seen_store.add(listing.listing_id)
        notified_count += 1
        logging.info("Alerte envoyée pour: %s (%s)", listing.title, listing.listing_id)

    seen_store.save()
    return notified_count


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    load_dotenv()
    config = load_config()
    setup_logging(config.debug)

    geev_client = GeevClient(base_url=config.geev_api_url)
    notifier = DiscordNotifier(webhook_url=config.discord_webhook_url)
    seen_store = SeenStore(path=config.seen_storage_path)

    logging.info(
        "Surveillance Geev démarrée | interval=%ss | rayon=%skm | keywords=%s",
        config.scan_interval_seconds,
        config.geev_radius_km,
        ", ".join(config.keywords),
    )

    while True:
        try:
            count = run_scan(config, geev_client, notifier, seen_store)
            logging.info("Scan terminé, %s nouvelle(s) alerte(s)", count)
        except Exception as exc:  # noqa: BLE001
            logging.exception("Erreur durant le scan: %s", exc)

        if args.once:
            break

        time.sleep(config.scan_interval_seconds)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
