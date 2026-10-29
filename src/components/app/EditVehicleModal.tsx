"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Vehicle } from "../../types/typeVeiculos";
import { Obrigacao } from "../../types/typeObrigacoes";

const inputClass =
  "h-11 w-full min-w-0 rounded-lg border border-[#E2E8F0] px-3 text-base sm:h-10 sm:text-sm";

const radioLabelClass =
  "flex cursor-pointer items-center gap-2 py-1 text-sm text-[#0F172A]";

function formatarPlaca(valor: string) {
  return valor
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 7);
}

function formatarCodigosSeguranca(valor: string) {
  return valor
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 11);
}

function formatarRenavam(valor: string) {
  return valor.replace(/\D/g, "").slice(0, 11);
}

function formatarAno(valor: string) {
  return valor.replace(/\D/g, "").slice(0, 4);
}

function capitalizar(valor: string) {
  const limpo = valor.trimStart();
  return limpo.charAt(0).toUpperCase() + limpo.slice(1);
}

function formatarBR(data: Date): string {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${data.getFullYear()}`;
}

function brParaISO(dataBR: string): string {
  const [dia, mes, ano] = dataBR.split("/");
  const anoCompleto = ano.length === 2 ? `20${ano}` : ano;
  return `${anoCompleto}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

function atualizarObrigacao(
  original: Obrigacao | undefined,
  tipo: Obrigacao["tipo"],
  dataISO: string,
  foiPago = false,
): Obrigacao {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const vencimento = new Date(foiPago ? ano + 1 : ano, mes - 1, dia);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return {
    id: original?.id ?? crypto.randomUUID(),
    tipo,
    vencimento: formatarBR(vencimento),
    dataPagamento: original?.dataPagamento ?? null,
    status: hoje > vencimento ? "atrasado" : "em-dia",
  };
}

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Omit<Vehicle, "id">) => void;
  vehicle: Vehicle;
}

export default function EditVehicleModal({
  isOpen,
  onClose,
  onSave,
  vehicle,
}: EditVehicleModalProps) {
  const ipvaAtual = vehicle.obrigacoes.find((o) => o.tipo === "IPVA");
  const licenciamentoAtual = vehicle.obrigacoes.find(
    (o) => o.tipo === "Licenciamento",
  );

  const originalIPVA = ipvaAtual ? brParaISO(ipvaAtual.vencimento) : "";
  const originalLic = licenciamentoAtual
    ? brParaISO(licenciamentoAtual.vencimento)
    : "";

  const [marca, setMarca] = useState(vehicle.marca);
  const [modelo, setModelo] = useState(vehicle.modelo);
  const [placa, setPlaca] = useState(vehicle.placa);
  const [cor, setCor] = useState(vehicle.cor ?? "");
  const [renavam, setRenavam] = useState(vehicle.renavam);
  const [ano, setAno] = useState(String(vehicle.ano));
  const [crlv, setCrlv] = useState(vehicle.crlv ?? "");
  const [crv, setCrv] = useState(vehicle.crv ?? "");
  const [pagaIPVA, setPagaIPVA] = useState(ipvaAtual !== undefined);
  const [dataIPVA, setDataIPVA] = useState(originalIPVA);
  const [foiPagoIPVA, setFoiPagoIPVA] = useState(false);
  const ipvaNovo = pagaIPVA && ipvaAtual === undefined;
  const [dataLicenciamento, setDataLicenciamento] = useState(originalLic);

  const [erro, setErro] = useState("");

  const anoAtual = new Date().getFullYear();
  const dataMinimaPadrao = `${anoAtual}-01-01`;
  const dataMaxima = `${anoAtual + 1}-12-31`;

  const menorData = (original: string) =>
    original && original < dataMinimaPadrao ? original : dataMinimaPadrao;

  const dataValida = (data: string, original: string) =>
    data >= menorData(original) && data <= dataMaxima;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !marca.trim() ||
      !modelo.trim() ||
      !placa ||
      !renavam ||
      !ano ||
      !dataLicenciamento ||
      (pagaIPVA && !dataIPVA)
    ) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (
      !dataValida(dataLicenciamento, originalLic) ||
      (pagaIPVA && !dataValida(dataIPVA, originalIPVA))
    ) {
      setErro(`As datas de vencimento devem ser até ${anoAtual + 1}.`);
      return;
    }

    if (placa.length !== 7) {
      setErro("A placa deve ter 7 caracteres.");
      return;
    }

    if (renavam.length < 9) {
      setErro("Renavam inválido.");
      return;
    }

    if (ano.length !== 4) {
      setErro("Informe o ano com 4 dígitos.");
      return;
    }

    const obrigacoes: Obrigacao[] = [
      ...(pagaIPVA
        ? [
            atualizarObrigacao(
              ipvaAtual,
              "IPVA",
              dataIPVA,
              ipvaNovo && foiPagoIPVA,
            ),
          ]
        : []),
      atualizarObrigacao(
        licenciamentoAtual,
        "Licenciamento",
        dataLicenciamento,
      ),
    ];

    onSave({
      marca,
      modelo,
      placa,
      renavam,
      ano: Number(ano),
      cor,
      crlv,
      crv,
      obrigacoes,
    } as Omit<Vehicle, "id">);

    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar veículo">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {erro && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[#DC2626]"
          >
            {erro}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            value={marca}
            onChange={(e) => setMarca(capitalizar(e.target.value))}
            placeholder="Marca"
            className={inputClass}
          />
          <input
            required
            value={modelo}
            onChange={(e) => setModelo(capitalizar(e.target.value))}
            placeholder="Modelo"
            className={inputClass}
          />
          <input
            required
            value={placa}
            onChange={(e) => setPlaca(formatarPlaca(e.target.value))}
            maxLength={7}
            autoCapitalize="characters"
            placeholder="Placa"
            className={inputClass}
          />
          <input
            required
            value={renavam}
            onChange={(e) => setRenavam(formatarRenavam(e.target.value))}
            inputMode="numeric"
            maxLength={11}
            placeholder="Renavam"
            className={inputClass}
          />
          <input
            value={cor}
            onChange={(e) => setCor(capitalizar(e.target.value))}
            placeholder="Cor"
            className={inputClass}
          />
          <input
            required
            value={ano}
            onChange={(e) => setAno(formatarAno(e.target.value))}
            inputMode="numeric"
            maxLength={4}
            placeholder="Ano"
            className={inputClass}
          />
          <input
            value={crlv}
            onChange={(e) => setCrlv(formatarCodigosSeguranca(e.target.value))}
            maxLength={11}
            autoCapitalize="characters"
            placeholder="Código CRLV"
            className={inputClass}
          />
          <input
            value={crv}
            onChange={(e) => setCrv(formatarCodigosSeguranca(e.target.value))}
            maxLength={11}
            autoCapitalize="characters"
            placeholder="Código CRV"
            className={inputClass}
          />
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-[#0F172A]">Paga IPVA?</p>
          <div className="flex gap-5">
            <label className={radioLabelClass}>
              <input
                type="radio"
                name="pagaIPVA"
                checked={pagaIPVA === true}
                onChange={() => setPagaIPVA(true)}
                className="h-4 w-4 accent-[#1E3A8A]"
              />
              Sim
            </label>
            <label className={radioLabelClass}>
              <input
                type="radio"
                name="pagaIPVA"
                checked={pagaIPVA === false}
                onChange={() => setPagaIPVA(false)}
                className="h-4 w-4 accent-[#1E3A8A]"
              />
              Não
            </label>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 gap-3 ${pagaIPVA ? "sm:grid-cols-2" : ""}`}
        >
          {pagaIPVA && (
            <div className="flex min-w-0 flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Vencimento do IPVA
              </label>
              <input
                required
                type="date"
                min={menorData(originalIPVA)}
                max={dataMaxima}
                value={dataIPVA}
                onChange={(e) => setDataIPVA(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              Vencimento do Licenciamento
            </label>
            <input
              required
              type="date"
              min={menorData(originalLic)}
              max={dataMaxima}
              value={dataLicenciamento}
              onChange={(e) => setDataLicenciamento(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {ipvaNovo && (
          <div>
            <p className="mb-1 text-sm font-medium text-[#0F172A]">
              Este IPVA já foi pago?
            </p>
            <div className="flex gap-5">
              <label className={radioLabelClass}>
                <input
                  type="radio"
                  name="foiPagoIPVA"
                  checked={foiPagoIPVA === true}
                  onChange={() => setFoiPagoIPVA(true)}
                  className="h-4 w-4 accent-[#1E3A8A]"
                />
                Sim
              </label>
              <label className={radioLabelClass}>
                <input
                  type="radio"
                  name="foiPagoIPVA"
                  checked={foiPagoIPVA === false}
                  onChange={() => setFoiPagoIPVA(false)}
                  className="h-4 w-4 accent-[#1E3A8A]"
                />
                Não
              </label>
            </div>
          </div>
        )}

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-11 cursor-pointer rounded-lg border border-[#E2E8F0] px-5 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] sm:h-10"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-11 cursor-pointer rounded-lg bg-[#1E3A8A] px-5 text-sm font-semibold text-white hover:bg-[#1E3A8A]/90 sm:h-10"
          >
            Salvar alterações
          </button>
        </div>
      </form>
    </Modal>
  );
}
