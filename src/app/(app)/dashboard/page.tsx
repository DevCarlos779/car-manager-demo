import Home from "@/src/components/app/Home";
import { listarVeiculos } from "@/src/lib/veiculos";

export default async function Page() {
  const vehicles = await listarVeiculos();

  return <Home vehicles={vehicles} />;
}
