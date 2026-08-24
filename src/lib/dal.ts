import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Riktig behörighetskontroll (mot databasen), att köra i varje admin-sida och
// server action — src/proxy.ts gör bara en optimistisk cookie-koll och ska
// inte vara enda skyddet. Se Next.js-guiden "Creating a Data Access Layer".
export const requireAdmin = cache(async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/logga-in");
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "ADMIN") {
    redirect("/logga-in");
  }
  return user;
});
