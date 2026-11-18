"use client";
import Link from "next/link";
import { LuMail, LuMapPin, LuPhone, LuUsers } from "react-icons/lu";
import { useDemo } from "@/app/context/DemoStore";
import { hace, nombreCompleto } from "@/app/lib/utils";
import TabsIntereses from "@/app/components/TabsIntereses";
import { Avatar, Estado, Vacio } from "@/app/components/ui";

export default function Interesados() {
  const { yo, publicaciones, interesados, usuario } = useDemo();
  const conInteres = publicaciones.filter((p) => p.usuarioId === yo?.id && interesados(p.id).length);
  const total = conInteres.reduce((s, p) => s + interesados(p.id).length, 0);

  return (
    <section>
      <h1 className="titulo mb-4">Intereses</h1>
      <TabsIntereses />
      {conInteres.length === 0 ? (
        <Vacio icono={LuUsers} titulo="Aún no hay interesados" texto="Cuando alguien marque interés en tus publicaciones verás aquí sus datos de contacto." />
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-stone-600"><b className="text-green-900">{total}</b> interesados en {conInteres.length} publicaciones. Datos de contacto ficticios para la demostración.</p>
          {conInteres.map((p) => (
            <div key={p.id} className="card overflow-hidden">
              <Link href={`/dashboard/publicacion/${p.id}`} className="flex items-center gap-3 border-b border-stone-100 bg-lime-50/50 p-4 hover:bg-lime-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imagenes[0]} alt="" className="size-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-green-900">{p.titulo}</p>
                  <p className="text-xs text-stone-500">{p.tipo} · {interesados(p.id).length} interesado(s)</p>
                </div>
                <Estado estado={p.estado} />
              </Link>
              <ul className="divide-y divide-stone-100">
                {interesados(p.id).map((i) => {
                  const u = usuario(i.usuarioId);
                  return (
                    <li key={u.id} className="flex flex-wrap items-center gap-3 p-4">
                      <Avatar usuario={u} />
                      <div className="min-w-40 flex-1">
                        <p className="font-semibold text-stone-800">{nombreCompleto(u)}</p>
                        <p className="flex items-center gap-1 text-xs text-stone-500"><LuMapPin /> {u.barrio}, {u.ciudad} · {hace(i.fecha)}</p>
                      </div>
                      <a href={`tel:${u.telefono}`} className="btn btn-secundario btn-sm"><LuPhone /> {u.telefono}</a>
                      <a href={`mailto:${u.correo}`} className="btn btn-secundario btn-sm"><LuMail /> Correo</a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
