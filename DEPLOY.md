# Mise en ligne — Vercel + Neon Postgres

Le code est prêt : `src/lib/prisma.ts` choisit l'adaptateur tout seul
(SQLite en local, Neon si `DATABASE_URL` commence par `postgres`).

## 1. Créer la base (Neon)

1. [neon.tech](https://neon.tech) → *New project* « cockpit », région Frankfurt.
2. Copier les 2 chaînes de connexion :
   - **Pooled** (hôte avec `-pooler`) → `DATABASE_URL`
   - **Direct** (sans `-pooler`) → `DATABASE_URL_UNPOOLED`

## 2. Basculer Prisma en Postgres (local)

```bash
# 1. dans prisma/schema.prisma : provider = "postgresql"
# 2. .env : mettre les 2 URLs Neon
rm -rf prisma/migrations/*                 # les migrations SQLite sont incompatibles
npx prisma migrate dev --name init         # crée + applique le schéma sur Neon
npx prisma generate
npm run db:load                            # réinjecte scripts/data-dump.json
npx prisma studio                          # vérifier les compteurs
```

> `scripts/data-dump.json` a été généré par `npm run db:dump` (avant la bascule).
> Il contient les jetons OAuth : il est gitignoré, ne jamais le committer.

## 3. GitHub

```bash
git add -A
git commit -m "Cockpit v1"
gh repo create cockpit-jonael --private --source=. --push
# (ou : créer le repo sur github.com puis git remote add origin … && git push -u origin main)
```

## 4. Vercel

1. [vercel.com](https://vercel.com) → *Add New Project* → importer le repo GitHub.
2. **Environment Variables** :

   | Clé | Valeur |
   |---|---|
   | `DATABASE_URL` | Neon pooled |
   | `DATABASE_URL_UNPOOLED` | Neon direct |
   | `AUTH_SECRET` | (valeur du `.env` local) |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | (idem `.env`) |
   | `ALLOWED_EMAIL` | `jonael.ro19@gmail.com` |
   | `AUTH_URL` | *(après le 1er déploiement : l'URL Vercel)* |

3. **Deploy**. Le build lance `prisma migrate deploy && next build` (script `vercel-build`).

## 5. OAuth Google en production

Google Cloud Console → **Identifiants → OAuth client ID** → ajouter :
- **Origines JS** : `https://<projet>.vercel.app`
- **Redirect URI** : `https://<projet>.vercel.app/api/auth/callback/google`

Puis dans Vercel : renseigner `AUTH_URL` → **Redeploy**.

## 6. Vérifier

Ouvrir l'URL Vercel → connexion Google → parcourir les modules.
Sur téléphone : « Ajouter à l'écran d'accueil ».

## Retour en arrière (SQLite local)

`prisma/schema.prisma` : `provider = "sqlite"` · `.env` : `DATABASE_URL="file:./prisma/dev.db"`
· `npx prisma generate`. La base `prisma/dev.db` est toujours là.
