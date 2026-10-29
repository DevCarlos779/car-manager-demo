"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/src/lib/firebaseAdmin";

const DURACAO_MS = 60 * 60 * 24 * 5 * 1000;

export async function realizarLogin(email: string, senha: string) {
  try {
    const resposta = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: senha,
          returnSecureToken: true,
        }),
      },
    );

    if (!resposta.ok) {
      return { ok: false as const, erro: "E-mail ou senha incorretos." };
    }

    const { idToken } = await resposta.json();

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: DURACAO_MS,
    });

    (await cookies()).set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DURACAO_MS / 1000,
    });

    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      erro: "Não foi possível entrar. Tente novamente.",
    };
  }
}

export async function realizarLogout() {
  (await cookies()).delete("session");
}
