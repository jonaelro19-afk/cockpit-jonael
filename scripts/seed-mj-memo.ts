// Insère les notes du Mémo M&J (une seule fois, si la table est vide).
//   npx tsx scripts/seed-mj-memo.ts
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

type Seed = { theme: string; title: string; body: string; pinned?: boolean };

const NOTES: Seed[] = [
  {
    theme: "Niche",
    title: "La niche à maîtriser",
    pinned: true,
    body: `**Niche principale : la VIDÉO CORPORATE pour entreprise + le TÉMOIGNAGE CLIENT.**

Domaines secondaires : mariage (photo + vidéo à deux), immobilier.

Règle 80/20 : se concentrer sur 2 domaines seulement → **projets commerciaux (corporate)** + **mariages**.

Toute réflexion (devis, proposition, visuel) doit partir de cette niche.`,
  },
  {
    theme: "Niche",
    title: "Catalogue d'offres & prix",
    pinned: true,
    body: `## Entreprise / marque
- **Vidéo de marque institutionnelle** (≤ 2 min) — transmettre 4 messages : le problème que l'entreprise résout ; la solution unique ; ses arguments de vente uniques (vs concurrent) ; le résultat recherché par le client.
- **Vidéo témoignage** — reportage + interview d'un ancien client : son expérience, le résultat atteint.
- **Vidéo récapitulative d'événement** — garder le contact avec les participants, attirer les suivants.
- **Contrat de production vidéo** — 6 mois, versement mensuel.
- **Photo en option** sur un projet vidéo entreprise / témoignage.

## Mariage
Photo + vidéo à deux. Formules **2 200 € à 7 200 €**. ~5 000 € → acompte 50 % + solde 50 % une semaine avant.

## Immobilier
Une presta par bien. Vidéo virtuelle immersive **350 € à 750 €** (selon taille + nombre de prises de vue).

## Restaurant (collaboration)
Site internet + suivi réseaux (Insta / Google Maps) + 1 reel/semaine + 4 posts/semaine (photo / pub / événements / carte). Plus tard : grosse vidéo cinématique horizontale.

## Freelance / assistanat
Projet pour une marque, rémunération tarif / forfait / horaire. Contacter agences marketing & boîtes de prod.`,
  },
  {
    theme: "Devis",
    title: "Équation de la valeur (Hormozi)",
    pinned: true,
    body: `Réf : Alex Hormozi, « $100M Offers ».

**4 piliers de tarification :**
1. Le résultat escompté par le client
2. La probabilité perçue de réussite
3. Le délai pour l'obtenir
4. Les efforts et sacrifices demandés au client

Plus on augmente le pilier 2, plus la solution paraît précieuse → plus le client accepte.

La valeur n'a pas toujours besoin d'être chiffrée, mais le client doit **comprendre** la valeur qu'il obtient, et elle doit être **importante pour lui**.`,
  },
  {
    theme: "Devis",
    title: "Ce que le devis doit contenir",
    body: `- Une section **« résumé de la réunion »**.
- **Pourquoi investir dans ce pack vidéo**, en répondant à 3 questions :
  1. Pourquoi nous embaucher ?
  2. Quel problème résoudre avec ce kit vidéo ?
  3. Quel résultat espéré ?
- **Ce que le client obtient concrètement** pour son argent (produit final décrit clairement).
- Un **lien d'exemple pour chaque livrable** (si pas d'exemple à nous → un exemple YouTube).
- Des **options additionnelles** à cocher (logique « comme au McDo »).
- La phrase : *les prises de vue supplémentaires sur site seront facturées X €*.`,
  },
  {
    theme: "Devis",
    title: "Après acceptation du devis",
    body: `1. Le client **valide par mail** (et dit s'il ajoute des options).
2. Envoi d'une **facture d'acompte de 50 %** + un **contrat de service** détaillé (solde payable à l'achèvement).
3. **Expliquer au client comment utiliser les vidéos finales.**`,
  },
  {
    theme: "Approche client",
    title: "Posture face au client (conseils Lorenzo)",
    body: `- Créer un lien avec le client.
- Savoir ce qu'il attend de nous.
- Bien suivre ses idées de plans et de vidéos.
- Connaître le discours à tenir devant le client.
- Faire une **vidéo test** (un exemple à montrer aux clients).`,
  },
  {
    theme: "Approche client",
    title: "Rapport à l'argent",
    body: `Objectif : fixer les prix des projets à **plus de 10 000 €**.

> « Comment pouvez-vous espérer que quelqu'un investisse en vous si vous n'êtes pas prêt à investir d'abord en vous-même ? »

Si on pense soi-même que 10 000 € est une grosse somme, on n'arrivera pas à vendre à ce prix.`,
  },
  {
    theme: "Approche client",
    title: "Script d'appel type (démarchage local)",
    body: `« Bonjour, je suis bien chez [nom] ? Je me permets de vous appeler parce que j'ai remarqué que sur vos réseaux sociaux vous mettez en avant une belle gamme [de produits], mais peu de photos professionnelles en action ou sur des événements. Est-ce que c'est un choix, ou plutôt un manque de temps pour produire du contenu régulier ? »

Signature : *Jonael — M&J Production*`,
  },
  {
    theme: "Approche client",
    title: "Hacks Instagram",
    body: `- **DM** : liste de prospects (via Claude), mesurer les DM, fournir une **vidéo de référence** (éviter le FOMO).
- **Hashtags** du client idéal → dans la bio + sur chaque vidéo.
- Présentation en ligne **selon le secteur** ciblé.
- **Fonction Collaboration** : collaborer avec le client sur chaque post / vidéo.
- **Stories de coulisses (BTS)** : taguer le client + un maximum de personnes.`,
  },
  {
    theme: "Approche client",
    title: "Stratégie LinkedIn",
    body: `- Nettoyer les 2 profils (mots-clés « vidéaste corporate Toulouse »).
- Cibler 15-20 contacts : French Tech, Réseau Entreprendre, La Mêlée en priorité.
- **Ne pas pitcher direct** : liker / commenter leurs posts 2-3 semaines avant de solliciter.
- Contact chaud → proposer un appel ou un café, **pas** une vente.`,
  },
  {
    theme: "Approche client",
    title: "Clubs d'affaires : ordre d'attaque",
    body: `Ne pas commencer par le haut.

1. Roder la phrase d'accroche sur **La Firme** / **La Mêlée** (les plus accessibles).
2. Remonter vers **French Tech Toulouse** et **Réseau Entreprendre** (meilleur ratio prestige / accessibilité).
3. Ensuite seulement : **Medef**, **CCI**, **Aerospace Valley**.`,
  },
  {
    theme: "Production",
    title: "Réglages caméra",
    body: `- **Général** : vitesse d'obturation 1/100.
- **Nuit (vidéo)** : max 3000 ISO ; pas de ralenti → 25 i/s à 1/50 ; profil **standard** (pas log) ; prévoir la **location d'un micro**.
- **Photo** : pas de flash ; éviter la photo de nuit.`,
  },
  {
    theme: "Production",
    title: "Matériel",
    body: `- Objectifs : **Sony 16-35 GM f/4** ; **Tamron 35-150 f/2-2.8**.
- Lumière : **Godox M1**.
- Projet Dressed : Canon + GoPro + trépied.
- Accessoire : support pour faire tourner les assiettes (plans food).
- Drone : certification via **Drone Académie**.`,
  },
  {
    theme: "Production",
    title: "Plugins DaVinci Resolve",
    body: `- Speed ramp : [Speed Ramp Lite](https://creator-academy.co/formation-davinci-resolve/plugins-davinci-resolve/speed-ramp-lite)
- Texte animé : [SnapCaptions2](https://orsonlord.com/snapcaptions2)
- Stabilisation : [Gyroflow](https://docs.gyroflow.xyz/app)
- Son : [Soundly](https://getsoundly.com/tools/)
- Bibliothèque Fusion : [Reactor / Kartaverse](https://github.com/Kartaverse/Reactor-Standalone/releases)
- Plan de tournage clair pour le client : [Monitore](https://www.monitore.co)`,
  },
  {
    theme: "Production",
    title: "Trames de tournage type",
    body: `## Restaurant format « BREF » (vertical 9:16, 4K, golden hour, stab, 2-4 s/plan)
Script voix-off « BREF, j'ai découvert LE restaurant de [village]… » (ton oral, chaleureux).
13 plans : façade (travelling) · porte POV · pano ancienne salle · transition extension · vue d'ensemble · mains du chef · viande au grill · produits locaux · plat qui arrive · gros plan viande · clients qui sourient · déco village · plan final façade.

## Chez Fernand (pizzeria)
Pizza vue de dessus · aliments au ralenti · vue four · vue de loin derrière objets · farine lancée · POV.

## Gaïa
Travelling avant entrée · porte qui s'ouvre · objets & déco · avancer comme une personne · cuisine au fond · zoom cuisine · cocktail · plan horizontal · préparation des tables.

## Dressed (mode) — transitions
Se rapprocher d'un habit → transition flou · se rapprocher puis se reculer · zoom objet/logo puis idem avec un autre.`,
  },
  {
    theme: "Prospection",
    title: "Fleuristes (Toulouse)",
    body: `- **Mahonia Fleuriste** — intéressé, infos par mail : mahoniafleuristetoulouse@gmail.com
- **Les Jardins d'Alice** — intéressé, mail patronne : jardins.alice.toulouse@gmail.com
- **La Vie en Rose** — à rappeler en **octobre** ; favorable à un shooting simple
- **Fleur de Vie** — à contacter
- Le Fleuriste — ❌
- Parc des Fleurs — ❌`,
  },
  {
    theme: "Prospection",
    title: "Restaurants",
    body: `- **Riviera Tolosa** — insta vide, potentiel
- **Chez Loustic** — pas de photo pro, irrégulier
- **Restaurant Pépère** — pas de belles photos
- **Le Saint Sauvage** — à qualifier
- **Mantesino** — à qualifier
- HOPE! — ❌
- L'Octave — ❌ (assez de clients)
- Reflets — ❌`,
  },
  {
    theme: "Prospection",
    title: "Clubs d'affaires — état & difficulté",
    body: `Du plus dur au plus accessible :
- **Aerospace Valley** — très difficile (recommandation interne nécessaire)
- **Medef 31** — 05 61 14 42 00 — difficile
- **CCI Toulouse 31** — 05 61 33 65 00 — difficile (invitation only)
- **French Tech Toulouse** — 05 36 25 21 94 — moyen-difficile (vise 400 membres, plus ouverte)
- **Réseau Entreprendre Occitanie-Garonne** ✅ — moyen, ouvert sur la com d'événements — bonne cible
- **La Mêlée** ❌ — déjà quelqu'un
- **La Firme** ❌ — personne ne répond ; bon terrain d'entraînement pour le script

Contacts Réseau Entreprendre : lgeha@reseau-entreprendre.org (pas de réponse) · adumas@reseau-entreprendre.org (à relancer).
CJD : magali.peyrot@cjd.net`,
  },
  {
    theme: "Prospection",
    title: "Appels CJD été 2026 — à relancer",
    body: `Planifiés en juillet, à relancer (on est en septembre) :
- La Firme — 19/07
- La Mêlée — 20/07
- Réseau Entreprendre Occitanie-Garonne — 23/07 (contact : Collonges)
- French Tech Toulouse — 28/07
- CCI Toulouse Haute-Garonne — 28/07

Après chaque appel : noter le statut (à appeler / relancé / devis envoyé / signé / ❌) et la prochaine action.`,
  },
  {
    theme: "Ressources",
    title: "Liens & exemples",
    body: `- Exemple de catalogue vidéos entreprise : [ybooagency.com](https://www.ybooagency.com/types-de-videos-entreprise/)
- Livre de référence tarification : *« $100M Offers »* — Alex Hormozi
- Projets en cours : « 3 vidéos » (forfaits trimestriels, vidéo émulation nautique, micro-présentation resto) · Post Insta présentation Jonaël + Malo · RAMS DJ · Dressed.`,
  },
];

(async () => {
  const count = await prisma.mjNote.count();
  if (count > 0) {
    console.log(`${count} note(s) déjà présentes — on ne réinsère pas.`);
    await prisma.$disconnect();
    return;
  }
  let order = 0;
  for (const n of NOTES) {
    await prisma.mjNote.create({
      data: {
        theme: n.theme,
        title: n.title,
        body: n.body,
        pinned: n.pinned ?? false,
        order: order++,
      },
    });
  }
  console.log(`${NOTES.length} notes insérées.`);
  await prisma.$disconnect();
})();
