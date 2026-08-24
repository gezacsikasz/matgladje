import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Matglädje</p>
      <h1 className="mt-3 max-w-xl font-serif text-4xl font-semibold text-paper sm:text-5xl">
        Tillsammans direkt från gården
      </h1>
      <p className="mt-4 max-w-md text-paper/80">
        En matinköpsgemenskap som beställer direkt från lokala producenter. Medlems- och
        handlarvyerna är under uppbyggnad — hör av dig till din gemenskapare för en
        inbjudan.
      </p>
      <Link
        href="/logga-in"
        className="mt-8 rounded-sm bg-gold px-6 py-3 font-bold text-ink transition hover:bg-[#d8ac4c]"
      >
        Logga in
      </Link>
    </main>
  );
}
