import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "./firebaseAdmin";

export const getUsuario = cache(async () => {
  const sessao = (await cookies()).get("session")?.value;
  if (!sessao) return null;

  try {
    return await adminAuth.verifySessionCookie(sessao, false);
  } catch {
    return null;
  }
});

export async function exigirUsuario() {
  const usuario = await getUsuario();
  if (!usuario) redirect("/login");
  return usuario;
}
