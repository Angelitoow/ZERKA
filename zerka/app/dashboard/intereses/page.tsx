"use client";
import Link from "next/link";
import { LuHeartOff, LuSearch } from "react-icons/lu";
import { useDemo } from "@/app/context/DemoStore";
import { hace } from "@/app/lib/utils";
import { Grid } from "@/app/components/PublicacionCard";
import TabsIntereses from "@/app/components/TabsIntereses";
import { Vacio } from "@/app/components/ui";

export default function MisIntereses() {
  const { yo, intereses, publicacion, alternarInteres } = useDemo();
  const mios = intereses.filter((i) => i.usuarioId === yo?.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const fechaDe = Object.fromEntries(mios.map((i) => [i.publicacionId, i.fecha]));
  const lista = mios.flatMap((i) => publicacion(i.publicacionId) ?? []);

  return (
    <section>
      <h1 className="titulo mb-4">Intereses</h1>
      <TabsIntereses />
      {lista.length === 0 ? (
        <Vacio icono={LuHeartOff} titulo="No hay intereses" texto="Cuando pulses «Estoy interesado» en una publicación, aparecerá aquí y el proveedor recibirá una notificación.">
          <Link href="/dashboard" className="btn btn-primario"><LuSearch /> Explorar publicaciones</Link>
        </Vacio>
      ) : (
        <Grid items={lista} acciones={(p) => (<>
          <span className="mr-auto self-center text-xs text-stone-500">Interés registrado {hace(fechaDe[p.id])}</span>
          <button onClick={() => alternarInteres(p.id)} className="btn btn-sm text-red-600 hover:bg-red-50"><LuHeartOff /> Quitar interés</button>
        </>)} />
      )}
    </section>
  );
}
