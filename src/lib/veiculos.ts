import { adminDb } from "./firebaseAdmin";
import { exigirUsuario } from "./auth";
import { Vehicle } from "../types/typeVeiculos";
import { Obrigacao } from "../types/typeObrigacoes";

export async function listarVeiculos(): Promise<Vehicle[]> {
  await exigirUsuario();

  const [veiculosSnap, obrigacoesSnap] = await Promise.all([
    adminDb.collection("veiculos").get(),
    adminDb.collectionGroup("obrigacoes").get(),
  ]);

  const obrigacoesPorVeiculo = new Map<string, Obrigacao[]>();

  obrigacoesSnap.docs.forEach((o) => {
    const veiculoId = o.ref.parent.parent?.id;
    if (!veiculoId) return;

    const lista = obrigacoesPorVeiculo.get(veiculoId) ?? [];
    lista.push({ id: o.id, ...(o.data() as Omit<Obrigacao, "id">) });
    obrigacoesPorVeiculo.set(veiculoId, lista);
  });

  return veiculosSnap.docs.map((v) => ({
    id: v.id,
    ...(v.data() as Omit<Vehicle, "id" | "obrigacoes">),
    obrigacoes: obrigacoesPorVeiculo.get(v.id) ?? [],
  }));
}

export async function buscarVeiculoPorId(id: string): Promise<Vehicle | null> {
  await exigirUsuario();

  const veiculoRef = adminDb.collection("veiculos").doc(id);
  const snap = await veiculoRef.get();

  if (!snap.exists) return null;

  const obrigacoesSnap = await veiculoRef.collection("obrigacoes").get();

  const obrigacoes: Obrigacao[] = obrigacoesSnap.docs.map((o) => ({
    id: o.id,
    ...(o.data() as Omit<Obrigacao, "id">),
  }));

  return {
    id: snap.id,
    ...(snap.data() as Omit<Vehicle, "id" | "obrigacoes">),
    obrigacoes,
  };
}
