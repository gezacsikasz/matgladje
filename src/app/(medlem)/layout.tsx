import Link from "next/link";
import { requireHousehold } from "@/lib/dal";
import { getCurrentAndNextPeriod } from "@/lib/periods-db";
import { getSelectedPeriodKey } from "@/lib/period-selection";
import { setPeriodAction } from "@/lib/actions/period-selection";
import { logoutAction } from "@/lib/actions/auth";
import { fmtDateRange, fmtDate } from "@/lib/format";

const NAV = [
  { href: "/skafferi", label: "Skafferi" },
  { href: "/korg", label: "Korg" },
  { href: "/min-sida", label: "Min sida" },
];

export default async function MedlemLayout({ children }: { children: React.ReactNode }) {
  const household = await requireHousehold();
  const { current, next } = await getCurrentAndNextPeriod();
  const selected = await getSelectedPeriodKey();
  const period = selected === "next" ? next : current;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cellar-2 px-6 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-gold">Matglädje</p>
          </div>
          {period && (
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs opacity-80">
                Period <b className="text-gold">{period.num}</b> ·{" "}
                {fmtDateRange(period.startDatum, period.slutDatum)}
              </span>
              <span className="hidden text-[11px] opacity-50 sm:inline">
                beställ senast {fmtDate(period.deadlineDatum)}
              </span>
              <div className="flex rounded-full border border-line bg-cellar p-0.5">
                <form action={setPeriodAction.bind(null, "current")}>
                  <button
                    type="submit"
                    className={`rounded-full px-3 py-1.5 text-xs ${
                      selected === "current" ? "bg-gold font-bold text-ink" : "text-paper/70"
                    }`}
                  >
                    Denna period
                  </button>
                </form>
                <form action={setPeriodAction.bind(null, "next")}>
                  <button
                    type="submit"
                    className={`rounded-full px-3 py-1.5 text-xs ${
                      selected === "next" ? "bg-gold font-bold text-ink" : "text-paper/70"
                    }`}
                  >
                    Nästa period
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
        <nav className="flex flex-wrap gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm text-paper/80 transition hover:bg-cellar-3 hover:text-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm text-paper/70">
          <span>{household.namn}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-sm border border-line px-3 py-1.5 text-xs uppercase tracking-wide text-paper/80 hover:border-gold hover:text-gold"
            >
              Logga ut
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
