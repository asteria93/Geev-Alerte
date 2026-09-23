# Geev Alerte

Application web Next.js/TypeScript permettant de créer des alertes et d'être notifié quand une annonce correspondante est détectée.

> ⚠️ **Important (Geev)** : ce projet n'utilise **aucune API privée**, **aucun scraping agressif**, **aucun contournement CAPTCHA/authentification**. La surveillance réelle de Geev nécessite une API officielle ou une autorisation explicite. En attendant, la source `mock` est utilisée pour le développement et les tests.

## Stack et architecture

- **Frontend** : Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend** : Route Handlers Next.js + Server Actions
- **Persistance locale par défaut** : SQLite via Prisma
- **Évolutivité** : architecture par abstractions (`ListingSource`, canaux de notification) pour remplacer la source mock par une source officielle autorisée

### Composants principaux

- `src/lib/sources/*` : abstraction de source d'annonces
  - `mock-source.ts` : source de dev/test
  - `official-source.ts` : adaptateur placeholder pour future API officielle
- `src/lib/alerts/filter.ts` : filtrage catégories, mots-clés `ANY`/`ALL`, localisation
- `src/lib/worker/run-detection-cycle.ts` : boucle de détection, lock anti-concurrence, idempotence, logs
- `src/lib/notifications/*` : notifications Discord + interfaces Web Push/Telegram/Email

## Fonctionnalités couvertes

- Tableau de bord
- Gestion des alertes (création, modification, suppression, activation)
- Catégories multiples configurables
- Mots-clés multiples avec mode `ANY` / `ALL`
- Localisation : ville, code postal ou coordonnées + rayon 1/5/10/20 km
- Historique des annonces détectées
- Déduplication par identifiant stable (`stableId`) + source
- Notifications :
  - Discord webhook côté serveur
  - Web Push/Telegram/Email via interfaces extensibles
  - endpoint de test de notification
- Worker manuel/cron avec verrouillage, logs structurés, idempotence
- Validation côté serveur (Zod) + rate limit sur endpoints sensibles

## Prérequis

- Node.js 20+
- npm 10+

## Installation

```bash
npm install
cp .env.example .env
```

## Variables d'environnement

Voir `.env.example` :

- `DATABASE_URL` (par défaut `file:./dev.db`)
- `LISTING_SOURCE` (`mock` par défaut)
- `DISCORD_WEBHOOK_URL` (optionnel)
- limites de requêtes notifications/worker

Aucun secret ne doit être exposé au client.

## Initialisation de la base

```bash
npm run db:migrate
```

Cette commande applique les migrations Prisma et génère le client.

## Lancement local

```bash
npm run dev
```

Application: http://localhost:3000

## Worker / cron

Exécution ponctuelle :

```bash
npm run worker:run
```

Pour un cron, exécuter périodiquement cette commande via votre scheduler (GitHub Actions, cron système, etc.).

## Parcours mock complet (démo)

1. Créer une alerte (`/alerts/new`)
2. Aller dans `/settings/notifications` et ajouter une annonce mock
3. Lancer le worker via le bouton ou `npm run worker:run`
4. Vérifier les résultats dans `/history`
5. Tester l'endpoint de notification

## Notifications

- **Discord** : activer le canal + webhook dans `/settings/notifications` (stockage serveur)
- **Web Push** : endpoint d'inscription prêt (`/api/push/subscribe`), canal extensible
- **Telegram / e-mail** : interfaces prêtes, implémentation à brancher côté serveur

## Tests, qualité et build

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Tests inclus :

- filtrage des alertes (`ANY/ALL` + localisation)
- dédoublonnage + persistance des détections
- notification Discord (mockée)

## Déploiement

- Déployer sur un environnement Node.js compatible Next.js
- Configurer les variables d'environnement serveur
- Exécuter les migrations Prisma au déploiement (`npm run db:deploy`)
- Configurer un job planifié pour le worker

## Limites connues

- La source `mock` simule les annonces pour valider l'architecture.
- La surveillance Geev réelle n'est pas active sans API officielle/autorisation.
- Les canaux Telegram/e-mail/Web Push sont extensibles mais partiellement implémentés.

## Remplacement par API officielle Geev

1. Implémenter un nouvel adaptateur `ListingSource` dans `src/lib/sources/`
2. Respecter strictement CGU, quotas et permissions
3. Activer via `LISTING_SOURCE=<nouvelle-source>`
4. Conserver les mêmes structures de déduplication, filtrage et notifications
