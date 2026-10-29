"use client";

import Link from "next/link";
import { Vehicle } from "../../types/typeVeiculos";
import { Obrigacao } from "../../types/typeObrigacoes";
import { useState, useTransition } from "react";
import AddVehicleModal from "./AddVehicleModal";
import {
  criarVeiculo,
  editarVeiculo,
  excluirVeiculo,
} from "../..//app/actions/veiculos";

import { Pencil, Trash2 } from "lucide-react";
import EditVehicleModal from "./EditVehicleModal";

type Status = "atrasado" | "proximo" | "em-dia";

const STATUS_CONFIG: Record<
  Status,
  { label: string; className: string; border: string }
> = {
  atrasado: {
    label: "Atrasado",
    className: "bg-[#FEF2F2] text-[#DC2626]",
    border: "border-l-[#DC2626]",
  },
  proximo: {
    label: "Próximo",
    className: "bg-[#FFFBEB] text-[#F59E0B]",
    border: "border-l-[#F59E0B]",
  },
  "em-dia": {
    label: "Em dia",
    className: "bg-[#F0FDF4] text-[#16A34A]",
    border: "border-l-[#16A34A]",
  },
};

interface VehiclesPageProps {
  vehicles: Vehicle[];
}

interface VehicleFiltered {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  renavam: string;
  chassi: string;
  cor: string;
  crlv: string;
  crv: string;
  obrigacoes: Obrigacao[];
  status: Status;
  proximoVencimento: string;
  qtdPendencias: number;
}

interface getProximaObrigacaoReturn {
  qtdPendencias: number;
  dataProximaOrbigacao: string;
}

function parseDataBR(data: string): Date {
  const [dia, mes, ano] = data.split("/").map(Number);
  const anoCompleto = ano < 100 ? 2000 + ano : ano;

  return new Date(anoCompleto, mes - 1, dia);
}

export default function Vehicles({ vehicles }: VehiclesPageProps) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [modalAdicionarVeiculoAberto, setModalAdicionarVeiculoAberto] =
    useState(false);

  const [veiculoEditando, setVeiculoEditando] = useState<Vehicle | null>(null);

  const [isPending, startTransition] = useTransition();

  const filteredVehiclesIsNearExpiry = vehicles.filter((vehicle) => {
    return vehicle.obrigacoes.some((obrigacao) => {
      const [dia, mes, ano] = obrigacao.vencimento.split("/").map(Number);
      const anoCompleto = ano < 100 ? 2000 + ano : ano;
      const vencimento = new Date(anoCompleto, mes - 1, dia);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const umMesAntes = new Date(vencimento);
      umMesAntes.setMonth(umMesAntes.getMonth() - 1);

      return hoje >= umMesAntes && hoje < vencimento;
    });
  });

  const filteredVehiclesIsExpiry = vehicles.filter((vehicle) => {
    return vehicle.obrigacoes.some(
      (obrigacao) => obrigacao.status == "atrasado",
    );
  });

  function getProximaObrigacao(
    vehicle: Vehicle,
  ): getProximaObrigacaoReturn | null {
    const pendentes = vehicle.obrigacoes.filter((o) => o.status === "atrasado");
    const qtdPendencias = pendentes.length;

    let dataProximaOrbigacao: string;

    if (qtdPendencias === 0) {
      dataProximaOrbigacao = vehicle.obrigacoes.reduce((maisProxima, atual) => {
        const dataAtual = parseDataBR(atual.vencimento);
        const dataMaisProxima = parseDataBR(maisProxima.vencimento);
        return dataAtual < dataMaisProxima ? atual : maisProxima;
      }).vencimento;
    } else {
      dataProximaOrbigacao = pendentes.reduce((maisProxima, atual) => {
        const dataAtual = parseDataBR(atual.vencimento);
        const dataMaisProxima = parseDataBR(maisProxima.vencimento);
        return dataAtual < dataMaisProxima ? atual : maisProxima;
      }).vencimento;
    }

    return {
      qtdPendencias,
      dataProximaOrbigacao,
    };
  }

  function verificarStatusVeiculo(vehicle: Vehicle): VehicleFiltered {
    const filteredVehicle = getProximaObrigacao(vehicle);
    if (filteredVehiclesIsExpiry.includes(vehicle)) {
      return {
        ...vehicle,
        status: "atrasado",
        proximoVencimento: filteredVehicle!.dataProximaOrbigacao,
        qtdPendencias: filteredVehicle!.qtdPendencias,
      };
    } else if (filteredVehiclesIsNearExpiry.includes(vehicle)) {
      return {
        ...vehicle,
        status: "proximo",
        proximoVencimento: filteredVehicle!.dataProximaOrbigacao,
        qtdPendencias: filteredVehicle!.qtdPendencias,
      };
    } else {
      return {
        ...vehicle,
        status: "em-dia",
        proximoVencimento: filteredVehicle!.dataProximaOrbigacao,
        qtdPendencias: filteredVehicle!.qtdPendencias,
      };
    }
  }

  const vehiclesWithStatus = vehicles.map((vehicle) =>
    verificarStatusVeiculo(vehicle),
  );

  const filteredVehicles = vehiclesWithStatus
    .filter((vehicle) => {
      const textoBusca = busca.toLowerCase().trim();

      const correspondeBusca =
        vehicle.marca.toLowerCase().includes(textoBusca) ||
        vehicle.modelo.toLowerCase().includes(textoBusca) ||
        vehicle.placa.toLowerCase().includes(textoBusca);

      const correspondeStatus =
        filtroStatus === "todos" || vehicle.status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    })
    .sort((a, b) => {
      if (ordenacao === "nome") {
        return `${a.marca} ${a.modelo}`.localeCompare(
          `${b.marca} ${b.modelo}`,
          "pt-BR",
        );
      }

      return (
        parseDataBR(a.proximoVencimento).getTime() -
        parseDataBR(b.proximoVencimento).getTime()
      );
    });

  function handleExcluir(v: VehicleFiltered) {
    const confirmou = confirm(
      `Excluir ${v.marca} ${v.modelo}? Essa ação não pode ser desfeita.`,
    );
    if (!confirmou) return;

    startTransition(async () => {
      await excluirVeiculo(v.id);
    });
  }

  function renderAcoes(v: VehicleFiltered) {
    return (
      <>
        <button
          type="button"
          title="Editar veículo"
          aria-label={`Editar ${v.marca} ${v.modelo}`}
          className="cursor-pointer rounded-md p-2 text-[#64748B] transition-colors hover:bg-[#EFF6FF] hover:text-[#1E3A8A] md:p-1.5"
          onClick={() => setVeiculoEditando(v)}
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Excluir veículo"
          aria-label={`Excluir ${v.marca} ${v.modelo}`}
          className="cursor-pointer rounded-md p-2 text-[#64748B] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50 md:p-1.5"
          disabled={isPending}
          onClick={() => handleExcluir(v)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] sm:text-2xl">
            Veículos
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Gerencie os veículos cadastrados e acompanhe suas obrigações
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalAdicionarVeiculoAberto(true)}
          className="h-11 w-full shrink-0 cursor-pointer rounded-lg bg-[#1E3A8A] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1E3A8A]/90 sm:h-auto sm:w-auto sm:py-2.5"
        >
          + Adicionar veículo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <input
          placeholder="Buscar por nome ou placa..."
          className="col-span-2 h-11 min-w-0 rounded-lg border border-[#E2E8F0] px-3.5 text-base text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 sm:h-10 sm:min-w-[220px] sm:flex-1 sm:text-sm"
          onChange={(e) => setBusca(e.target.value)}
        />

        <select
          className="h-11 w-full min-w-0 rounded-lg border border-[#E2E8F0] bg-white px-3 text-base text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 sm:h-10 sm:w-auto sm:text-sm"
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="todos">Todos os status</option>
          <option value="atrasado">Atrasado</option>
          <option value="proximo">Próximo</option>
          <option value="em-dia">Em dia</option>
        </select>

        <select
          className="h-11 w-full min-w-0 rounded-lg border border-[#E2E8F0] bg-white px-3 text-base text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 sm:h-10 sm:w-auto sm:text-sm"
          onChange={(e) => setOrdenacao(e.target.value)}
        >
          <option value="nome">Ordenar por nome</option>
          <option value="vencimento">Ordenar por vencimento</option>
        </select>
      </div>

      <div className="flex max-h-[65vh] flex-col gap-3 overflow-y-auto p-1 md:hidden">
        {filteredVehicles.map((v) => (
          <div
            key={v.id}
            className={`rounded-xl border border-l-4 border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ${STATUS_CONFIG[v.status].border}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#0F172A]">
                  {v.marca} · {v.modelo}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#64748B]">
                  {v.placa} · {v.ano}
                </p>
              </div>

              <span
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${STATUS_CONFIG[v.status].className}`}
              >
                {STATUS_CONFIG[v.status].label}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <div className="text-xs uppercase text-[#64748B]">
                  Próx. vencimento
                </div>
                <div className="text-sm font-semibold text-[#0F172A]">
                  {v.proximoVencimento}
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-xs uppercase text-[#64748B]">
                  Pendências
                </div>
                <div className="text-sm font-semibold text-[#0F172A]">
                  {v.qtdPendencias}
                </div>
              </div>

              <div className="col-span-2 min-w-0">
                <div className="text-xs uppercase text-[#64748B]">Renavam</div>
                <div className="break-all text-sm font-semibold text-[#0F172A]">
                  {v.renavam}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#F1F5F9] pt-3">
              <Link
                href={`/veiculos/${v.id}`}
                className="text-sm font-semibold text-[#0EA5E9] hover:underline"
              >
                Ver detalhes
              </Link>

              <div className="flex items-center gap-1">{renderAcoes(v)}</div>
            </div>
          </div>
        ))}

        {filteredVehicles.length === 0 && (
          <p className="py-10 text-center text-sm text-[#64748B]">
            Nenhum veículo encontrado com esses filtros.
          </p>
        )}
      </div>

      <div className="hidden max-h-[60vh] overflow-auto rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] md:block">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-[#F8FAFC] [&_th]:shadow-[inset_0_-1px_0_#E2E8F0]">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              <th className="px-4 py-3">Veículo</th>
              <th className="px-4 py-3">Ano</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">RENAVAM</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Próximo vencimento</th>
              <th className="px-4 py-3">Pendências</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((v) => (
              <tr
                key={v.id}
                className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8FAFC]"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-[#0F172A]">
                    {v.marca} · {v.modelo}
                  </div>
                </td>
                <td className="px-4 py-3 text-[#0F172A]">{v.ano}</td>
                <td className="px-4 py-3 text-[#0F172A]">{v.placa}</td>
                <td className="px-4 py-3 text-[#0F172A]">{v.renavam}</td>
                <td className="px-4 py-3">
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${STATUS_CONFIG[v.status].className}`}
                  >
                    {STATUS_CONFIG[v.status].label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[#0F172A]">
                  {v.proximoVencimento}
                </td>
                <td className="px-4 py-3 text-[#0F172A]">{v.qtdPendencias}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/veiculos/${v.id}`}
                      className="whitespace-nowrap font-semibold text-[#0EA5E9] hover:underline"
                    >
                      Ver detalhes
                    </Link>

                    {renderAcoes(v)}
                  </div>
                </td>
              </tr>
            ))}

            {filteredVehicles.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-[#64748B]"
                >
                  Nenhum veículo encontrado com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddVehicleModal
        isOpen={modalAdicionarVeiculoAberto}
        onClose={() => setModalAdicionarVeiculoAberto(false)}
        onSave={async (novoVeiculo) => {
          await criarVeiculo(novoVeiculo);
        }}
      />

      {veiculoEditando && (
        <EditVehicleModal
          key={veiculoEditando.id}
          isOpen
          vehicle={veiculoEditando}
          onClose={() => setVeiculoEditando(null)}
          onSave={async (dados) => {
            await editarVeiculo(veiculoEditando.id, dados);
          }}
        />
      )}
    </div>
  );
}
