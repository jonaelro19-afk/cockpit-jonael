import { Mail, Sparkles, Power, AlertCircle, Check } from "lucide-react";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { SignInWithGoogle } from "@/components/SignInWithGoogle";
import MailRow from "./MailRow";
import ArchiveBucketButton from "./ArchiveBucketButton";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { loadInbox } from "@/lib/gmail-inbox";

const GCP_PROJECT = "455691093694";

export default async function GmailPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <>
        <PageHeader title="Gmail" subtitle="Tes mails non lus, triés" />
        <Card>
          <EmptyState
            Icon={Mail}
            title="Connexion requise"
            hint="Connecte ton compte Google pour trier ta boîte."
            action={<SignInWithGoogle callbackUrl="/gmail" />}
          />
        </Card>
      </>
    );
  }

  const [result, account] = await Promise.all([
    loadInbox(session.user.id),
    prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
      select: { scope: true },
    }),
  ]);
  const canArchive = account?.scope?.includes("gmail.modify") ?? false;

  if (!result.ok) {
    if (result.reason === "reconnect") {
      return (
        <>
          <PageHeader title="Gmail" subtitle="Accès à finaliser" />
          <Card>
            <EmptyState
              Icon={Mail}
              title="Compte Google à reconnecter"
              hint="L'accès à Gmail doit être renouvelé."
              action={<SignInWithGoogle callbackUrl="/gmail" />}
            />
          </Card>
        </>
      );
    }
    return (
      <>
        <PageHeader title="Gmail" subtitle="Accès à finaliser" />
        <Card>
          {result.reason === "api-disabled" ? (
            <EmptyState
              Icon={Power}
              title="Activer l'API Gmail"
              hint="La permission est accordée, mais l'API Gmail n'est pas activée dans ton projet Google Cloud."
              action={
                <a
                  href={`https://console.cloud.google.com/apis/library/gmail.googleapis.com?project=${GCP_PROJECT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Ouvrir Google Cloud → Activer
                </a>
              }
            />
          ) : result.reason === "scope" ? (
            <EmptyState
              Icon={Mail}
              title="Autoriser Gmail"
              hint="Reconnecte ton compte Google pour accorder la lecture des mails. L'agenda continuera de fonctionner."
              action={<SignInWithGoogle callbackUrl="/gmail" />}
            />
          ) : (
            <EmptyState
              Icon={Mail}
              title="Gmail indisponible"
              hint="Impossible de récupérer les mails pour le moment."
            />
          )}
        </Card>
      </>
    );
  }

  const { mails } = result;
  const important = mails.filter((m) => m.bucket === "important");
  const avoir = mails.filter((m) => m.bucket === "avoir");
  const bruit = mails.filter((m) => m.bucket === "bruit");

  if (mails.length === 0) {
    return (
      <>
        <PageHeader title="Gmail" subtitle="Mails non lus" />
        <Card>
          <EmptyState
            Icon={Check}
            title="Boîte à jour"
            hint="Aucun mail non lu depuis le 30/07/2026. Tout est traité 🎉"
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Gmail"
        subtitle={`${mails.length} non lus · ${important.length} importants · ${bruit.length} pubs`}
      />

      {!canArchive && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-field border border-amber-400/30 bg-amber-400/10 px-4 py-3">
          <p className="text-xs text-amber-300">
            Pour archiver depuis l&apos;app, une permission Gmail supplémentaire
            est nécessaire.
          </p>
          <SignInWithGoogle callbackUrl="/gmail" />
        </div>
      )}

      {/* IMPORTANTS — tout en haut, en rouge */}
      <section className="mb-5 overflow-hidden rounded-card border-2 border-live/50 bg-live/[0.06]">
        <div className="flex items-center gap-2 border-b border-live/25 px-5 py-3">
          <AlertCircle size={18} className="text-live" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-live">
            À traiter en priorité — {important.length}
          </h2>
        </div>
        {important.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-muted">
            Rien d&apos;urgent parmi tes non-lus.
          </p>
        ) : (
          <ul className="divide-y divide-live/15 px-5">
            {important.map((m) => (
              <MailRow key={m.id} mail={m} canArchive={canArchive} />
            ))}
          </ul>
        )}
      </section>

      {/* À VOIR */}
      {avoir.length > 0 && (
        <Card
          title={`À voir — ${avoir.length}`}
          className="mb-5"
          action={
            canArchive && <ArchiveBucketButton bucket="avoir" count={avoir.length} />
          }
        >
          <ul className="divide-y divide-line">
            {avoir.map((m) => (
              <MailRow key={m.id} mail={m} showReason canArchive={canArchive} />
            ))}
          </ul>
        </Card>
      )}

      {/* BRUIT — pubs / offres / sponsors, à archiver */}
      {bruit.length > 0 && (
        <Card
          title={`Pubs & offres — ${bruit.length}`}
          className="mb-5"
          action={
            canArchive && <ArchiveBucketButton bucket="bruit" count={bruit.length} />
          }
        >
          <p className="mb-3 text-xs text-muted">
            Uniquement des pubs, promos et démarchages sponsor. Les archiver les
            retire de la boîte (ils restent dans « Tous les messages »).
          </p>
          <ul className="divide-y divide-line">
            {bruit.map((m) => (
              <MailRow key={m.id} mail={m} showReason canArchive={canArchive} />
            ))}
          </ul>
        </Card>
      )}

      <Card
        title="Comment marche le tri"
        action={
          <span className="flex items-center gap-1 text-xs text-muted">
            <Sparkles size={13} /> règles
          </span>
        }
      >
        <p className="text-sm text-muted">
          Seuls les mails <b>non lus reçus à partir du 30/07/2026</b> sont
          affichés. Règle : <b>seules les pubs, offres et démarchages sponsor</b>{" "}
          sont mis de côté pour archivage. <b>Tout le reste</b> — vraies
          personnes, organismes, scouts, ce qui touche à M&amp;J Production,
          tes clients — passe en{" "}
          <span className="text-live">important</span>, pour ne rien louper.
          Codes et suivis de livraison vont dans « À voir » (gardés, jamais
          archivés).
        </p>
      </Card>
    </>
  );
}
