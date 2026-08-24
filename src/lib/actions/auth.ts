"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Fel e-post eller lösenord." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/logga-in" });
}
