import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Download, FileText, Receipt, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <p className="text-3d-soft text-sm text-slate-500">{label}</p>
      <p className="text-3d-title mt-2 text-2xl font-semibold tracking-tight text-black">
        {value}
      </p>
    </div>
  );
}

function InvoiceRow({
  id,
  label,
  amount,
  status,
  date,
}: {
  id: string;
  label: string;
  amount: string;
  status: string;
  date: string;
}) {
  return (
    <div className="animate-fade-up flex flex-col gap-4 border-b border-[#ece7e0] py-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-3d-soft text-xs font-semibold uppercase tracking-wide text-slate-500">
          {id}
        </p>
        <h3 className="text-3d-title mt-2 text-[15px] font-semibold text-black">
          {label}
        </h3>
        <p className="text-3d-soft mt-2 text-sm text-slate-600">Date : {date}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="text-left sm:text-right">
          <p className="text-3d-soft text-xs text-slate-500">Montant</p>
          <p className="text-3d-title mt-1 text-lg font-semibold text-black">
            {amount}
          </p>
        </div>

        <span className="text-3d-soft inline-flex rounded-full border border-[#e4ddd4] bg-[#faf7f2] px-3 py-2 text-xs font-semibold text-[#171311]">
          {status}
        </span>

        <button
          type="button"
          className="text-3d-soft inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
        >
          <Download className="h-4 w-4" />
          Télécharger
        </button>
      </div>
    </div>
  );
}

function SimpleLine({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up flex flex-col gap-4 border-b border-[#ece7e0] py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f5f3ef] text-[#171311]">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-3d-title text-[15px] font-semibold text-black">
            {title}
          </h3>
          <p className="text-3d-soft mt-1 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export default async function CompteFacturesPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/connexion");
  }

  const email = user.email ?? "";

  const invoices = [
    {
      id: "FAC-2026-001",
      label: "Abonnement compte professionnel",
      amount: "0,00 €",
      status: "À venir",
      date: "—",
    },
    {
      id: "FAC-2026-002",
      label: "Options de mise en avant",
      amount: "0,00 €",
      status: "Aucune facture",
      date: "—",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="animate-fade-up flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/compte" className="text-3d-soft font-medium text-[#171311] hover:underline">
          Mon compte
        </Link>
        <span>›</span>
        <span className="text-3d-soft">Factures</span>
      </div>

      <section className="mt-5 border-b border-[#ece7e0] pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
            <p className="text-3d-soft text-sm text-slate-500">Compte particulier</p>
            <h1 className="text-3d-hero mt-1 text-3xl font-bold tracking-tight text-black">
              Factures
            </h1>
            <p className="text-3d-soft mt-2 text-sm text-slate-600">
              Retrouvez ici vos documents de facturation, paiements et informations de compte.
            </p>
          </div>

          <Link
            href="/compte"
            className="text-3d-soft animate-fade-up inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
            style={{ animationDelay: "0.12s" }}
          >
            Retour au compte
          </Link>
        </div>
      </section>

      <section className="py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryItem label="Factures disponibles" value="0" />
          <SummaryItem label="Montant payé" value="0,00 €" />
          <SummaryItem label="Email de facturation" value={email} />
        </div>
      </section>

      <section className="py-2">
        <div className="border-b border-[#ece7e0] pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
              <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black">
                Historique
              </h2>
              <p className="text-3d-soft mt-1 text-sm text-slate-600">
                Les prochaines factures et paiements apparaîtront ici.
              </p>
            </div>

            <button
              type="button"
              className="text-3d-soft animate-fade-up inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
              style={{ animationDelay: "0.12s" }}
            >
              <Download className="h-4 w-4" />
              Télécharger toutes les factures
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {invoices.map((invoice) => (
            <InvoiceRow
              key={invoice.id}
              id={invoice.id}
              label={invoice.label}
              amount={invoice.amount}
              status={invoice.status}
              date={invoice.date}
            />
          ))}
        </div>
      </section>

      <section className="py-2">
        <div className="border-b border-[#ece7e0] pb-4">
          <h2 className="text-3d-title animate-fade-up text-xl font-semibold tracking-tight text-black">
            Abonnements
          </h2>
          <p className="text-3d-soft animate-fade-up mt-1 text-sm text-slate-600" style={{ animationDelay: "0.06s" }}>
            Cette section affichera vos futurs abonnements, renouvellements et options payantes.
          </p>
        </div>

        <div className="py-6">
          <div className="animate-fade-up rounded-2xl border border-[#e4ddd4] bg-[#faf7f2] px-4 py-4">
            <p className="text-3d-title text-sm font-semibold text-black">
              Aucun abonnement actif pour le moment
            </p>
            <p className="text-3d-soft mt-2 text-sm leading-6 text-slate-600">
              Quand la facturation sera branchée, votre abonnement apparaîtra ici avec les
              prochaines échéances.
            </p>
          </div>
        </div>
      </section>

      <section className="py-2">
        <div className="border-b border-[#ece7e0] pb-4">
          <h2 className="text-3d-title animate-fade-up text-xl font-semibold tracking-tight text-black">
            Informations de facturation
          </h2>
          <p className="text-3d-soft animate-fade-up mt-1 text-sm text-slate-600" style={{ animationDelay: "0.06s" }}>
            Adresse de facturation, compte utilisé et informations associées.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          <SimpleLine
            icon={<Receipt className="h-5 w-5" />}
            title="Compte actuel"
            description={email}
            action={
              <Link
                href="/compte/parametres"
                className="text-3d-soft inline-flex items-center gap-2 rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
              >
                Modifier
                <ChevronRight className="h-4 w-4" />
              </Link>
            }
          />

          <SimpleLine
            icon={<Wallet className="h-5 w-5" />}
            title="Paiements"
            description="Aucun mode de paiement facturé pour le moment."
          />

          <SimpleLine
            icon={<FileText className="h-5 w-5" />}
            title="Documents"
            description="Vos futures factures PDF seront accessibles depuis cet espace."
          />
        </div>
      </section>
    </div>
  );
}