import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateProducerAction } from "@/lib/actions/producers";
import { ProducerForm } from "./ProducerForm";

export default async function ProducerDetailPage({
  params,
}: PageProps<"/admin/producenter/[id]">) {
  const { id } = await params;
  const producer = await prisma.producer.findUnique({
    where: { id },
    include: { produkter: { include: { product: true } } },
  });
  if (!producer) notFound();

  const action = updateProducerAction.bind(null, producer.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/producenter" className="text-xs uppercase tracking-wide text-gold">
          ← Alla producenter
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-paper">{producer.namn}</h1>
        {(producer.sourcingKalla || producer.sourcingLeveranssatt) && (
          <p className="mt-1 text-xs opacity-50">
            Källa: {producer.sourcingKalla ?? "—"}
            {producer.sourcingLeveranssatt && <> · {producer.sourcingLeveranssatt}</>}
          </p>
        )}
      </div>

      {producer.produkter.length > 0 && (
        <div>
          <h2 className="mb-2 font-serif text-lg">Länkade varor</h2>
          <div className="flex flex-wrap gap-2">
            {producer.produkter.map((pp) => (
              <span
                key={pp.id}
                className="rounded-full border border-line px-3 py-1 text-xs text-paper/80"
              >
                {pp.product.namn}
              </span>
            ))}
          </div>
        </div>
      )}

      <ProducerForm producer={producer} action={action} />
    </div>
  );
}
