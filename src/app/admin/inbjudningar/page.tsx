import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/format";
import { InviteForm } from "./InviteForm";
import { RevokeButton } from "./RevokeButton";

export default async function InviteAdminPage() {
  const invites = await prisma.inviteToken.findMany({
    where: { usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold">Inbjudningar</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-paper">
          Bjud in ett hushåll
        </h1>
        <p className="mt-2 max-w-2xl text-sm opacity-75">
          Skapa en unik länk och skicka den till hushållet själv (SMS, mejl eller chatt).
          Länken gäller i 14 dagar och kan bara användas en gång.
        </p>
      </div>

      <InviteForm />

      <div>
        <h2 className="mb-3 font-serif text-lg text-paper">Väntar på att lösas in</h2>
        {invites.length === 0 ? (
          <p className="text-sm opacity-60">Inga öppna inbjudningar just nu.</p>
        ) : (
          <div className="flex flex-col">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-4 border-t border-line py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{inv.householdNameHint || "(namn ej angivet)"}</p>
                  <p className="text-xs opacity-60">
                    {inv.email || "ingen e-post angiven"} · skapad {fmtDate(inv.createdAt)}
                    {inv.expiresAt && <> · giltig t.o.m. {fmtDate(inv.expiresAt)}</>}
                  </p>
                </div>
                <RevokeButton id={inv.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
