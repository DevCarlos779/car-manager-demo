import Vehicles from "@/src/components/app/Vehicles";
import { listarVeiculos } from "@/src/lib/veiculos";

export default async function Page() {
  const vehicles = await listarVeiculos();

  return <Vehicles vehicles={vehicles} />;
}
