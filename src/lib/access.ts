// Contrôle d'accès — fonctions pures (lecture des variables d'environnement).
//
// ALLOWED_EMAIL : adresses autorisées à se connecter, séparées par des virgules.
// OWNER_EMAIL   : le "propriétaire" (Jonael). Défaut = la 1re de ALLOWED_EMAIL.
//   - propriétaire  → accès à toute l'app
//   - collaborateur → accès à l'onglet M&J uniquement
//
// (Le garde de page se fait dans les layouts : voir src/app/*/layout.tsx.)

export function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function ownerEmail(): string {
  const explicit = process.env.OWNER_EMAIL?.trim().toLowerCase();
  return explicit || allowedEmails()[0] || "";
}

export function isEmailAllowed(email?: string | null): boolean {
  if (!email) return false;
  const list = allowedEmails();
  return list.length === 0 || list.includes(email.toLowerCase());
}

export function isOwnerEmail(email?: string | null): boolean {
  return !!email && email.toLowerCase() === ownerEmail();
}

export type Role = "owner" | "collab";
export function roleFor(email?: string | null): Role {
  return isOwnerEmail(email) ? "owner" : "collab";
}
