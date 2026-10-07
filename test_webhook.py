from __future__ import annotations

import os
import sys

import requests
from dotenv import load_dotenv


def main() -> int:
    load_dotenv()
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL", "").strip()

    if not webhook_url:
        print("Erreur: DISCORD_WEBHOOK_URL est manquante dans .env")
        return 1

    payload = {
        "content": "Webhook Discord Geev-Alerte connecté !"
    }

    try:
        response = requests.post(webhook_url, json=payload, timeout=15)
        response.raise_for_status()
    except requests.RequestException as exc:
        print(f"Échec envoi webhook: {exc}")
        return 1

    print("Message de test envoyé avec succès sur Discord.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
