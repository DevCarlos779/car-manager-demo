"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Car, Menu, X, LogOut } from "lucide-react";
import { realizarLogout } from "@/src/app/actions/authentication";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Veículos",
    href: "/veiculos",
    icon: Car,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await realizarLogout();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-[#E2E8F0] bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={aberto}
          className="cursor-pointer rounded-md p-2 text-[#0F172A] hover:bg-[#F1F5F9]"
        >
          <Menu size={22} />
        </button>

        <span className="text-lg font-bold tracking-tight text-[#243F8F]">
          CarManager
        </span>
      </header>

      {aberto && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setAberto(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto bg-[#243F8F] px-4 py-6 text-white transition-transform duration-200 lg:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-start justify-between px-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">CarManager</h1>

            <p className="mt-1 text-xs text-blue-200">Gestão de veículos</p>
          </div>

          <button
            type="button"
            onClick={() => setAberto(false)}
            aria-label="Fechar menu"
            className="cursor-pointer rounded-md p-1.5 text-blue-100 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setAberto(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={2} />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/15 pt-4">
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
              DM
            </div>

            <div>
              <p className="text-sm font-medium">Demo</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="mt-3 flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={18} strokeWidth={2} />

            <span>{isPending ? "Saindo..." : "Sair"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
