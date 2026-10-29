"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Vehicle } from "../../types/typeVeiculos";
import { Obrigacao } from "../../types/typeObrigacoes";
import { marcarComoPago } from "../../app/actions/veiculos";
import Campo from "./Campo";

type StatusObrigacao = "em-dia" | "proximo" | "atrasado";

const STATUS_CONFIG: Record<
  StatusObrigacao,
  { label: string; className: string }
> = {
  "em-dia": { label: "Em dia", className: "bg-[#F0FDF4] text-[#16A34A]" },
  proximo: { label: "Próximo", className: "bg-[#FFFBEB] text-[#F59E0B]" },
  atrasado: { label: "Atrasado", className: "bg-[#FEF2F2] text-[#DC2626]" },
};

function calcularStatus(obrigacao: Obrigacao) {
  const [dia, mes, ano] = obrigacao.vencimento.split("/").map(Number);
  const anoCompleto = ano < 100 ? 2000 + ano : ano;
  const vencimento = new Date(anoCompleto, mes - 1, dia);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const umMesAntes = new Date(vencimento);
  umMesAntes.setMonth(umMesAntes.getMonth() - 1);

  let status: StatusObrigacao;

  if (hoje < umMesAntes) {
    status = "em-dia";
  } else if (hoje > vencimento) {
    status = "atrasado";
  } else {
    status = "proximo";
  }

  return { ...obrigacao, status };
}

function BotaoMarcarPago({
  vehicleId,
  obrigacaoId,
  className = "",
}: {
  vehicleId: string;
  obrigacaoId: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await marcarComoPago(vehicleId, obrigacaoId);
        })
      }
      className={`cursor-pointer font-semibold text-[#0EA5E9] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {isPending ? "Salvando..." : "Marcar como pago"}
    </button>
  );
}

interface VehicleDetailsProps {
  vehicle: Vehicle;
}

export default function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  const obrigacoes = vehicle.obrigacoes.map(calcularStatus);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Link
        href="/veiculos"
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[#64748B] hover:text-[#0F172A]"
      >
        ← Voltar para veículos
      </Link>

      <div>
        <h1 className="break-words text-xl font-extrabold text-[#0F172A] sm:text-2xl">
          {vehicle.marca} {vehicle.modelo}
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          {vehicle.placa} · Ano {vehicle.ano}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)] sm:grid-cols-3 sm:p-5">
        <Campo label="Marca" valor={vehicle.marca} />
        <Campo label="Modelo" valor={vehicle.modelo} />
        <Campo label="Cor" valor={vehicle.cor || "Não informado"} />
        <Campo label="Ano" valor={vehicle.ano} />
        <Campo label="Placa" valor={vehicle.placa} />
        <Campo label="RENAVAM" valor={vehicle.renavam} />
        <Campo label="Código CRLV" valor={vehicle.crlv || "Não informado"} />
        <Campo label="Código CRV" valor={vehicle.crv || "Não informado"} />
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold text-[#0F172A]">
          Obrigações e pagamentos
        </h2>

        <div className="flex flex-col gap-3 md:hidden">
          {obrigacoes.map((obrigacao) => (
            <div
              key={obrigacao.id}
              className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-[#0F172A]">
                  {obrigacao.tipo}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CONFIG[obrigacao.status].className}`}
                >
                  {STATUS_CONFIG[obrigacao.status].label}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <Campo label="Vencimento" valor={obrigacao.vencimento} />
                <Campo
                  label="Pagamento"
                  valor={obrigacao.dataPagamento ?? "—"}
                />
              </div>

              {obrigacao.status !== "em-dia" && (
                <BotaoMarcarPago
                  vehicleId={vehicle.id}
                  obrigacaoId={obrigacao.id}
                  className="mt-4 w-full rounded-lg border border-[#E2E8F0] py-2.5 text-sm hover:bg-[#F8FAFC]"
                />
              )}
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] md:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Data de pagamento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {obrigacoes.map((obrigacao) => (
                <tr
                  key={obrigacao.id}
                  className="border-b border-[#E2E8F0] last:border-0"
                >
                  <td className="px-4 py-3 font-semibold text-[#0F172A]">
                    {obrigacao.tipo}
                  </td>
                  <td className="px-4 py-3 text-[#0F172A]">
                    {obrigacao.vencimento}
                  </td>
                  <td className="px-4 py-3 text-[#0F172A]">
                    {obrigacao.dataPagamento ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CONFIG[obrigacao.status].className}`}
                    >
                      {STATUS_CONFIG[obrigacao.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {obrigacao.status !== "em-dia" && (
                      <BotaoMarcarPago
                        vehicleId={vehicle.id}
                        obrigacaoId={obrigacao.id}
                        className="hover:underline"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
