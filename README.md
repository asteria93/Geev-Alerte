# Geev-Alerte

Application de surveillance des dons Geev avec notifications automatiques sur Discord (Webhook).

## Fonctionnalités

- Scan périodique des annonces Geev récentes via requête HTTP.
- Filtrage par mots-clés (`KEYWORDS`) ou mode global (`*`).
- Filtrage géographique via latitude/longitude/rayon.
- Déduplication persistante des annonces déjà notifiées (fichier JSON local).
- Notification Discord en **Rich Embed** (titre, image, localisation/distance, lien cliquable).

## Prérequis

- Python 3.10+
- Un serveur Discord avec droits de gestion des intégrations

## 1) Créer le Webhook Discord en 2 clics

1. Ouvre le canal Discord cible → **Modifier le canal** → **Intégrations** → **Webhooks**.
2. Clique sur **Nouveau Webhook** puis **Copier l’URL du webhook**.

Tu obtiens une URL du type `https://discord.com/api/webhooks/...` à mettre dans `DISCORD_WEBHOOK_URL`.

## Installation

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2) Configurer le `.env`

```bash
cp .env.example .env
```

Variables principales :

- `DISCORD_WEBHOOK_URL` : URL du webhook Discord.
- `KEYWORDS` : mots-clés séparés par des virgules (ex: `velo,playstation,armoire`) ou `*` pour tout notifier.
- `GEEV_LATITUDE`, `GEEV_LONGITUDE` : coordonnées du centre de recherche.
- `GEEV_RADIUS_KM` : rayon en kilomètres.
- `SCAN_INTERVAL_SECONDS` : fréquence de scan (ex: `180` pour 3 minutes).
- `SEEN_STORAGE_PATH` : chemin du fichier JSON de déduplication.

### Récupérer les coordonnées GPS

Tu peux copier les coordonnées d’un point depuis :
- Google Maps (clic droit → “Plus d’infos sur cet endroit”).
- OpenStreetMap (clic sur la carte puis lecture des coordonnées).

## Lancer en local

```bash
PYTHONPATH=src python -m geev_alert.main
```

Mode unitaire (un seul scan) :

```bash
PYTHONPATH=src python -m geev_alert.main --once
```

## 3) Exécution non-stop avec PM2

Installe PM2 si besoin (`npm i -g pm2`) puis :

```bash
pm2 start "PYTHONPATH=src python -m geev_alert.main" --name geev-alerte
pm2 save
pm2 startup
```

## Exécution non-stop avec Docker

Build :

```bash
docker build -t geev-alerte .
```

Run :

```bash
docker run --rm --env-file .env -v $(pwd)/data:/app/data geev-alerte
```

## Structure

```text
.
├── .env.example
├── Dockerfile
├── README.md
├── requirements.txt
└── src/
    └── geev_alert/
        ├── __init__.py
        ├── config.py
        ├── filters.py
        ├── geev_client.py
        ├── main.py
        ├── notifier.py
        └── store.py
```

## Notes

- Le script utilise par défaut `https://mobile.geev.com/api/v2/search/items` (`GEEV_API_URL`).
- Si Geev modifie son endpoint public, ajuste `GEEV_API_URL` dans `.env`.
- Le fichier de déduplication garde les IDs déjà notifiés pour éviter les doublons même après redémarrage.
