import Home from "@/src/components/app/Home";
import { Vehicle } from "@/src/types/typeVeiculos";
import { render, screen } from "@testing-library/react";

function renderHome() {
  const vehicles: Vehicle[] = [
    {
      id: "veiculo-1",
      marca: "Honda",
      modelo: "Civic",
      ano: 2021,
      placa: "ABC1234",
      renavam: "12345678901",
      chassi: "12345678901234567",
      cor: "Preto",
      crlv: "1234567890",
      crv: "1234567890",
      obrigacoes: [
        {
          id: "obrigacao-1",
          tipo: "IPVA",
          vencimento: "10/09/2026",
          dataPagamento: null,
          status: "atrasado",
        },
      ],
    },
    {
      id: "veiculo-2",
      marca: "Toyota",
      modelo: "Corolla",
      ano: 2023,
      placa: "DEF5678",
      renavam: "98765432109",
      chassi: "9BWZZZ377VT004251",
      cor: "Prata",
      crlv: "9876543210",
      crv: "9876543211",
      obrigacoes: [
        {
          id: "obrigacao-2",
          tipo: "IPVA",
          vencimento: "10/09/2026",
          dataPagamento: null,
          status: "atrasado",
        },
        {
          id: "obrigacao-3",
          tipo: "Licenciamento",
          vencimento: "05/11/2026",
          dataPagamento: null,
          status: "em-dia",
        },
      ],
    },
  ];

  render(<Home vehicles={vehicles} />);

  return vehicles;
}

describe("Dashboad test", () => {
  test("testando se os summaryCards renderizam corretamente", () => {
    renderHome();

    expect(screen.getByText("Total de veículos")).toBeInTheDocument();
    expect(screen.getByText("Proximos", { selector: "p" })).toBeInTheDocument();
    expect(
      screen.getByText("Atrasados", { selector: "p" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Realizados", { selector: "p" }),
    ).toBeInTheDocument();
  });

  test("testando se os VehicleCards renderizam corretamente", () => {
    const vehicles = renderHome();

    vehicles.forEach((vehicle) => {
      expect(screen.getByText(`${vehicle.modelo}`)).toBeInTheDocument();
    });
  });
});
