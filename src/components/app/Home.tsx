"use client";

import { useState } from "react";
import FilterButton from "./FilterButton";
import SummaryCard from "./SummaryCard";
import VehicleCard from "./VehicleCard";
import { Vehicle } from "../../types/typeVeiculos";

interface HomeProps {
  vehicles: Vehicle[];
}

type activeFilterType = "todos" | "atrasado" | "proximo" | "em-dia";

export default function Home({ vehicles }: HomeProps) {
  const [activeFilter, setActiveFilter] = useState<activeFilterType>("todos");

  const filteredVehiclesIsExpiry = vehicles.filter((vehicle) =>
    vehicle.obrigacoes.some((obrigacao) => obrigacao.status == "atrasado"),
  );

  const filteredVehiclesIsNearExpiry = vehicles.filter((vehicle) => {
    if (filteredVehiclesIsExpiry.includes(vehicle)) return false;
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

  const filteredVehiclesIsPaid = vehicles.filter(
    (vehicle) =>
      !filteredVehiclesIsExpiry.includes(vehicle) &&
      !filteredVehiclesIsNearExpiry.includes(vehicle),
  );

  const qtdVehiclesIsNearExpiry = filteredVehiclesIsNearExpiry.length;
  const qtdVehiclesIsExpiry = filteredVehiclesIsExpiry.length;
  const qtdVehiclesIsPaid = filteredVehiclesIsPaid.length;

  const filteredVehicles =
    activeFilter === "todos"
      ? vehicles
      : activeFilter === "em-dia"
        ? filteredVehiclesIsPaid
        : activeFilter === "atrasado"
          ? filteredVehiclesIsExpiry
          : filteredVehiclesIsNearExpiry;

  return (
    <div>
      <header className="mb-6 flex items-start justify-between sm:mb-8">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight text-[#0F172A] sm:text-[28px]">
            Visão geral
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Acompanhe a situação dos seus veículos
          </p>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
        <SummaryCard
          title="Total de veículos"
          value={vehicles.length}
          valueClass="text-[#0F172A]"
        />

        <SummaryCard
          title="Proximos"
          value={qtdVehiclesIsNearExpiry}
          valueClass="text-[#F59E0B]"
        />

        <SummaryCard
          title="Atrasados"
          value={qtdVehiclesIsExpiry}
          valueClass="text-[#DC2626]"
        />

        <SummaryCard
          title="Realizados"
          value={qtdVehiclesIsPaid}
          valueClass="text-[#16A34A]"
        />
      </section>

      <section>
        <div className="mb-3 sm:mb-4">
          <h2 className="text-base font-bold text-[#0F172A] sm:text-[18px]">
            Seus veículos
          </h2>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <FilterButton
            active={activeFilter === "todos"}
            onClick={() => setActiveFilter("todos")}
          >
            Todos
          </FilterButton>

          <FilterButton
            active={activeFilter === "atrasado"}
            onClick={() => setActiveFilter("atrasado")}
          >
            Atrasados
          </FilterButton>

          <FilterButton
            active={activeFilter === "proximo"}
            onClick={() => setActiveFilter("proximo")}
          >
            Próximos
          </FilterButton>

          <FilterButton
            active={activeFilter === "em-dia"}
            onClick={() => setActiveFilter("em-dia")}
          >
            Em dia
          </FilterButton>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-1 pr-2">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => {
              return <VehicleCard key={vehicle.id} vehicle={vehicle} />;
            })
          ) : (
            <p className="py-12 text-center text-sm text-[#64748B]">
              Nenhum veículo encontrado
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
