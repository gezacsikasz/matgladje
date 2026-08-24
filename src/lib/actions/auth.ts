"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");

  try {
    // redirect: false so we can pick the right landing page based on the
    // user's actual role below, instead of blindly sending everyone to
    // /admin (which bounced non-admins straight back to /logga-in).
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Fel e-post eller lösenord." };
    }
    throw error;
  }

  const user = typeof email === "string" ? await prisma.user.findUnique({ where: { email } }) : null;
  const isAdmin = user?.role === "ADMIN";
  const requested = typeof callbackUrl === "string" && callbackUrl ? callbackUrl : null;
  const target = requested && (isAdmin || !requested.startsWith("/admin"))
    ? requested
    : isAdmin
      ? "/admin"
      : "/skafferi";

  redirect(target);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/logga-in" });
}
