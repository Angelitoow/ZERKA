"use client";
import Link from "next/link";
import { useState } from "react";
import { LuEye, LuRotateCcw, LuSearchX, LuTrash2 } from "react-icons/lu";
import { TIPOS, UMBRAL_REPORTES, type Publicacion } from "@/app/data/demo";
import { useDemo } from "@/app/context/DemoStore";
import { fecha, nombreCompleto } from "@/app/lib/utils";
import { Encabezado, Tabla } from "@/app/components/admin";
import { Estado, usePaginacion, Vacio } from "@/app/components/ui";

export default function AdminPublicaciones() {
  const { publicaciones, usuario, interesados, reportesDe, cambiarEstado, confirmar, notificar } = useDemo();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const lista = publicaciones
    .filter((p) => (!tipo || p.tipo === tipo) && (!estado || p.estado === estado) && `${p.titulo} ${nombreCompleto(usuario(p.usuarioId))}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  const { visibles, controles } = usePaginacion(lista, 10, [q, tipo, estado].join("|"));

  async function retirar(p: Publicacion) {
    if (!(await confirmar({ titulo: "¿Retirar esta publicación?", mensaje: `«${p.titulo}» dejará de mostrarse en la plataforma.`, aceptar: "Retirar", peligro: true }))) return;
    cambiarEstado(p.id, "Retirada", "Retirada por moderación");
    notificar("Publicación retirada por moderación.");
  }

  return (
    <>
      <Encabezado titulo="Publicaciones" subtitulo={`${lista.length} de ${publicaciones.length} publicaciones`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título o autor..." className="input max-w-xs" aria-label="Buscar" />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="input w-auto" aria-label="Tipo">
          <option value="">Todos los tipos</option>{TIPOS.map((t) => <option key={t.tipo}>{t.tipo}</option>)}
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="input w-auto" aria-label="Estado">
          <option value="">Todos los estados</option>{["Disponible", "No disponible", "Retirada"].map((e) => <option key={e}>{e}</option>)}
        </select>
      </div>
      {lista.length === 0 ? <Vacio icono={LuSearchX} titulo="No existen datos para mostrar" texto="Ninguna publicación coincide con los filtros." /> : (
        <>
          <Tabla columnas={["Publicación", "Tipo", "Categoría", "Autor", "Interesados", "Reportes", "Estado", "Acciones"]}>
            {visibles.map((p) => (
              <tr key={p.id} className="hover:bg-lime-50/40">
                <td><div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imagenes[0]} alt="" className="size-10 rounded-lg object-cover" />
                  <div><b className="block max-w-56 truncate">{p.titulo}</b><span className="text-xs text-stone-500">{p.barrio} · {fecha(p.fecha)}</span></div>
                </div></td>
                <td>{p.tipo}</td>
                <td>{p.categoria}</td>
                <td>{nombreCompleto(usuario(p.usuarioId))}</td>
                <td>{interesados(p.id).length}</td>
                <td className={reportesDe(p.id).length ? "font-bold text-red-600" : ""}>{reportesDe(p.id).length}/{UMBRAL_REPORTES}</td>
                <td><Estado estado={p.estado} /></td>
                <td><div className="flex gap-1.5">
                  <Link href={`/dashboard/publicacion/${p.id}`} className="btn btn-secundario btn-sm" aria-label="Ver detalle"><LuEye /></Link>
                  {p.estado === "Retirada"
                    ? <button onClick={() => { cambiarEstado(p.id, "Disponible"); notificar("Publicación restaurada."); }} className="btn btn-secundario btn-sm"><LuRotateCcw /> Restaurar</button>
                    : <button onClick={() => retirar(p)} className="btn btn-sm text-red-600 hover:bg-red-50"><LuTrash2 /> Retirar</button>}
                </div></td>
              </tr>
            ))}
          </Tabla>
          {controles}
        </>
      )}
    </>
  );
}
