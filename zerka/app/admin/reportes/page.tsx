"use client";
import Link from "next/link";
import { useState } from "react";
import { LuEye, LuShieldCheck } from "react-icons/lu";
import { UMBRAL_REPORTES, type EstadoReporte } from "@/app/data/demo";
import { useDemo } from "@/app/context/DemoStore";
import { fecha, hace, nombreCompleto } from "@/app/lib/utils";
import { AccionesReporte, Encabezado, Tabla } from "@/app/components/admin";
import { Estado, Modal, usePaginacion, Vacio } from "@/app/components/ui";

const PESTANAS: (EstadoReporte | "Todos")[] = ["Pendiente", "Revisado", "Aprobado", "Rechazado", "Todos"];

/** Consulta y moderación de reportes (RF-09). */
export default function AdminReportes() {
  const { reportes, publicacion, usuario, reportesDe } = useDemo();
  const [filtro, setFiltro] = useState<(typeof PESTANAS)[number]>("Pendiente");
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const lista = reportes.filter((r) => filtro === "Todos" || r.estado === filtro).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const { visibles, controles } = usePaginacion(lista, 10, filtro);
  const detalle = reportes.find((r) => r.id === detalleId);
  const pub = detalle && publicacion(detalle.publicacionId);

  return (
    <>
      <Encabezado titulo="Reportes" subtitulo={`Una publicación se retira automáticamente al acumular ${UMBRAL_REPORTES} reportes.`} />
      <nav className="scroll-x mb-5" aria-label="Estado del reporte">
        {PESTANAS.map((e) => (
          <button key={e} onClick={() => setFiltro(e)} aria-pressed={filtro === e}
            className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap ${filtro === e ? "bg-green-800 text-white" : "border border-green-200 bg-white text-green-900"}`}>
            {e === "Todos" ? "Todos" : `${e}s`} ({e === "Todos" ? reportes.length : reportes.filter((r) => r.estado === e).length})
          </button>
        ))}
      </nav>

      {lista.length === 0 ? (
        <Vacio icono={LuShieldCheck} titulo={filtro === "Pendiente" ? "No hay reportes pendientes" : "No existen reportes con este estado"} />
      ) : (
        <>
          <Tabla columnas={["Publicación", "Motivo", "Reportado por", "Fecha", "Acumulado", "Estado", "Acciones"]}>
            {visibles.map((r) => (
              <tr key={r.id} className="hover:bg-lime-50/40">
                <td className="max-w-56 truncate font-semibold">{publicacion(r.publicacionId)?.titulo}</td>
                <td>{r.motivo}</td>
                <td>{nombreCompleto(usuario(r.usuarioId))}</td>
                <td className="whitespace-nowrap">{hace(r.fecha)}</td>
                <td>{reportesDe(r.publicacionId).length}/{UMBRAL_REPORTES}</td>
                <td><Estado estado={r.estado} /></td>
                <td><button onClick={() => setDetalleId(r.id)} className="btn btn-secundario btn-sm"><LuEye /> Ver detalle</button></td>
              </tr>
            ))}
          </Tabla>
          {controles}
        </>
      )}

      <Modal abierto={!!detalle} onCerrar={() => setDetalleId(null)} titulo="Detalle del reporte">
        {detalle && pub && (
          <div className="space-y-4 text-sm">
            <Link href={`/dashboard/publicacion/${pub.id}`} className="flex items-center gap-3 rounded-2xl border border-stone-200 p-3 hover:bg-lime-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pub.imagenes[0]} alt="" className="size-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1"><b className="block truncate text-green-900">{pub.titulo}</b>
                <span className="text-xs text-stone-500">{pub.tipo} · {nombreCompleto(usuario(pub.usuarioId))}</span></div>
              <Estado estado={pub.estado} />
            </Link>
            <dl className="grid grid-cols-2 gap-3">
              {[["Motivo", detalle.motivo], ["Estado", <Estado key="e" estado={detalle.estado} />], ["Reportado por", nombreCompleto(usuario(detalle.usuarioId))],
                ["Fecha", fecha(detalle.fecha)], ["Reportes acumulados", `${reportesDe(pub.id).length} de ${UMBRAL_REPORTES}`], ["Revisado", detalle.revisado ? hace(detalle.revisado) : "Sin revisar"]]
                .map(([k, v]) => <div key={String(k)}><dt className="text-xs text-stone-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}
            </dl>
            <div><p className="text-xs text-stone-500">Descripción</p><p className="rounded-xl bg-stone-50 p-3">{detalle.descripcion || "El usuario no agregó una descripción."}</p></div>
            <div className="border-t border-stone-100 pt-4"><AccionesReporte r={detalle} /></div>
          </div>
        )}
      </Modal>
    </>
  );
}
