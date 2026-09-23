# Geev Alerte (démo fonctionnelle)

Application Next.js permettant de créer des alertes et de simuler la détection de nouvelles annonces.

## ⚠️ Limite importante Geev

Cette version **n'interroge pas Geev**. Aucune API publique officielle Geev n'est configurée ici.

- Source active par défaut: `mock`
- Source Geev réelle: désactivée tant qu'aucune API autorisée n'est disponible
- Aucun scraping, aucun contournement CAPTCHA, aucune authentification automatisée

L'architecture conserve une abstraction `ListingSource` pour brancher une source officielle/autorisé plus tard.

## Fonctionnalités disponibles

- Dashboard (statut, alertes actives, dernière vérification, dernières détections)
- Gestion des alertes (création, activation/désactivation, édition)
- Critères: catégorie, mots-clés, mode `ANY`/`ALL`, localisation (preset ville/code postal), rayon
- Détection manuelle de nouvelles annonces
- Dédoublonnage par alerte (même annonce non notifiée deux fois)
- Historique des annonces détectées
- Paramètres notifications:
  - notification mock locale (par défaut)
  - Discord réel uniquement si `DISCORD_WEBHOOK_URL` est fourni côté serveur
- Persistance locale JSON reproductible: `data/demo-store.json`

## Installation

```bash
npm install
```

## Variables d'environnement

Copier `.env.example` vers `.env.local`.

## Lancer l'application

```bash
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Tests et vérifications

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Parcours de démonstration recommandé

1. Aller sur **Créer** et créer une alerte avec:
   - catégorie `jeux-video`
   - mots-clés `PS4, manette`
   - mode `ANY` ou `ALL`
   - localisation `Paris 75010`
   - rayon `10` ou `20 km`
2. Aller sur **Dashboard** et cliquer **Lancer une vérification**.
3. Vérifier l'apparition dans **Historique**.
4. Recliquer **Lancer une vérification** sans injecter d'annonce: aucune nouvelle détection (dédoublonnage).
5. Aller sur **Notifications** et cliquer **Injecter une annonce fictive**, puis relancer la détection.

## Structure principale

- `lib/sources/*` : abstraction et implémentations des sources d'annonces
- `lib/detection.ts` : cycle de détection + notifications
- `lib/filter.ts` : filtres catégorie/mots-clés/localisation/rayon
- `lib/storage.ts` : persistance locale JSON
- `app/api/*` : API serveur

## Sécurité

- Aucun secret exposé côté client
- Discord webhook lu uniquement côté serveur via variable d'environnement
- Les données d'annonces sont fictives/mock dans cette démo
