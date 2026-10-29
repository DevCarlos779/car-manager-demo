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

function montarObrigacao(
  tipo: Obrigacao["tipo"],
  dataISO: string,
  foiPago: boolean,
): Obrigacao {
  const [ano, mes, dia] = dataISO.split("-").map(Number);

  const vencimento = new Date(foiPago ? ano + 1 : ano, mes - 1, dia);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return {
    id: crypto.randomUUID(),
    tipo,
    vencimento: formatarBR(vencimento),
    dataPagamento: null,
    status: hoje > vencimento ? "atrasado" : "em-dia",
  };
}

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Omit<Vehicle, "id">) => void;
}

export default function AddVehicleModal({
  isOpen,
  onClose,
  onSave,
}: AddVehicleModalProps) {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [placa, setPlaca] = useState("");
  const [cor, setCor] = useState("");
  const [renavam, setRenavam] = useState("");
  const [ano, setAno] = useState("");
  const [crlv, setCrlv] = useState("");
  const [crv, setCrv] = useState("");
  const [pagaIPVA, setPagaIPVA] = useState<boolean | null>(null);
  const [dataIPVA, setDataIPVA] = useState("");
  const [foiPagoUltimoIPVA, setFoiPagoUltimoIPVA] = useState(false);
  const [dataLicenciamento, setDataLicenciamento] = useState("");
  const [foiPagoUltimoLicenciamento, setFoiPagoUltimoLicenciamento] =
    useState(false);

  const [erro, setErro] = useState("");

  const anoAtual = new Date().getFullYear();
  const dataMinima = `${anoAtual}-01-01`;
  const dataMaxima = `${anoAtual + 1}-12-31`;
  const dataValida = (data: string) => data >= dataMinima && data <= dataMaxima;

  function resetarFormulario() {
    setMarca("");
    setModelo("");
    setPlaca("");
    setCor("");
    setRenavam("");
    setAno("");
    setCrlv("");
    setCrv("");
    setPagaIPVA(null);
    setDataIPVA("");
    setFoiPagoUltimoIPVA(false);
    setDataLicenciamento("");
    setFoiPagoUltimoLicenciamento(false);
    setErro("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (pagaIPVA === null) {
      setErro("Informe se o carro paga IPVA.");
      return;
    }

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

    if ((pagaIPVA && !dataValida(dataIPVA)) || !dataValida(dataLicenciamento)) {
      setErro(
        `As datas de vencimento devem estar entre ${anoAtual} e ${anoAtual + 1}.`,
      );
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

    if (crlv.length > 0 && crlv.length !== 11) {
      setErro("O código CRLV deve ter 11 caracteres.");
      return;
    }

    if (crv.length > 0 && crv.length !== 11) {
      setErro("O código CRV deve ter 11 caracteres.");
      return;
    }

    const obrigacoes: Obrigacao[] = [
      ...(pagaIPVA
        ? [montarObrigacao("IPVA", dataIPVA, foiPagoUltimoIPVA)]
        : []),
      montarObrigacao(
        "Licenciamento",
        dataLicenciamento,
        foiPagoUltimoLicenciamento,
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

    resetarFormulario();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar veículo">
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

        {pagaIPVA === true && (
          <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] p-3">
            <div className="flex min-w-0 flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Vencimento do IPVA
              </label>
              <input
                required
                type="date"
                min={dataMinima}
                max={dataMaxima}
                value={dataIPVA}
                onChange={(e) => setDataIPVA(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-[#0F172A]">
                Este IPVA já foi pago?
              </p>
              <div className="flex gap-5">
                <label className={radioLabelClass}>
                  <input
                    type="radio"
                    name="foiPagoUltimoIPVA"
                    checked={foiPagoUltimoIPVA === true}
                    onChange={() => setFoiPagoUltimoIPVA(true)}
                    className="h-4 w-4 accent-[#1E3A8A]"
                  />
                  Sim
                </label>
                <label className={radioLabelClass}>
                  <input
                    type="radio"
                    name="foiPagoUltimoIPVA"
                    checked={foiPagoUltimoIPVA === false}
                    onChange={() => setFoiPagoUltimoIPVA(false)}
                    className="h-4 w-4 accent-[#1E3A8A]"
                  />
                  Não
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] p-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              Vencimento do Licenciamento
            </label>
            <input
              required
              type="date"
              min={dataMinima}
              max={dataMaxima}
              value={dataLicenciamento}
              onChange={(e) => setDataLicenciamento(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-[#0F172A]">
              Este Licenciamento já foi pago?
            </p>
            <div className="flex gap-5">
              <label className={radioLabelClass}>
                <input
                  type="radio"
                  name="foiPagoUltimoLicenciamento"
                  checked={foiPagoUltimoLicenciamento === true}
                  onChange={() => setFoiPagoUltimoLicenciamento(true)}
                  className="h-4 w-4 accent-[#1E3A8A]"
                />
                Sim
              </label>
              <label className={radioLabelClass}>
                <input
                  type="radio"
                  name="foiPagoUltimoLicenciamento"
                  checked={foiPagoUltimoLicenciamento === false}
                  onChange={() => setFoiPagoUltimoLicenciamento(false)}
                  className="h-4 w-4 accent-[#1E3A8A]"
                />
                Não
              </label>
            </div>
          </div>
        </div>

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
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}
