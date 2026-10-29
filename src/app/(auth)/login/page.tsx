import { redirect } from "next/navigation";
import { getUsuario } from "@/src/lib/auth";
import LoginForm from "@/src/components/auth/LoginPage";

export default async function Login() {
  if (await getUsuario()) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
