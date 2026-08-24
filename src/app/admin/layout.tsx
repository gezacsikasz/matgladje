import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { logoutAction } from "@/lib/actions/auth";

const NAV = [
  { href: "/admin", label: "Översikt" },
  { href: "/admin/medlemmar", label: "Medlemmar" },
  { href: "/admin/producenter", label: "Producenter" },
  { href: "/admin/produkter", label: "Produkter" },
  { href: "/admin/perioder", label: "Perioder" },
  { href: "/admin/inbjudningar", label: "Inbjudningar" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cellar-2 px-6 py-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-gold">Matglädje</p>
          <p className="font-serif text-lg font-semibold text-paper">Admin</p>
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
          <span>{admin.email}</span>
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
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
