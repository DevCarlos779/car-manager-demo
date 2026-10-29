// src/app/actions/veiculos.ts
"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/src/lib/firebaseAdmin";
import { exigirUsuario } from "@/src/lib/auth";
import { Vehicle } from "@/src/types/typeVeiculos";
import { Obrigacao } from "@/src/types/typeObrigacoes";

function formatarBR(data: Date): string {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${data.getFullYear()}`;
}

function revalidarTelas(vehicleId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/veiculos");
  if (vehicleId) revalidatePath(`/veiculos/${vehicleId}`);
}

export async function criarVeiculo(novo: Omit<Vehicle, "id">) {
  await exigirUsuario();

  const { obrigacoes, ...dadosVeiculo } = novo;

  const batch = adminDb.batch();
  const veiculoRef = adminDb.collection("veiculos").doc();
  batch.set(veiculoRef, dadosVeiculo);

  for (const o of obrigacoes) {
    const { id: _idLocal, ...dados } = o;
    batch.set(veiculoRef.collection("obrigacoes").doc(), dados);
  }

  await batch.commit();
  revalidarTelas();
}

export async function editarVeiculo(
  vehicleId: string,
  dados: Omit<Vehicle, "id">,
) {
  await exigirUsuario();

  const { obrigacoes, ...dadosVeiculo } = dados;

  const veiculoRef = adminDb.collection("veiculos").doc(vehicleId);
  const obrigacoesRef = veiculoRef.collection("obrigacoes");
  const existentesSnap = await obrigacoesRef.get();

  const existentesPorTipo = new Map(
    existentesSnap.docs.map((d) => [d.data().tipo as string, d.ref] as const),
  );

  const batch = adminDb.batch();

  batch.update(veiculoRef, dadosVeiculo);

  for (const o of obrigacoes) {
    const { id: _idDoCliente, ...dadosObrigacao } = o;
    const refExistente = existentesPorTipo.get(o.tipo);

    if (refExistente) {
      batch.update(refExistente, dadosObrigacao);
      existentesPorTipo.delete(o.tipo);
    } else {
      batch.set(obrigacoesRef.doc(), dadosObrigacao);
    }
  }

  existentesPorTipo.forEach((ref) => batch.delete(ref));

  await batch.commit();
  revalidarTelas(vehicleId);
}

export async function excluirVeiculo(vehicleId: string) {
  await exigirUsuario();

  const veiculoRef = adminDb.collection("veiculos").doc(vehicleId);
  const obrigacoesSnap = await veiculoRef.collection("obrigacoes").get();

  const batch = adminDb.batch();
  obrigacoesSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(veiculoRef);

  await batch.commit();
  revalidarTelas();
}

export async function marcarComoPago(vehicleId: string, obrigacaoId: string) {
  await exigirUsuario();

  const ref = adminDb
    .collection("veiculos")
    .doc(vehicleId)
    .collection("obrigacoes")
    .doc(obrigacaoId);

  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error("Obrigação não encontrada");
  }

  const atual = snap.data() as Omit<Obrigacao, "id">;

  const [dia, mes, ano] = atual.vencimento.split("/").map(Number);
  const anoCompleto = ano < 100 ? 2000 + ano : ano;
  const novoVencimento = new Date(anoCompleto + 1, mes - 1, dia);

  await ref.update({
    dataPagamento: formatarBR(new Date()),
    vencimento: formatarBR(novoVencimento),
    status: "em-dia",
  });

  revalidarTelas(vehicleId);
}
