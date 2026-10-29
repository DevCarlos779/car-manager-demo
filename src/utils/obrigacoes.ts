// src/utils/obrigacoes.ts
import { Obrigacao } from "../types/typeObrigacoes";

export type StatusExibicao = "atrasado" | "proximo" | "em-dia";

export function parseDataBR(data: string): Date {
  const [dia, mes, ano] = data.split("/").map(Number);
  const anoCompleto = ano < 100 ? 2000 + ano : ano;
  return new Date(anoCompleto, mes - 1, dia);
}

// "atrasado" vem do banco; "proximo" é calculado pela data
export function statusExibicao(obrigacao: Obrigacao): StatusExibicao {
  if (obrigacao.status === "atrasado") return "atrasado";

  const vencimento = parseDataBR(obrigacao.vencimento);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const umMesAntes = new Date(vencimento);
  umMesAntes.setMonth(umMesAntes.getMonth() - 1);

  return hoje >= umMesAntes && hoje <= vencimento ? "proximo" : "em-dia";
}

// Atrasadas têm data no passado, então a de menor data já é a mais urgente
export function getObrigacaoMaisProxima(
  obrigacoes: Obrigacao[],
): Obrigacao | null {
  if (obrigacoes.length === 0) return null;

  return obrigacoes.reduce((maisProxima, atual) =>
    parseDataBR(atual.vencimento) < parseDataBR(maisProxima.vencimento)
      ? atual
      : maisProxima,
  );
}
