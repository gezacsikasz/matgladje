import "dotenv/config";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { periodForDate } from "../src/lib/periods";

const __dirname = dirname(fileURLToPath(import.meta.url));

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedProduct = {
  id: string;
  kategori: string;
  namn: string;
  enhet: string;
  butikReferens: number | null;
  ekobutikReferens: number | null;
  rekoReferens: number | null;
  malpris: number;
  sakerhet: string | null;
  kommentar: string | null;
  sourcingStatus: string | null;
  sourcingNote: string | null;
};

type SeedCategory = { namn: string; sortOrder: number; krPerKePerManad: number | null };

type SeedProducer = {
  namn: string;
  region: string | null;
  egenWebb: string | null;
  sourcingLeveranssatt: string | null;
  sourcingKalla: string | null;
  produkter: string[];
};

type SeedData = {
  categories: SeedCategory[];
  products: SeedProduct[];
  producers: SeedProducer[];
};

type SeedDemoProducer = {
  namn: string;
  region?: string;
  egenWebb?: string;
  beskrivning?: string;
  kapacitetKrPerManad?: number;
  produkter: string[];
};

async function main() {
  const raw = readFileSync(join(__dirname, "seed-data/skafferi.json"), "utf-8");
  const data: SeedData = JSON.parse(raw);

  console.log("Seedar kategorier + behovsmodell...");
  for (const cat of data.categories) {
    const category = await prisma.category.upsert({
      where: { namn: cat.namn },
      update: { sortOrder: cat.sortOrder },
      create: { namn: cat.namn, sortOrder: cat.sortOrder },
    });
    if (cat.krPerKePerManad != null) {
      await prisma.categoryBehov.upsert({
        where: { categoryId: category.id },
        update: { krPerKePerManad: cat.krPerKePerManad },
        create: { categoryId: category.id, krPerKePerManad: cat.krPerKePerManad },
      });
    }
  }

  console.log("Seedar produkter...");
  const categoryIdByName = new Map(
    (await prisma.category.findMany()).map((c) => [c.namn, c.id])
  );
  for (const p of data.products) {
    const categoryId = categoryIdByName.get(p.kategori);
    if (!categoryId) throw new Error(`Okänd kategori för produkt ${p.id}: ${p.kategori}`);
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        categoryId,
        namn: p.namn,
        enhet: p.enhet,
        butikReferens: p.butikReferens,
        ekobutikReferens: p.ekobutikReferens,
        rekoReferens: p.rekoReferens,
        malpris: p.malpris,
        sakerhet: p.sakerhet,
        kommentar: p.kommentar,
        sourcingStatus: p.sourcingStatus,
        sourcingNote: p.sourcingNote,
      },
      create: {
        id: p.id,
        categoryId,
        namn: p.namn,
        enhet: p.enhet,
        butikReferens: p.butikReferens,
        ekobutikReferens: p.ekobutikReferens,
        rekoReferens: p.rekoReferens,
        malpris: p.malpris,
        sakerhet: p.sakerhet,
        kommentar: p.kommentar,
        sourcingStatus: p.sourcingStatus,
        sourcingNote: p.sourcingNote,
      },
    });
  }

  console.log("Seedar producentkandidater + produktlänkar...");
  for (const prod of data.producers) {
    const existing = await prisma.producer.findFirst({ where: { namn: prod.namn } });
    const producer = existing
      ? await prisma.producer.update({
          where: { id: existing.id },
          data: {
            region: prod.region,
            egenWebb: prod.egenWebb,
            sourcingLeveranssatt: prod.sourcingLeveranssatt,
            sourcingKalla: prod.sourcingKalla,
          },
        })
      : await prisma.producer.create({
          data: {
            namn: prod.namn,
            region: prod.region,
            egenWebb: prod.egenWebb,
            sourcingLeveranssatt: prod.sourcingLeveranssatt,
            sourcingKalla: prod.sourcingKalla,
            status: "KANDIDAT",
          },
        });
    for (const productId of prod.produkter) {
      await prisma.productProducer.upsert({
        where: { productId_producerId: { productId, producerId: producer.id } },
        update: {},
        create: { productId, producerId: producer.id },
      });
    }
  }

  console.log("Seedar kompletterande demo-producentkopplingar (från prototypen)...");
  const demoRaw = readFileSync(join(__dirname, "seed-data/demo-producers.json"), "utf-8");
  const demoData: { producers: SeedDemoProducer[] } = JSON.parse(demoRaw);
  for (const prod of demoData.producers) {
    const existing = await prisma.producer.findFirst({ where: { namn: prod.namn } });
    const producer =
      existing ??
      (await prisma.producer.create({
        data: {
          namn: prod.namn,
          region: prod.region,
          egenWebb: prod.egenWebb,
          beskrivning: prod.beskrivning,
          kapacitetKrPerManad: prod.kapacitetKrPerManad,
          sourcingKalla: "Demo-data från prototypen — ej verifierad kandidat",
          status: "KANDIDAT",
        },
      }));
    for (const productId of prod.produkter) {
      await prisma.productProducer.upsert({
        where: { productId_producerId: { productId, producerId: producer.id } },
        update: {},
        create: { productId, producerId: producer.id },
      });
      await prisma.product.update({
        where: { id: productId },
        data: { sourcingStatus: null, sourcingNote: null },
      });
    }
  }

  console.log("Seedar perioder (innevarande + nästa)...");
  const now = new Date();
  for (const offset of [0, 1]) {
    const p = periodForDate(now, offset);
    await prisma.period.upsert({
      where: { num: p.num },
      update: {},
      create: {
        num: p.num,
        startDatum: p.startDatum,
        slutDatum: p.slutDatum,
        deadlineDatum: p.deadlineDatum,
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    console.log(`Seedar bootstrap-admin (${adminEmail})...`);
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash, role: "ADMIN" },
      create: { email: adminEmail, passwordHash, role: "ADMIN" },
    });
  } else {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD saknas i .env — ingen bootstrap-admin skapad.");
  }

  const [categories, products, producers, periods, users] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.producer.count(),
    prisma.period.count(),
    prisma.user.count(),
  ]);
  console.log(
    `Klart: ${categories} kategorier, ${products} produkter, ${producers} producenter, ${periods} perioder, ${users} användare.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
