import { prisma } from "@/lib/prisma";
import { ProductRow } from "./ProductRow";

export default async function ProdukterPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        orderBy: { namn: "asc" },
        include: { producenter: { include: { producer: true } } },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold">Produkter</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-paper">Skafferi</h1>
        <p className="mt-2 max-w-2xl text-sm opacity-75">
          Grundfälten här (namn, enhet, målpris) — full sortimentredigering med bilder och
          periodnoter är en handlarfunktion som kommer i nästa steg.
        </p>
      </div>

      <div className="flex flex-col">
        {categories.map((cat) => (
          <details key={cat.id} className="border-b border-line py-1" open>
            <summary className="flex cursor-pointer items-center justify-between py-3 font-serif text-lg">
              <span>{cat.namn}</span>
              <span className="font-mono text-xs text-gold">{cat.products.length} varor</span>
            </summary>
            <div className="pb-3">
              {cat.products.map((p) => (
                <ProductRow key={p.id} product={p} />
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
