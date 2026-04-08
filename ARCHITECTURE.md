# Architecture MVP : SaaS Cartes Virtuelles

## 1. Structure des dossiers Next.js (App Router)

Pour garder une approche simple et progressive, nous utiliserons la structure suivante :

```text
/
├── src/
│   ├── app/
│   │   ├── (auth)/               # Pages liées à l'authentification
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/          # Espace privé du commerçant
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Vue d'ensemble (Dashboard)
│   │   │   ├── cards/page.tsx    # Gestion des modèles de cartes
│   │   │   ├── passes/page.tsx   # Liste des passes générés pour les clients
│   │   │   └── scans/page.tsx    # Historique des scans
│   │   ├── c/                    # URLs publiques pour les clients
│   │   │   └── [slug]/page.tsx   # Page de récupération/affichage de la carte
│   │   ├── api/                  # Routes API (Next.js API Routes)
│   │   │   └── ...               # (voir section 3)
│   │   ├── layout.tsx            # Layout principal (Root)
│   │   └── page.tsx              # Landing page publique (marketing)
│   ├── components/               # Composants UI réutilisables (Boutons, Modales, etc.)
│   ├── lib/                      # Utilitaires et configurations
│   │   └── supabase/             # Client Supabase
│   │       ├── client.ts         # Client Supabase (côté navigateur)
│   │       └── server.ts         # Client Supabase (côté serveur)
│   └── types/                    # Définitions des types TypeScript
```

## 2. Schéma des tables Supabase (PostgreSQL)

L'architecture multi-tenant utilise une approche par clé de locataire (`tenant_id`) dans chaque table. L'isolation des données (Row Level Security - RLS) dans Supabase garantira que chaque commerçant ne voit que ses données.

### Table `tenants` (Commerçants)
Représente les comptes commerçants inscrits sur la plateforme.
- `id` (uuid, PK) : Identifiant unique du commerçant.
- `user_id` (uuid, unique) : Lien vers l'utilisateur Supabase Auth.
- `name` (text) : Nom du commerce.
- `slug` (text, unique) : Identifiant lisible pour d'éventuelles URLs (optionnel).
- `created_at` (timestamp)

### Table `cards` (Modèles de cartes)
Représente les designs et la configuration des cartes créées par un commerçant.
- `id` (uuid, PK)
- `tenant_id` (uuid, FK vers `tenants.id`)
- `title` (text) : Titre de la carte (ex: "Carte de fidélité VIP").
- `type` (text) : Type de carte ("loyalty", "business_card").
- `design_config` (jsonb) : Couleurs, logo, et informations de style pour Apple/Google Wallet.
- `created_at` (timestamp)

### Table `passes` (Passes distribués)
Représente une instance de carte attribuée à un client spécifique.
- `id` (uuid, PK)
- `tenant_id` (uuid, FK vers `tenants.id`)
- `card_id` (uuid, FK vers `cards.id`)
- `pass_slug` (text, unique) : Identifiant unique pour le lien public de ce pass (ex: `tonapp.com/c/abc-123`).
- `customer_name` (text, nullable) : Nom du client.
- `customer_email` (text, nullable) : Email du client.
- `points` (integer) : Nombre de points de fidélité (si type = "loyalty", par défaut 0).
- `status` (text) : Statut du pass ("active", "revoked", par défaut "active").
- `created_at` (timestamp)

### Table `scans` (Historique des scans)
Historise chaque interaction (scan d'un QR code ou NFC) avec un pass. Utile pour les analytiques du MVP.
- `id` (uuid, PK)
- `tenant_id` (uuid, FK vers `tenants.id`)
- `pass_id` (uuid, FK vers `passes.id`)
- `scanned_at` (timestamp)
- `action_type` (text) : Type d'action ("point_added", "reward_claimed", "viewed").
- `device_info` (text, nullable) : Infos de base sur l'appareil ayant scanné.

## 3. Routes API principales à prévoir

Dans Next.js App Router, ces routes seront implémentées sous `src/app/api/...` sous forme de Route Handlers (`route.ts`).

- **`/api/cards` (POST)**
  Permet au commerçant de créer un nouveau modèle de carte (enregistre dans la table `cards`).

- **`/api/passes` (POST)**
  Génère un nouveau pass pour un client. Crée une entrée dans `passes` et retourne le lien public de récupération (le `slug`).

- **`/api/passes/[pass_slug]/apple` (GET)**
  Route essentielle pour générer et télécharger le fichier `.pkpass` spécifique à Apple Wallet "à la volée", sans devoir stocker le fichier généré.

- **`/api/passes/[pass_slug]/google` (GET)**
  Route pour générer le lien "Save to Google Wallet" (génère un JWT signé pour l'API Google Pay).

- **`/api/scans` (POST)**
  Appelée lorsqu'un commerçant scanne le pass d'un client. Vérifie la validité du pass, met à jour les `points` dans la table `passes` et ajoute une entrée d'historique dans `scans`.
