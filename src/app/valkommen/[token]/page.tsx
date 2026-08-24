import { prisma } from "@/lib/prisma";
import { SignupForm } from "./SignupForm";

export default async function ValkommenPage({ params }: PageProps<"/valkommen/[token]">) {
  const { token } = await params;
  const invite = await prisma.inviteToken.findUnique({ where: { token } });

  const invalid = !invite || invite.usedAt || (invite.expiresAt && invite.expiresAt < new Date());

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="mb-1 font-mono text-xs uppercase tracking-widest text-gold">Matglädje</p>
        <h1 className="mb-2 font-serif text-3xl font-semibold text-paper">Välkommen!</h1>

        {invalid ? (
          <p className="mt-6 text-sm text-rust">
            Den här inbjudningslänken är ogiltig eller har redan använts. Hör av dig till den
            som bjöd in dig för en ny länk.
          </p>
        ) : (
          <>
            <p className="mb-8 text-sm opacity-75">
              Skapa ert hushåll för att bli en del av Matglädje-gemenskapen.
            </p>
            <SignupForm
              token={token}
              householdNameHint={invite.householdNameHint ?? ""}
              emailHint={invite.email ?? ""}
            />
          </>
        )}
      </div>
    </main>
  );
}
