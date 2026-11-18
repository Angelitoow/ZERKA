"use client";
import Link from "next/link";
import { useState } from "react";
import { LuInbox, LuPlus, LuUsers } from "react-icons/lu";
import { useDemo } from "@/app/context/DemoStore";
import { AccionesPropias, Grid } from "@/app/components/PublicacionCard";
import { Vacio } from "@/app/components/ui";

const FILTROS = ["Todas", "Disponible", "No disponible", "Retirada"] as const;

export default function MisPublicaciones() {
  const { yo, publicaciones } = useDemo();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("Todas");
  // Orden descendente por fecha (RF-04.3)
  const mias = publicaciones.filter((p) => p.usuarioId === yo?.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const lista = mias.filter((p) => filtro === "Todas" || p.estado === filtro);

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo">Mis publicaciones</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/interesados" className="btn btn-secundario"><LuUsers /> Interesados</Link>
          <Link href="/dashboard/publicar" className="btn btn-primario"><LuPlus /> Publicar</Link>
        </div>
      </div>
      <nav className="scroll-x mb-6" aria-label="Filtrar por estado">
        {FILTROS.map((f) => (
          <button key={f} onClick={() => setFiltro(f)} aria-pressed={filtro === f}
            className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap ${filtro === f ? "bg-green-800 text-white" : "border border-green-200 bg-white text-green-900"}`}>
            {f === "Todas" ? "Todas" : f === "Retirada" ? "Retiradas" : f === "Disponible" ? "Disponibles" : "No disponibles"} ({f === "Todas" ? mias.length : mias.filter((p) => p.estado === f).length})
          </button>
        ))}
      </nav>
      {lista.length === 0 ? (
        <Vacio icono={LuInbox} titulo="No hay publicaciones" texto={mias.length ? "No tienes publicaciones con este estado." : "Aún no has publicado nada. ¡Ofrece tus productos o servicios!"}>
          <Link href="/dashboard/publicar" className="btn btn-primario"><LuPlus /> Crear publicación</Link>
        </Vacio>
      ) : (
        <Grid key={filtro} items={lista} acciones={(p) => <AccionesPropias p={p} />} />
      )}
    </section>
  );
}
