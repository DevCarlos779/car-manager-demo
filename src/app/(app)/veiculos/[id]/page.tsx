import { notFound } from "next/navigation";
import VehicleDetails from "@/src/components/app/VehiclePage";
import { buscarVeiculoPorId } from "@/src/lib/veiculos";
import { exigirUsuario } from "@/src/lib/auth";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirUsuario();

  const { id } = await params;
  const vehicle = await buscarVeiculoPorId(id);

  if (!vehicle) notFound();

  return <VehicleDetails vehicle={vehicle} />;
}
