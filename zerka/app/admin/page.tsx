"use client";
import Link from "next/link";
import { LuArrowRight, LuShieldCheck } from "react-icons/lu";
import { UMBRAL_REPORTES } from "@/app/data/demo";
import { useDemo } from "@/app/context/DemoStore";
import { hace, nombreCompleto } from "@/app/lib/utils";
import { AccionesReporte, Encabezado, Exportar, Indicadores, Panel } from "@/app/components/admin";
import { Barras, Estado, Vacio } from "@/app/components/ui";

/** Inicio del administrador (mockup «Inicio del administrador»). */
export default function AdminInicio() {
  const { yo, reportes, publicaciones, publicacion, usuario, reportesDe, estadisticas } = useDemo();
  const pendientes = reportes.filter((r) => r.estado === "Pendiente").sort((a, b) => b.fecha.localeCompare(a.fecha));
  const reportadas = [...new Set(reportes.map((r) => r.publicacionId))]
    .map((id) => ({ p: publicacion(id)!, n: reportesDe(id).length })).sort((a, b) => b.n - a.n).slice(0, 5);
  const recientes = [...publicaciones].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);
  const ver = <Link href="/admin/reportes" className="btn btn-suave btn-sm">Ver todos <LuArrowRight /></Link>;

  return (
    <>
      <Encabezado titulo={`Hola, ${yo?.nombres} 👋`} subtitulo="Resumen en tiempo real de la actividad de la plataforma."><Exportar /></Encabezado>
      <Indicadores />

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel titulo={`Reportes pendientes (${pendientes.length})`} accion={ver} className="xl:col-span-2">
          {pendientes.length === 0 ? <Vacio icono={LuShieldCheck} titulo="No hay reportes pendientes" texto="¡Todo en orden! La comunidad está tranquila." /> : (
            <ul className="divide-y divide-stone-100">
              {pendientes.slice(0, 5).map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-48 flex-1">
                    <Link href={`/dashboard/publicacion/${r.publicacionId}`} className="font-semibold text-green-900 hover:underline">{publicacion(r.publicacionId)?.titulo}</Link>
                    <p className="text-xs text-stone-500">{r.motivo} · por {nombreCompleto(usuario(r.usuarioId))} · {hace(r.fecha)}</p>
                  </div>
                  <AccionesReporte r={r} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel titulo="Publicaciones activas por tipo"><Barras datos={estadisticas.porTipo} /></Panel>

        <Panel titulo="Publicaciones reportadas" accion={ver}>
          <ul className="space-y-3">
            {reportadas.map(({ p, n }) => (
              <li key={p.id} className="text-sm">
                <div className="mb-1 flex items-center justify-between gap-2"><span className="truncate font-medium">{p.titulo}</span><Estado estado={p.estado} /></div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-stone-100"><div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, (n / UMBRAL_REPORTES) * 100)}%` }} /></div>
                  <span className="text-xs text-stone-500">{n}/{UMBRAL_REPORTES}</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel titulo="Actividad reciente" accion={<Link href="/admin/publicaciones" className="btn btn-suave btn-sm">Publicaciones <LuArrowRight /></Link>} className="xl:col-span-2">
          <ul className="divide-y divide-stone-100">
            {recientes.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imagenes[0]} alt="" className="size-10 rounded-lg object-cover" />
                <p className="min-w-0 flex-1"><b className="block truncate text-stone-800">{p.titulo}</b><span className="text-xs text-stone-500">{p.tipo} · {nombreCompleto(usuario(p.usuarioId))} · {hace(p.fecha)}</span></p>
                <Estado estado={p.estado} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
