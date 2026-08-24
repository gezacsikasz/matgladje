import type { Role } from "@/generated/prisma/enums";

// Auth.js v5's exported callback types resolve against `@auth/core`'s own
// modules, not the `next-auth` re-export barrels — augmenting "next-auth" /
// "next-auth/jwt" directly does not merge here, so target the real modules.
declare module "@auth/core/types" {
  interface User {
    role: Role;
    householdId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      householdId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
    householdId?: string | null;
  }
}
