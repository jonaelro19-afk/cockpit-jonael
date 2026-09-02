# Contribuer au cockpit

Ce guide s'adresse à un contributeur qui travaille **uniquement sur l'onglet
M&J Production**. Il sert aussi de contexte à Claude Code : lis-le en entier avant
de modifier quoi que ce soit.

---

## 1. Ce sur quoi tu travailles

**Périmètre autorisé : l'onglet M&J Production, rien d'autre.**

| Tu peux modifier librement | Chemin |
|---|---|
| Toutes les pages M&J : accueil, frise, clients, devis, suivi matériel, **Agents IA**, **Mémo** | `src/app/mj/**` |
| La logique métier M&J (helpers, requêtes, notes, contexte IA) | `src/lib/mj.ts`, `src/lib/mj-shared.ts`, `src/lib/mj-notes.ts`, `src/lib/mj-context.ts` |
| L'assistant IA M&J | `src/lib/ai/mj-assistant.ts` |

Tu peux aussi te connecter à l'app en ligne : tu ne verras que l'onglet
**M&J** (Gmail, agenda, sport, tâches, BTS de Jonael te sont masqués).

| À NE PAS toucher (autres modules) | Pourquoi |
|---|---|
| `src/app/bts/`, `src/app/sport/`, `src/app/gmail/`, `src/app/timebox/`, `src/app/taches/`, `src/app/parametres/` | autres onglets |
| `src/lib/` (sauf `mj*.ts`), `src/auth.ts`, `src/lib/google/`, `src/lib/ai/` | cœur de l'app |
| `src/components/` | composants partagés par tous les onglets |

| Fichiers PARTAGÉS — modif possible mais signale-la dans la PR | Impact |
|---|---|
| `prisma/schema.prisma` | modèles `Client`, `Project`, `Quote`, `QuoteLine`, `TarifItem`, `Equipment` = M&J, mais le fichier est commun. Une migration mal faite casse toute la base. |
| `src/lib/modules.ts` | l'entrée « M&J » du menu |
| `src/app/page.tsx` | la carte M&J du tableau de bord |
| `src/app/globals.css` | styles globaux |

Si ton changement a besoin d'un fichier hors périmètre : **arrête-toi et
demande à Jonael.**

---

## 2. Installation (une fois)

Prérequis : **Node.js 20+**, **Git**, et **Claude Code** (inclus dans Claude Pro).

```bash
git clone https://github.com/jonaelro19-afk/cockpit-jonael.git
cd cockpit-jonael
npm install
```

### Base de données de développement (la tienne, isolée)

L'app a besoin d'une base Postgres pour démarrer. **N'utilise pas celle de
Jonael.** Crée la tienne, gratuite, en 5 min :

1. [neon.tech](https://neon.tech) → *Sign up* → *Create project* « cockpit-dev »
   (région Europe).
2. Récupère les deux chaînes de connexion (voir `DEPLOY.md`).
3. Crée un fichier `.env` à la racine (jamais versionné) :

   ```bash
   DATABASE_URL="postgresql://...-pooler...neon.tech/neondb?sslmode=require"
   DATABASE_URL_UNPOOLED="postgresql://...neon.tech/neondb?sslmode=require"
   AUTH_SECRET="$(openssl rand -base64 33)"
   AUTH_URL="http://localhost:3000"
   ALLOWED_EMAIL="ton.email@gmail.com"
   # AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET : demande à Jonael un client OAuth de test,
   # ou laisse vide (la connexion Google ne marchera pas en local, mais les pages
   # M&J s'affichent avec des données de démo).
   ```

4. Prépare la base :

   ```bash
   npx prisma migrate deploy
   npm run db:seed          # calendriers de démo
   npm run import:carnet    # matières BTS de démo (facultatif)
   ```

   Pour avoir des clients / projets M&J de test, ajoute-les depuis l'interface.

### Lancer en local

```bash
npm run dev      # http://localhost:3000
```

Pour le travail visuel, tu verras la mise en page tout de suite. Pour vérifier
avec de **vraies données**, regarde l'**URL de preview Vercel** générée
automatiquement sur ta Pull Request (voir §4).

---

## 3. Conventions de code

- **Next.js 16 modifié** : lis `AGENTS.md` — certaines API diffèrent de ce que tu
  connais. La doc est dans `node_modules/next/dist/docs/`.
- Écris du code qui **ressemble au code autour** : mêmes noms, même style, mêmes
  commentaires (en français).
- Composants client (`"use client"`) : ne jamais importer un fichier qui importe
  Prisma. Pour M&J, tout ce qui est partagé avec le client va dans
  `src/lib/mj-shared.ts` (sans Prisma) ; `src/lib/mj.ts` le ré-exporte.
- Design : n'utilise que les classes/variables existantes (`bg-surface`,
  `text-muted`, `.btn-primary`, `.chip`, `--radius-card`…). Thème sombre
  uniquement.

### Avant chaque Pull Request, ces 3 commandes doivent passer :

```bash
npx tsc --noEmit      # types OK
npx eslint src/       # lint OK
npm run build         # build de production OK
```

---

## 4. Workflow : branche → Pull Request → Jonael valide

**Tu ne pousses jamais sur `main`. Tu ne fusionnes jamais toi-même.**

```bash
git checkout main
git pull
git checkout -b mj/ma-modif          # nom : toujours préfixé "mj/"
# ... tes changements ...
npx tsc --noEmit && npx eslint src/ && npm run build   # tout doit être vert
git add -A
git commit -m "M&J : description courte de ce qui change"
git push -u origin mj/ma-modif
```

Puis sur GitHub : **Compare & pull request**.

Dans la PR :
- décris ce que tu as changé et pourquoi ;
- si tu as touché un **fichier partagé** (§1), dis-le explicitement ;
- attends que **Vercel** poste l'URL de preview (commentaire automatique) et
  vérifie ton rendu dessus ;
- attends la **relecture et la fusion par Jonael**. Ne merge pas.

### Si Jonael te demande des corrections

```bash
# sur la même branche
git add -A && git commit -m "M&J : corrections demandées"
git push
```

La PR se met à jour toute seule.

---

## 5. Résumé pour Claude Code

Quand tu assistes un contributeur sur ce dépôt :

1. **Reste dans `src/app/mj/**` et `src/lib/mj*.ts`.** Refuse d'éditer un autre
   module ; propose plutôt d'en parler à Jonael.
2. Toujours finir par `npx tsc --noEmit`, `npx eslint src/`, `npm run build`.
3. Ne crée jamais de commit sur `main` ; travaille sur une branche `mj/…` et
   prépare une PR.
4. Ne touche pas aux secrets, à `.env`, ni aux fichiers d'auth / Google / IA.
5. Lis `AGENTS.md` : ce Next.js a des différences avec ton entraînement.
