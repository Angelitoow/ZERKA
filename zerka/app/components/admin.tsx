"use client";
import type { ReactNode } from "react";
import { LuCheck, LuFileSpreadsheet, LuFileText, LuFlag, LuMegaphone, LuShieldCheck, LuShoppingBag, LuUsers, LuWrench, LuX } from "react-icons/lu";
import type { EstadoReporte, Reporte } from "@/app/data/demo";
import { useDemo } from "@/app/context/DemoStore";
import { descargar } from "@/app/lib/utils";

export function Encabezado({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="titulo">{titulo}</h1>{subtitulo && <p className="mt-1 text-sm text-stone-500">{subtitulo}</p>}</div>
      {children}
    </div>
  );
}

const ICONOS = [LuUsers, LuFlag, LuShieldCheck, LuShoppingBag, LuWrench, LuMegaphone];

/** Tarjetas de indicadores (RF-11), calculadas en vivo a partir del estado de la demostración. */
export function Indicadores() {
  const { estadisticas } = useDemo();
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {estadisticas.indicadores.map((i, n) => {
        const Icono = ICONOS[n];
        return (
          <div key={i.etiqueta} className="card flex flex-col gap-2 p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-lime-100 text-green-800"><Icono className="size-5" /></span>
            <p className="text-3xl font-black text-green-900">{i.valor}</p>
            <p className="text-sm leading-tight text-stone-500">{i.etiqueta}</p>
          </div>
        );
      })}
    </div>
  );
}

/** Exportación local: Excel (CSV con BOM, separador «;») y PDF mediante el diálogo de impresión del navegador. */
export function Exportar() {
  const { estadisticas: e, notificar } = useDemo();
  const sinDatos = e.indicadores.every((i) => i.valor === 0);

  function excel() {
    if (sinDatos) return notificar("No existen datos para exportar.", "error");
    const secciones = [["Indicadores", e.indicadores], ["Publicaciones por tipo", e.porTipo], ["Publicaciones por categoría", e.porCategoria],
      ["Publicaciones por barrio", e.porBarrio], ["Reportes por estado", e.porEstadoReporte]] as const;
    const csv = [`ZERKA - Estadísticas del sistema;${new Date().toLocaleString("es-CO")}`,
      ...secciones.flatMap(([titulo, filas]) => ["", titulo, ...filas.map((f) => `${f.etiqueta};${f.valor}`)])].join("\r\n");
    descargar(`zerka-estadisticas-${new Date().toISOString().slice(0, 10)}.csv`, `﻿${csv}`, "text/csv;charset=utf-8");
    notificar("Archivo para Excel generado en tu navegador.");
  }
  function pdf() {
    if (sinDatos) return notificar("No existen datos para exportar.", "error");
    notificar("En el diálogo de impresión elige «Guardar como PDF».", "info");
    setTimeout(() => window.print(), 300);
  }
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button onClick={pdf} className="btn btn-secundario"><LuFileText /> Exportar PDF</button>
      <button onClick={excel} className="btn btn-primario"><LuFileSpreadsheet /> Exportar Excel</button>
    </div>
  );
}

/** Acciones de moderación de un reporte (aprobar retira la publicación, con confirmación). */
export function AccionesReporte({ r, alHacer }: { r: Reporte; alHacer?: () => void }) {
  const { moderar, confirmar, publicacion } = useDemo();
  if (r.estado === "Aprobado" || r.estado === "Rechazado") return <span className="text-xs text-stone-400">Moderación finalizada</span>;
  async function aplicar(estado: EstadoReporte) {
    if (estado === "Aprobado" && !(await confirmar({ titulo: "¿Aprobar el reporte y retirar la publicación?", peligro: true, aceptar: "Aprobar y retirar",
      mensaje: `«${publicacion(r.publicacionId)?.titulo}» dejará de ser visible para la comunidad.` }))) return;
    moderar(r.id, estado);
    alHacer?.();
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      <button onClick={() => aplicar("Aprobado")} className="btn btn-peligro btn-sm"><LuShieldCheck /> Aprobar</button>
      <button onClick={() => aplicar("Rechazado")} className="btn btn-secundario btn-sm"><LuX /> Rechazar</button>
      {r.estado === "Pendiente" && <button onClick={() => aplicar("Revisado")} className="btn btn-suave btn-sm"><LuCheck /> Revisado</button>}
    </div>
  );
}

export function Panel({ titulo, children, accion, className = "" }: { titulo: string; children: ReactNode; accion?: ReactNode; className?: string }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-2"><h2 className="font-bold text-green-900">{titulo}</h2>{accion}</div>
      {children}
    </section>
  );
}

/** Tabla con desplazamiento horizontal propio en pantallas pequeñas (la página no se desborda). */
export function Tabla({ columnas, children }: { columnas: string[]; children: ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-marfil/70 text-xs text-green-900 uppercase">
          <tr>{columnas.map((c) => <th key={c} scope="col" className="px-4 py-3 font-bold">{c}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-stone-100 [&_td]:px-4 [&_td]:py-3">{children}</tbody>
      </table>
    </div>
  );
}
