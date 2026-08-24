import Link from "next/link";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  KANDIDAT: "Kandidat",
  ANSOKT: "Ansökt",
  GODKAND: "Godkänd",
  INAKTIV: "Inaktiv",
};

const STATUSES = ["ALLA", "KANDIDAT", "ANSOKT", "GODKAND", "INAKTIV"] as const;

export default async function ProducenterPage({
  searchParams,
}: PageProps<"/admin/producenter">) {
  const params = await searchParams;
  const statusFilterRaw = params?.status;
  const statusFilter = (Array.isArray(statusFilterRaw) ? statusFilterRaw[0] : statusFilterRaw) ?? "ALLA";

  const producers = await prisma.producer.findMany({
    where: statusFilter === "ALLA" ? {} : { status: statusFilter as never },
    include: { _count: { select: { produkter: true } } },
    orderBy: { namn: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold">Producenter</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-paper">
          Producenter &amp; kandidater
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === "ALLA" ? "/admin/producenter" : `/admin/producenter?status=${s}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wide ${
              statusFilter === s
                ? "border-gold bg-gold text-ink font-bold"
                : "border-line text-paper/70 hover:border-gold hover:text-gold"
            }`}
          >
            {s === "ALLA" ? "Alla" : STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {producers.length === 0 ? (
        <p className="text-sm opacity-60">Inga producenter i den här kategorin.</p>
      ) : (
        <div className="flex flex-col">
          {producers.map((p) => (
            <Link
              key={p.id}
              href={`/admin/producenter/${p.id}`}
              className="flex items-center justify-between gap-4 border-t border-line py-3 text-sm hover:bg-cellar-2/40"
            >
              <div>
                <p className="font-medium">{p.namn}</p>
                <p className="text-xs opacity-60">
                  {p.region || "region ej angiven"} · {p._count.produkter} varor
                </p>
              </div>
              <span className="font-mono text-xs uppercase tracking-wide text-gold">
                {STATUS_LABEL[p.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
