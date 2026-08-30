import Link from "next/link";
import { Camera, ShoppingCart } from "lucide-react";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import MjTabs from "../MjTabs";
import PurchasedButton from "./PurchasedButton";
import { getEquipment } from "@/lib/mj";
import { fmtEur, PRIORITY_LABEL } from "@/lib/mj-shared";

export default async function SuiviPage() {
  const { owned, wishlist, ownedValue, wishlistValue } = await getEquipment();

  // Regroupe le matériel possédé par catégorie.
  const byCategory = owned.reduce<Record<string, typeof owned>>((acc, e) => {
    (acc[e.category] ??= []).push(e);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="M&J Prod"
        subtitle="Suivi matériel"
        action={
          <div className="flex gap-2">
            <Link href="/mj/suivi/nouveau" className="btn-secondary">
              + Matériel
            </Link>
            <Link href="/mj/suivi/nouveau?wishlist=1" className="btn-primary">
              + À acheter
            </Link>
          </div>
        }
      />
      <MjTabs />

      <div className="mb-5 grid grid-cols-2 gap-4">
        <Card>
          <p className="text-2xl font-extrabold tracking-tight">
            {fmtEur(ownedValue)}
          </p>
          <p className="text-xs text-muted">
            valeur du parc · {owned.length} articles
          </p>
        </Card>
        <Card>
          <p className="text-2xl font-extrabold tracking-tight text-lime">
            {fmtEur(wishlistValue)}
          </p>
          <p className="text-xs text-muted">
            à acheter · {wishlist.length} articles
          </p>
        </Card>
      </div>

      <Card title="Parc matériel" className="mb-5">
        {owned.length === 0 ? (
          <EmptyState
            Icon={Camera}
            title="Aucun matériel"
            hint="Ajoute ton parc : boîtiers, objectifs, son, lumière…"
            action={
              <Link href="/mj/suivi/nouveau" className="btn-primary">
                Ajouter du matériel
              </Link>
            }
          />
        ) : (
          Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className="mb-4 last:mb-0">
              <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-muted">
                {cat}
              </p>
              <ul className="divide-y divide-line">
                {items.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/mj/suivi/${e.id}`}
                      className="flex items-center gap-3 py-2.5 hover:opacity-80"
                    >
                      <span className="flex-1 truncate text-sm text-text">
                        {e.name}
                        {e.reference && (
                          <span className="ml-2 font-mono text-[10px] text-muted">
                            {e.reference}
                          </span>
                        )}
                      </span>
                      {e.condition && (
                        <span className="text-xs text-muted">{e.condition}</span>
                      )}
                      <span className="shrink-0 text-xs tabular-nums text-muted">
                        {fmtEur(e.priceEur)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </Card>

      <Card title="Liste d'achats">
        {wishlist.length === 0 ? (
          <EmptyState
            Icon={ShoppingCart}
            title="Liste d'achats vide"
            hint="Note le matériel à acquérir, avec priorité et budget estimé."
          />
        ) : (
          <ul className="divide-y divide-line">
            {wishlist.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2.5">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    e.priority === 1
                      ? "bg-live"
                      : e.priority === 2
                        ? "bg-warn"
                        : "bg-faint"
                  }`}
                  title={`priorité ${PRIORITY_LABEL[e.priority]}`}
                />
                <Link
                  href={`/mj/suivi/${e.id}`}
                  className="min-w-0 flex-1 truncate text-sm text-text hover:opacity-80"
                >
                  {e.name}
                  <span className="ml-2 text-xs text-muted">{e.category}</span>
                </Link>
                <span className="shrink-0 text-xs tabular-nums text-muted">
                  {fmtEur(e.priceEur)}
                </span>
                <PurchasedButton id={e.id} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
