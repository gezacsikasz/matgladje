import { LoginForm } from "./LoginForm";

export default async function LoggaInPage({ searchParams }: PageProps<"/logga-in">) {
  const params = await searchParams;
  const callbackUrlRaw = params?.callbackUrl;
  const callbackUrl = (Array.isArray(callbackUrlRaw) ? callbackUrlRaw[0] : callbackUrlRaw) || "/admin";
  const welcome = params?.valkommen === "1";

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="mb-1 font-mono text-xs uppercase tracking-widest text-gold">Matglädje</p>
        <h1 className="mb-8 font-serif text-3xl font-semibold text-paper">Logga in</h1>
        {welcome && (
          <p className="mb-6 rounded-sm border border-sage bg-cellar-2 px-4 py-3 text-sm text-paper">
            Kontot är skapat — logga in med din e-post och ditt lösenord.
          </p>
        )}
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
