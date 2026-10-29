import { Obrigacao } from "./typeObrigacoes";

export interface Vehicle {
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
}
