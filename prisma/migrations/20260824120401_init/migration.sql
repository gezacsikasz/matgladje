-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEDLEM', 'HANDLARE', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProducerStatus" AS ENUM ('KANDIDAT', 'ANSOKT', 'GODKAND', 'INAKTIV');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('SWISH', 'KONTO');

-- CreateEnum
CREATE TYPE "InviteType" AS ENUM ('HUSHALL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "householdId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "InviteType" NOT NULL DEFAULT 'HUSHALL',
    "email" TEXT,
    "householdNameHint" TEXT,
    "createdByUserId" TEXT,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "namn" TEXT NOT NULL,
    "adress" TEXT,
    "epost" TEXT NOT NULL,
    "mobil" TEXT,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "namn" TEXT,
    "alder" INTEGER NOT NULL,

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "namn" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryBehov" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "krPerKePerManad" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CategoryBehov_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "namn" TEXT NOT NULL,
    "enhet" TEXT NOT NULL,
    "minstaEnhet" TEXT,
    "malpris" DOUBLE PRECISION NOT NULL,
    "butikReferens" DOUBLE PRECISION,
    "ekobutikReferens" DOUBLE PRECISION,
    "rekoReferens" DOUBLE PRECISION,
    "sakerhet" TEXT,
    "kommentar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producer" (
    "id" TEXT NOT NULL,
    "namn" TEXT NOT NULL,
    "region" TEXT,
    "adress" TEXT,
    "logoUrl" TEXT,
    "beskrivning" TEXT,
    "egenWebb" TEXT,
    "ansvarigNamn" TEXT,
    "ansvarigMobil" TEXT,
    "ansvarigEpost" TEXT,
    "betalmetod" "PaymentMethod",
    "swishNr" TEXT,
    "kontoNr" TEXT,
    "kapacitetKrPerManad" DOUBLE PRECISION,
    "status" "ProducerStatus" NOT NULL DEFAULT 'KANDIDAT',
    "sourcingKalla" TEXT,
    "sourcingLeveranssatt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Producer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductProducer" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "kilioprisForslag" DOUBLE PRECISION,

    CONSTRAINT "ProductProducer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPeriodNote" (
    "id" TEXT NOT NULL,
    "productProducerId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "ProductPeriodNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Period" (
    "id" TEXT NOT NULL,
    "num" INTEGER NOT NULL,
    "startDatum" TIMESTAMP(3) NOT NULL,
    "slutDatum" TIMESTAMP(3) NOT NULL,
    "deadlineDatum" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLine" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "mangd" DOUBLE PRECISION NOT NULL,
    "prisVidKoptillfalle" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_householdId_key" ON "User"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "InviteToken_token_key" ON "InviteToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Category_namn_key" ON "Category"("namn");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryBehov_categoryId_key" ON "CategoryBehov"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductProducer_productId_producerId_key" ON "ProductProducer"("productId", "producerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPeriodNote_productProducerId_periodId_key" ON "ProductPeriodNote"("productProducerId", "periodId");

-- CreateIndex
CREATE UNIQUE INDEX "Period_num_key" ON "Period"("num");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryBehov" ADD CONSTRAINT "CategoryBehov_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductProducer" ADD CONSTRAINT "ProductProducer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductProducer" ADD CONSTRAINT "ProductProducer_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPeriodNote" ADD CONSTRAINT "ProductPeriodNote_productProducerId_fkey" FOREIGN KEY ("productProducerId") REFERENCES "ProductProducer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPeriodNote" ADD CONSTRAINT "ProductPeriodNote_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
