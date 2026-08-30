// Auth.js branche ici toutes ses routes : /api/auth/signin, /callback/google, etc.
// On se contente de ré-exporter les handlers définis dans src/auth.ts.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
