import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { householdKE } from "@/lib/ke";
import { fmtDate } from "@/lib/format";

export default async function MedlemmarPage() {
  const households = await prisma.household.findMany({
    include: { members: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold">Medlemmar</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-paper">Hushåll</h1>
      </div>

      {households.length === 0 ? (
        <p className="text-sm opacity-60">
          Inga hushåll än — skapa en inbjudningslänk under Inbjudningar.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide opacity-60">
                <th className="py-2 pr-4 font-normal">Hushåll</th>
                <th className="py-2 pr-4 font-normal">Personer</th>
                <th className="py-2 pr-4 font-normal">KE</th>
                <th className="py-2 pr-4 font-normal">Med sedan</th>
              </tr>
            </thead>
            <tbody>
              {households.map((h) => (
                <tr key={h.id} className="border-b border-line/60">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/medlemmar/${h.id}`} className="font-medium hover:text-gold">
                      {h.namn}
                    </Link>
                    <div className="text-xs opacity-60">{h.epost}</div>
                  </td>
                  <td className="py-3 pr-4">{h.members.length}</td>
                  <td className="py-3 pr-4 font-mono text-gold">{householdKE(h.members).toFixed(2)}</td>
                  <td className="py-3 pr-4 text-xs opacity-70">{fmtDate(h.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
