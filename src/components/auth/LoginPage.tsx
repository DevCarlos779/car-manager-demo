"use client";

import { useState } from "react";
import { Car, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { realizarLogin } from "@/src/app/actions/authentication";

const inputClass =
  "h-11 w-full min-w-0 rounded-lg border border-[#E2E8F0] bg-white px-3 text-base text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 sm:h-10 sm:text-sm";

interface LoginFormProps {
  onSubmit?: (email: string, senha: string) => Promise<void> | void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !senha) {
      setErro("Informe o e-mail e a senha.");
      return;
    }

    setErro("");
    setCarregando(true);

    const resultado = await realizarLogin(email.trim(), senha);

    if (!resultado.ok) {
      setErro(resultado.erro);
      setCarregando(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#243F8F] text-white shadow-[0_4px_12px_rgba(36,63,143,0.25)]">
          <Car size={24} strokeWidth={2} />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
            CarManager
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Entre para acompanhar seus veículos
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.08)] sm:p-6"
      >
        {erro && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[#DC2626]"
          >
            {erro}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-[#0F172A]">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="senha" className="text-sm font-medium text-[#0F172A]">
            Senha
          </label>
          <div className="relative">
            <input
              id="senha"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((atual) => !atual)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-lg text-[#64748B] hover:text-[#0F172A]"
            >
              {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="mt-1 h-11 w-full cursor-pointer rounded-lg bg-[#1E3A8A] text-sm font-semibold text-white transition-colors hover:bg-[#1E3A8A]/90 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
