export interface Obrigacao {
  id: string;
  tipo: "IPVA" | "Licenciamento";
  vencimento: string;
  dataPagamento: string | null;
  status: "atrasado" | "em-dia";
}

