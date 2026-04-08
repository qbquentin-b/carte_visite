# Prompt Jules — Architecture MVP SaaS cartes virtuelles
 
## Contexte du projet
 
Je construis un SaaS de cartes de fidélité et cartes de visite virtuelles compatibles Apple Wallet et Google Wallet. L'objectif est de permettre à des commerçants de créer et distribuer des cartes numériques à leurs clients, accessibles via QR code, lien ou puce NFC.
 
## Stack choisie
 
- **Next.js** (App Router) — front + API Routes
- **Supabase** — authentification + base de données PostgreSQL
- **Vercel** — hébergement et déploiement continu
- Tout est gratuit pour le moment, pas de service payant
 
## Modèle multi-tenant
 
Chaque commerçant est un tenant. Ses clients portent des cartes associées à son compte. L'isolation se fait par `tenant_id` en base, pas par base de données séparée. Les cartes sont accessibles via des URLs de type `tonapp.com/c/[slug]`.
 
## Ce que je veux que tu fasses
 
Propose-moi uniquement l'architecture de départ :
 
- Structure des dossiers Next.js (App Router)
- Schéma des tables Supabase essentielles (tenants, cards, passes, scans)
- Les routes API principales à prévoir
 
Ne génère pas encore de code fonctionnel, juste la structure et les noms — je veux valider l'archi avant de commencer à coder.
 
## Contraintes
 
- Je suis à l'aise en React mais débutant sur Next.js App Router et Supabase
- Garder les choses simples et progressives
- Pas de sur-ingénierie : on part d'un MVP
- Le projet doit pouvoir tourner en local pour le développement
