import { prisma } from "@/lib/prisma";
import { getCurrentAndNextPeriod } from "@/lib/periods-db";
import { getSelectedPeriodKey } from "@/lib/period-selection";
import { basePrice, priceForProduct, tierForPool, nextTier } from "@/lib/pricing";
import { fmtKr } from "@/lib/format";
import { OrderForm } from "./OrderForm";
import { PersonalShopperButton } from "./PersonalShopperButton";

export default async function SkafferiPage() {
  const periodKey = await getSelectedPeriodKey();
  const { current, next } = await getCurrentAndNextPeriod();
  const period = periodKey === "next" ? next : current;

  if (!period) {
    return (
      <p className="text-sm opacity-70">
        Ingen period skapad än — hör av dig till din gemenskapare.
      </p>
    );
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        orderBy: { namn: "asc" },
        include: { producenter: { include: { producer: true } } },
      },
    },
  });

  const lines = await prisma.orderLine.findMany({
    where: { periodId: period.id },
    select: { producerId: true, productId: true, mangd: true, prisVidKoptillfalle: true },
  });
  const producerPools = new Map<string, number>();
  const productTotals = new Map<string, number>();
  for (const l of lines) {
    const value = l.mangd * l.prisVidKoptillfalle;
    producerPools.set(l.producerId, (producerPools.get(l.producerId) ?? 0) + value);
    productTotals.set(l.productId, (productTotals.get(l.productId) ?? 0) + value);
  }
  const grandTotal = [...productTotals.values()].reduce((a, b) => a + b, 0);
  const periodWord = periodKey === "next" ? "nästa" : "denna";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold">Skafferi</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-paper">Bläddra i sortimentet</h1>
        <p className="mt-2 max-w-xl text-sm opacity-75">
          Priset på varje vara sjunker när fler av oss handlar hos samma gård {periodWord} period
          — helt oberoende av vad som händer hos andra gårdar.
        </p>
        <p className="mt-3 font-mono text-xs opacity-60">
          Totalt {periodWord} period, alla gårdar tillsammans: {fmtKr(grandTotal)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-line bg-cellar-2 p-5">
        <div>
          <p className="font-serif text-lg text-gold">🛒 Personal shopper</p>
          <p className="mt-1 max-w-md text-xs opacity-75">
            Fyll {periodWord} period-korg automatiskt, baserat på god täckning av skafferiets
            kategorier och ert hushålls sammansättning.
          </p>
        </div>
        <PersonalShopperButton periodKey={periodKey} />
      </div>

      <div className="flex flex-col">
        {categories.map((cat) => {
          const byProducerId = new Map<
            string,
            { producer: { id: string; namn: string; region: string | null }; items: { product: (typeof cat.products)[number]; productProducerId: string }[] }
          >();
          for (const product of cat.products) {
            for (const pp of product.producenter) {
              const key = pp.producerId;
              if (!byProducerId.has(key)) {
                byProducerId.set(key, { producer: pp.producer, items: [] });
              }
              byProducerId.get(key)!.items.push({ product, productProducerId: pp.id });
            }
          }
          const catTotal = cat.products.reduce((s, p) => s + (productTotals.get(p.id) ?? 0), 0);
          if (byProducerId.size === 0) return null;

          return (
            <details key={cat.id} className="border-b border-line py-1" open>
              <summary className="flex cursor-pointer items-center justify-between py-3 font-serif text-lg">
                <span>{cat.namn}</span>
                <span className="font-mono text-xs text-gold">{fmtKr(catTotal)} beställt</span>
              </summary>
              <div className="flex flex-col gap-4 pb-4">
                {[...byProducerId.values()].map(({ producer, items }) => {
                  const pool = producerPools.get(producer.id) ?? 0;
                  const tier = tierForPool(pool);
                  const upcomingTier = nextTier(pool);
                  const pct = Math.min(pool / 20000, 1);
                  return (
                    <div key={producer.id} className="rounded-sm border border-line bg-cellar-2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-serif text-base">
                          {producer.namn}
                          {producer.region && (
                            <span className="ml-2 text-xs font-sans opacity-60">· {producer.region}</span>
                          )}
                        </div>
                        <span className="rounded-sm bg-gold px-2.5 py-1 font-mono text-xs font-bold text-ink">
                          {tier.label}
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full border border-line bg-cellar">
                        <div className="h-full rounded-full bg-sage" style={{ width: `${pct * 100}%` }} />
                      </div>
                      <p className="mt-2 text-xs opacity-70">
                        {fmtKr(pool)} beställt hos denna gård {periodWord} period
                        {upcomingTier
                          ? ` · ${fmtKr(upcomingTier.min - pool)} kvar till nästa rabattnivå`
                          : " · högsta rabattnivån nådd"}
                      </p>
                      <div className="mt-3 flex flex-col gap-3">
                        {items.map(({ product, productProducerId }) => {
                          const now = priceForProduct(product.malpris, pool);
                          const base = basePrice(product.malpris);
                          const discounted = now < base - 0.01;
                          return (
                            <div
                              key={productProducerId}
                              className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3 text-sm"
                            >
                              <div>
                                <p>{product.namn}</p>
                                <p className="text-xs opacity-60">
                                  {fmtKr(productTotals.get(product.id) ?? 0)} av denna vara beställt{" "}
                                  {periodWord} period
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="font-mono text-gold">{fmtKr(now)}</div>
                                  {discounted && (
                                    <div className="font-mono text-xs opacity-40 line-through">
                                      {fmtKr(base)}
                                    </div>
                                  )}
                                  <div className="text-[11px] opacity-60">{product.enhet}</div>
                                </div>
                                <OrderForm productProducerId={productProducerId} periodKey={periodKey} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
